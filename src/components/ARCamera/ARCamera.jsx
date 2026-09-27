import { useEffect, useRef, useState, useCallback } from 'react';
import { initHandTracker, detectForVideo, disposeHandTracker } from '../../ar/handTracker';
import { estimateHandNailRects } from '../../ar/nailGeometry';
import { createSmoother } from '../../ar/coordinateSmoothing';
import { drawNailDesign } from '../../ar/nailRenderer';

const DETECTION_INTERVAL_MS = 55;

export default function ARCamera({ design }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const smootherRef = useRef(createSmoother({ minCutoff: 1.2, beta: 0.4, dCutoff: 1.0 }));
  const facingModeRef = useRef('environment');
  const landmarksRef = useRef([]);
  const lastDetectionAtRef = useRef(0);

  const [status, setStatus] = useState('idle');
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraName, setCameraName] = useState('Cámara trasera');
  const [manualAdjust, setManualAdjust] = useState({
    scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1
  });
  const manualAdjustRef = useRef(manualAdjust);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { manualAdjustRef.current = manualAdjust; }, [manualAdjust]);
  useEffect(() => { facingModeRef.current = facingMode; }, [facingMode]);

  const stopCamera = useCallback((disposeTracker = true) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    landmarksRef.current = [];
    lastDetectionAtRef.current = 0;
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
          facingMode: { ideal: requestedMode },
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

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 960;
      canvas.height = video.videoHeight || 540;

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
        if (now - lastDetectionAtRef.current >= DETECTION_INTERVAL_MS) {
          const result = detectForVideo(video, now);
          landmarksRef.current = result.landmarks || [];
          lastDetectionAtRef.current = now;
          if (!landmarksRef.current.length) setStatus('no-hand');
          else setStatus('running');
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        landmarksRef.current.forEach((landmarks) => {
          const rectsRaw = estimateHandNailRects(landmarks, design, {
            width: canvas.width,
            height: canvas.height
          });

          for (const nail of design.nails) {
            const smoothed = smootherRef.current.smooth(nail.finger, rectsRaw[nail.finger], now);
            if (!smoothed) continue;
            const adjusted = applyManualAdjust(smoothed, manualAdjustRef.current, canvas);
            drawNailDesign(ctx, adjusted, nail, manualAdjustRef.current.opacity);
          }
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick(performance.now());
  }

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
      <div className="ar-camera__viewport">
        <video ref={videoRef} playsInline muted style={{ display: status === 'idle' ? 'none' : 'block' }} />
        <canvas ref={canvasRef} className="ar-overlay" />
        {status === 'no-hand' && <div className="ar-hint">Acerca la mano a la cámara.</div>}
        {status === 'loading' && <div className="ar-hint">Preparando cámara…</div>}
        {status === 'error' && <div className="ar-hint ar-hint--error">{errorMsg}</div>}

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
