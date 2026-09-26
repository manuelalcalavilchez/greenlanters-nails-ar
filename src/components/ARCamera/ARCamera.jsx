import { useEffect, useRef, useState, useCallback } from 'react';
import {
  initHandTracker,
  detectForVideo,
  disposeHandTracker,
  resolveHandedness,
} from '../../ar/handTracker';
import { estimateHandNailRects } from '../../ar/nailGeometry';
import { createSmoother } from '../../ar/coordinateSmoothing';
import { drawNailDesign } from '../../ar/nailRenderer';

/**
 * Vista de prueba virtual (try-on) con cámara real + overlay de uñas.
 *
 * Props:
 *  - design: NailDesign actual (ver nailPatterns.js)
 *  - preferredHand: 'left' | 'right' — qué mano del diseño mostrar cuando se
 *    detecta una mano en cámara (una persona suele probarse una mano a la vez)
 */
export default function ARCamera({ design, preferredHand = 'right' }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const smootherRef = useRef(createSmoother(0.35));
  const rafRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle | loading | running | no-hand | error
  const [facingMode, setFacingMode] = useState('user'); // 'user' = frontal, 'environment' = trasera
  const [manualAdjust, setManualAdjust] = useState({ scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 });
  const [errorMsg, setErrorMsg] = useState('');

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    disposeHandTracker();
  }, []);

  const startCamera = useCallback(async () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      await initHandTracker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      setStatus('running');
      renderLoop();
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Actívalo en los ajustes del navegador.'
          : 'No se pudo acceder a la cámara.'
      );
    }
  }, [facingMode]);

  function renderLoop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');

    function tick() {
      if (video.readyState >= 2) {
        const result = detectForVideo(video, performance.now());
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!result.landmarks || result.landmarks.length === 0) {
          setStatus('no-hand');
        } else {
          setStatus('running');
          result.landmarks.forEach((landmarks, i) => {
            const handednessLabel = result.handedness?.[i]?.[0]?.categoryName;
            const hand = resolveHandedness(handednessLabel, facingMode === 'user');

            // Solo dibujamos el diseño de la mano que coincide con la mano
            // detectada (o preferredHand si el diseño no distingue).
            if (design.hand && design.hand !== hand) return;

            const rectsRaw = estimateHandNailRects(landmarks, design, {
              width: canvas.width,
              height: canvas.height,
            });

            for (const nail of design.nails) {
              const smoothed = smootherRef.current.smooth(nail.finger, rectsRaw[nail.finger]);
              if (!smoothed) continue;
              const adjusted = applyManualAdjust(smoothed, manualAdjust, canvas);
              drawNailDesign(ctx, adjusted, nail, manualAdjust.opacity);
            }
          });
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
  }

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleFacing() {
    stopCamera();
    setFacingMode((f) => (f === 'user' ? 'environment' : 'user'));
  }

  function captureScreenshot() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d');
    // Componer vídeo + overlay. Nota de privacidad: esto SÍ captura la mano
    // real de la usuaria. Solo ocurre si ella pulsa "Capturar" explícitamente.
    ctx.drawImage(video, 0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0);
    return out.toDataURL('image/png');
  }

  function handleCaptureAndShare() {
    const dataUrl = captureScreenshot();
    const link = document.createElement('a');
    link.download = 'diseno-uñas.png';
    link.href = dataUrl;
    link.click();
    // Compartir por WhatsApp: usar Web Share API si está disponible (móvil);
    // fallback a wa.me solo con texto (no se puede adjuntar imagen por URL).
    if (navigator.share) {
      fetch(dataUrl)
        .then((r) => r.blob())
        .then((blob) => {
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
        {status === 'no-hand' && <div className="ar-hint">No se detecta ninguna mano. Acércala a la cámara.</div>}
        {status === 'error' && <div className="ar-hint ar-hint--error">{errorMsg}</div>}
      </div>

      {status === 'idle' && (
        <button type="button" className="primary" onClick={startCamera}>Activar cámara</button>
      )}

      {status !== 'idle' && (
        <div className="ar-controls">
          <button type="button" onClick={toggleFacing}>Cambiar cámara</button>
          <button type="button" onClick={handleCaptureAndShare}>Capturar / Compartir</button>

          <label>Tamaño
            <input type="range" min="0.5" max="1.8" step="0.05" value={manualAdjust.scale}
              onChange={(e) => setManualAdjust((a) => ({ ...a, scale: Number(e.target.value) }))} />
          </label>
          <label>Posición X
            <input type="range" min="-50" max="50" step="1" value={manualAdjust.offsetX}
              onChange={(e) => setManualAdjust((a) => ({ ...a, offsetX: Number(e.target.value) }))} />
          </label>
          <label>Posición Y
            <input type="range" min="-50" max="50" step="1" value={manualAdjust.offsetY}
              onChange={(e) => setManualAdjust((a) => ({ ...a, offsetY: Number(e.target.value) }))} />
          </label>
          <label>Rotación
            <input type="range" min="-45" max="45" step="1" value={manualAdjust.rotation}
              onChange={(e) => setManualAdjust((a) => ({ ...a, rotation: Number(e.target.value) }))} />
          </label>
          <label>Transparencia
            <input type="range" min="0.2" max="1" step="0.05" value={manualAdjust.opacity}
              onChange={(e) => setManualAdjust((a) => ({ ...a, opacity: Number(e.target.value) }))} />
          </label>
        </div>
      )}
    </div>
  );
}

function applyManualAdjust(rect, adjust, canvas) {
  return {
    ...rect,
    x: rect.x + (adjust.offsetX / 100) * canvas.width,
    y: rect.y + (adjust.offsetY / 100) * canvas.height,
    width: rect.width * adjust.scale,
    height: rect.height * adjust.scale,
    angle: rect.angle + (adjust.rotation * Math.PI) / 180,
  };
}
