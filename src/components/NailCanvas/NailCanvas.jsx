import { useEffect, useRef } from 'react';
import { getShapeById } from '../../data/nailShapes';
import { paintPattern } from '../../ar/nailRenderer';
import { drawSvgNailDesign } from '../../ar/svgDesignRenderer';

export default function NailCanvas({ nail, size = 120, selected = false, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const shape = getShapeById(nail.shape);
    const w = size * 0.55;
    const h = w * shape.aspect;
    const curve = h * shape.tipCurve;
    const cx = size / 2;
    const cy = size / 2;

    if (nail.svgDesign) {
      drawSvgNailDesign(
        ctx,
        { x: cx, y: cy, width: w, height: Math.min(h, size * 0.9), angle: 0 },
        nail.svgDesign,
        1,
      );
    } else {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(-w / 2, -h / 2 + curve);
      ctx.quadraticCurveTo(-w / 2, -h / 2, 0, -h / 2 - curve * 0.3);
      ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + curve);
      ctx.lineTo(w / 2, h / 2);
      ctx.closePath();
      ctx.clip();
      paintPattern(ctx, nail, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    if (!nail.svgDesign) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = selected ? '#B8336A' : '#00000022';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(-w / 2, h / 2);
      ctx.lineTo(-w / 2, -h / 2 + curve);
      ctx.quadraticCurveTo(-w / 2, -h / 2, 0, -h / 2 - curve * 0.3);
      ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + curve);
      ctx.lineTo(w / 2, h / 2);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }, [nail, size, selected]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={onClick}
      style={{ cursor: 'pointer', touchAction: 'manipulation' }}
      role="button"
      aria-label={`Uña ${nail.finger}`}
    />
  );
}
