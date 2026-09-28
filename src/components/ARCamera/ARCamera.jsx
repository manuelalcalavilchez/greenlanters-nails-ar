import { useEffect, useRef, useState, useCallback } from 'react';
import { initHandTracker, detectForVideo, disposeHandTracker, resolveHandedness } from '../../ar/handTracker';
import { estimateHandNailRects } from '../../ar/nailGeometry';
import { createSmoother } from '../../ar/coordinateSmoothing';
import { drawNailDesign } from '../../ar/nailRenderer';
import { mapLandmarksToCover } from '../../ar/videoMapping';

const DETECTION_INTERVAL_MS = 55;

export default function ARCamera({ design, preferredHand }) {
  const trackedHand = preferredHand || design?.hand || 'right';
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const smootherRef = useRef(createSmoother({ minCutoff: 1.2, beta: 0.4, dCutoff: 1.0 }));
  const facingModeRef = useRef('environment');
  const landmarksRef = useRef([]);
  const handednessRef = useRef([]);
  const lastDetectionAtRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);

  const [status, setStatus] = useState('idle');
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraName, setCameraName] = useState('Cámara trasera');
  const [manualAdjust, setManualAdjust] = useState({
    scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1
  });
  const manualAdjustRef = useRef(manualAdjust);
  const [errorMsg, setErrorMsg] = useState('');
  const debugEnabled = new URLSearchParams(window.location.search).get('debug') === '1';
  const [debugInfo, setDebugInfo] = useState({ hands: 0, chosen: -1, rects: 0, video: '0x0', canvas: '0x0' });

  useEffect(() => { manualAdjustRef.current = manualAdjust; }, [manualAdjust]);
  useEffect(() => { facingModeRef.current = facingMode; }, [facingMode]);

  const stopCamera = useCallback((disposeTracker = true) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    landmarksRef.current = [];
    handednessRef.current = [];
    lastDetectionAtRef.current = 0;
    lastVideoTimeRef.current = -1;
    smootherRef.current.reset();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (disposeTracker) disposeHandTracker();
  }, []);

  const getVideoDevices = useCallback(async () =>
    (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput'), []);

  const startCamera = useCallback(async (requestedMode = facingModeRef.current) => {
    setStatus('loading');
    setErrorMsg('');

    try {
      stopCamera(false);
      await initHandTracker();

      const devices = await getVideoDevices();
      const labelled = devices.filter((device) => device.label);
      let constraints = {
        video: {
          facingMode: { exact: requestedMode },
          width: { ideal: 960 },
          height: { ideal: 540 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: false
      };

      if (labelled.length > 1) {
        const regex = requestedMode === 'environment'
          ? /back|rear|environment|trasera|posterior/i
          : /front|user|facetime|frontal|delantera/i;
        const matching = labelled.find((device) => regex.test(device.label));
        if (matching) {
          constraints.video = {
            deviceId: { exact: matching.deviceId },
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 30, max: 30 }
          };
        }
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: requestedMode },
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 30, max: 30 }
          },
          audio: false
        });
      }

      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings?.() || {};
      const actualMode = settings.facingMode || requestedMode;
      facingModeRef.current = actualMode;
      setFacingMode(actualMode);
      setCameraName(actualMode === 'environment' ? 'Cámara trasera' : 'Cámara frontal');

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      resizeOverlayCanvas();

      setStatus('running');
      renderLoop();
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.name === 'NotAllowedError'
        ? 'Permiso de cámara denegado. Actívalo en los ajustes del navegador.'
        : 'No se pudo acceder a la cámara. Prueba de nuevo o cambia el permiso de cámara.');
    }
  }, [getVideoDevices, stopCamera]);

  function renderLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');

    function tick(now) {
      if (video.readyState >= 2) {
        if (
          now - lastDetectionAtRef.current >= DETECTION_INTERVAL_MS
          && video.currentTime !== lastVideoTimeRef.current
        ) {
          try {
            const videoTimeMs = video.currentTime * 1000;
            const result = detectForVideo(video, videoTimeMs);
            landmarksRef.current = result.landmarks || [];
            handednessRef.current = result.handedness || result.handednesses || [];
            lastVideoTimeRef.current = video.currentTime;
            lastDetectionAtRef.current = now;
            if (!landmarksRef.current.length) setStatus('no-hand');
            else setStatus('running');
          } catch (detectionError) {
            console.error('Error detectando la mano:', detectionError);
            lastDetectionAtRef.current = now;
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // BUG PRINCIPAL DE ALINEACIÓN: con numHands=2, antes se iteraba con
        // .forEach sobre TODAS las manos detectadas y se aplicaba el mismo
        // diseño a cada una, pero el suavizador One-Euro (coordinateSmoothing.js)
        // solo indexa su estado por nombre de dedo ('thumb', 'index'...), no
        // por mano. Si aparecía una segunda mano (real o un falso positivo
        // momentáneo de MediaPipe en el fondo), su posición sobrescribía cada
        // frame el mismo estado del filtro que la mano correcta, haciendo que
        // las uñas saltasen o quedasen desplazadas de la uña real.
        // El diseño (design.hand) siempre está pensado para UNA sola mano, así
        // que ahora seleccionamos, de entre las manos detectadas, la que
        // corresponde a esa mano (usando la handedness que ya devuelve
        // MediaPipe, corregida por espejo si la cámara es frontal) y solo esa
        // se rastrea y suaviza. Si ninguna coincide (fallo de clasificación),
        // usamos la primera mano detectada como fallback en vez de mezclar
        // varias.
        const hands = landmarksRef.current;
        const handednessResults = handednessRef.current;
        const isFrontCamera = facingModeRef.current === 'user';
        let chosenIndex = hands.length ? 0 : -1;
        for (let i = 0; i < hands.length; i += 1) {
          const label = handednessResults[i]?.[0]?.categoryName;
          const resolved = label ? resolveHandedness(label, isFrontCamera) : null;
          if (resolved === trackedHand) {
            chosenIndex = i;
            break;
          }
        }
        const landmarks = chosenIndex >= 0 ? hands[chosenIndex] : null;

        if (landmarks) {
          // El vídeo usa object-fit: cover dentro de un viewport 3:4, por lo
          // que las coordenadas normalizadas de MediaPipe no coinciden con
          // el canvas original. Las mapeamos al área visible.
          const mappedLandmarks = mapLandmarksToCover(
            landmarks,
            video.videoWidth,
            video.videoHeight,
            canvas.width,
            canvas.height,
          );
          const rectsRaw = estimateHandNailRects(mappedLandmarks, design, {
            width: canvas.width,
            height: canvas.height
          });

          if (debugEnabled) {
            setDebugInfo({
              hands: hands.length,
              chosen: chosenIndex,
              rects: Object.values(rectsRaw || {}).filter(Boolean).length,
              video: video.videoWidth + 'x' + video.videoHeight,
              canvas: canvas.width + 'x' + canvas.height,
            });
            ctx.save();
            ctx.fillStyle = 'rgba(255,0,0,.85)';
            for (const point of mappedLandmarks) {
              ctx.beginPath(); ctx.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
          }

          for (const nail of design.nails) {
            const smoothed = smootherRef.current.smooth(nail.finger, rectsRaw[nail.finger], now);
            if (!smoothed) continue;
            const adjusted = applyManualAdjust(smoothed, manualAdjustRef.current, canvas);
            drawNailDesign(ctx, adjusted, nail, manualAdjustRef.current.opacity);
          }
        } else {
          if (debugEnabled) setDebugInfo({ hands: hands.length, chosen: -1, rects: 0, video: video.videoWidth + 'x' + video.videoHeight, canvas: canvas.width + 'x' + canvas.height });
          // Sin mano rastreada este frame: limpiamos el estado del suavizador
          // para que, cuando la mano reaparezca, no arrastre un salto de
          // tiempo (dt) enorme desde el último dato válido.
          for (const nail of design.nails) {
            smootherRef.current.smooth(nail.finger, null, now);
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick(performance.now());
  }

  function resizeOverlayCanvas() {
    const canvas = canvasRef.current;
    const viewport = viewportRef.current;
    if (!canvas || !viewport) return;
    const rect = viewport.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
  }

  useEffect(() => {
    const handleResize = () => resizeOverlayCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => () => stopCamera(true), [stopCamera]);

  async function toggleFacing() {
    const nextMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = nextMode;
    setFacingMode(nextMode);
    await startCamera(nextMode);
  }

  function captureScreenshot() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');
    ctx.drawImage(video, 0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    return out.toDataURL('image/png');
  }

  function handleCaptureAndShare() {
    const dataUrl = captureScreenshot();
    const link = document.createElement('a');
    link.download = 'diseno-unas.png';
    link.href = dataUrl;
    link.click();
    if (navigator.share) {
      fetch(dataUrl).then((response) => response.blob()).then((blob) => {
        const file = new File([blob], 'diseno-unas.png', { type: 'image/png' });
        navigator.share({ files: [file], title: 'Mi diseño de uñas' }).catch(() => {});
      });
    }
  }

  return (
    <div className="ar-camera">
      <div ref={viewportRef} className="ar-camera__viewport">
        <video ref={videoRef} playsInline muted style={{ display: status === 'idle' ? 'none' : 'block' }} />
        <canvas ref={canvasRef} className="ar-overlay" />
        {status === 'no-hand' && <div className="ar-hint">Acerca la mano a la cámara.</div>}
        {status === 'loading' && <div className="ar-hint">Preparando cámara…</div>}
        {status === 'error' && <div className="ar-hint ar-hint--error">{errorMsg}</div>}
        {debugEnabled && <div style={{position:'absolute',zIndex:10,left:8,top:8,padding:'6px 8px',background:'rgba(0,0,0,.72)',color:'#fff',font:'12px monospace',borderRadius:6,pointerEvents:'none'}}>AR debug ? manos {debugInfo.hands} ? elegida {debugInfo.chosen} ? u?as {debugInfo.rects}<br/>{debugInfo.video} ? {debugInfo.canvas}</div>}

        {status !== 'idle' && status !== 'error' && (
          <div className="ar-live-adjust">
            <label>
              <span>X <b>{manualAdjust.offsetX}</b></span>
              <input aria-label="Ajuste horizontal" type="range" min="-12" max="12" step="0.5" value={manualAdjust.offsetX}
                onChange={(e) => setManualAdjust((a) => ({ ...a, offsetX: Number(e.target.value) }))} />
            </label>
            <label>
              <span>Y <b>{manualAdjust.offsetY}</b></span>
              <input aria-label="Ajuste vertical" type="range" min="-12" max="12" step="0.5" value={manualAdjust.offsetY}
                onChange={(e) => setManualAdjust((a) => ({ ...a, offsetY: Number(e.target.value) }))} />
            </label>
          </div>
        )}
      </div>

      {status === 'idle' && (
        <button type="button" className="primary ar-start-button" onClick={() => startCamera('environment')}>
          Activar cámara trasera
        </button>
      )}

      {status !== 'idle' && (
        <div className="ar-controls">
          <div className="ar-camera-actions">
            <button type="button" className="primary ar-camera-switch" onClick={toggleFacing} disabled={status === 'loading'}>
              {status === 'loading' ? 'Cambiando…' : 'Cambiar a ' + (facingMode === 'user' ? 'trasera' : 'frontal')}
            </button>
            <button type="button" onClick={handleCaptureAndShare}>Capturar</button>
          </div>
          <span className="ar-camera-current">{cameraName} · ajuste automático activo</span>

          <details className="ar-fine-tune">
            <summary>Ajuste fino</summary>
            <label>Tamaño
              <input type="range" min="0.75" max="1.25" step="0.01" value={manualAdjust.scale}
                onChange={(e) => setManualAdjust((a) => ({ ...a, scale: Number(e.target.value) }))} />
            </label>
            <label>Rotación
              <input type="range" min="-20" max="20" step="0.5" value={manualAdjust.rotation}
                onChange={(e) => setManualAdjust((a) => ({ ...a, rotation: Number(e.target.value) }))} />
            </label>
            <label>Transparencia
              <input type="range" min="0.5" max="1" step="0.05" value={manualAdjust.opacity}
                onChange={(e) => setManualAdjust((a) => ({ ...a, opacity: Number(e.target.value) }))} />
            </label>
          </details>
        </div>
      )}
    </div>
  );
}

function applyManualAdjust(rect, adjust, canvas) {
  const scale = adjust.scale;
  const contour = rect.contour
    ? Object.fromEntries(
        Object.entries(rect.contour).map(([key, value]) => (
          key === 'cuticleCurve'
            ? [key, value * scale]
            : [key, { x: value.x * scale, y: value.y * scale }]
        )),
      )
    : rect.contour;

  return {
    ...rect,
    x: rect.x + (adjust.offsetX / 100) * canvas.width,
    y: rect.y + (adjust.offsetY / 100) * canvas.height,
    width: rect.width * scale,
    height: rect.height * scale,
    angle: rect.angle + (adjust.rotation * Math.PI) / 180,
    contour,
  };
}
