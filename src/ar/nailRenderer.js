// nailRenderer.js
// Dibuja el diseño de cada uña sobre un canvas 2D, en la posición/rotación
// dada por nailGeometry.js (ya suavizada). Reutiliza la misma lógica de
// patrones que el editor (ver NailCanvas.jsx) para que "lo que ves en el
// editor" y "lo que ves en la cámara" coincidan.

function roundedNailPath(ctx, rect) {
  const { x, y, width, height, angle, tipCurve } = rect;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const w = width / 2;
  const h = height / 2;
  const curve = h * tipCurve;

  ctx.beginPath();
  ctx.moveTo(-w, h); // base izquierda (cutícula)
  ctx.lineTo(-w, -h + curve);
  ctx.quadraticCurveTo(-w, -h, 0, -h - curve * 0.3); // punta
  ctx.quadraticCurveTo(w, -h, w, -h + curve);
  ctx.lineTo(w, h); // base derecha
  ctx.closePath();
  ctx.restore();
}

function applyTransformForPath(ctx, rect) {
  ctx.translate(rect.x, rect.y);
  ctx.rotate(rect.angle);
}

export function drawNailDesign(ctx, rect, nailConfig, opacity = 1) {
  if (!rect) return;
  ctx.save();
  ctx.globalAlpha = opacity;

  // 1. Construir el path en espacio local y clip.
  ctx.translate(rect.x, rect.y);
  ctx.rotate(rect.angle);
  const w = rect.width / 2;
  const h = rect.height / 2;
  const curve = h * rect.tipCurve;
  ctx.beginPath();
  ctx.moveTo(-w, h);
  ctx.lineTo(-w, -h + curve);
  ctx.quadraticCurveTo(-w, -h, 0, -h - curve * 0.3);
  ctx.quadraticCurveTo(w, -h, w, -h + curve);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.clip();

  // 2. Rellenar según el patrón (misma lógica que el editor).
  paintPattern(ctx, nailConfig, -w, -h, w * 2, h * 2);

  // 3. Decoraciones simples (líneas, puntos) — pegatinas/imágenes en Fase 3.
  drawDecorations(ctx, nailConfig.decorations, -w, -h);

  ctx.restore();
}

function paintPattern(ctx, nailConfig, x, y, w, h) {
  const { pattern, baseColor, tipColor, gradient } = nailConfig;

  switch (pattern) {
    case 'gradient': {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, gradient?.from || baseColor);
      g.addColorStop(1, gradient?.to || '#FFFFFF');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      break;
    }
    case 'french': {
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = tipColor || '#FFFFFF';
      ctx.fillRect(x, y, w, h * 0.28); // banda superior = punta francesa
      break;
    }
    case 'chrome': {
      const g = ctx.createLinearGradient(x, y, x + w, y + h);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.5, baseColor);
      g.addColorStop(1, '#B8B8B8');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      break;
    }
    case 'glitter': {
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 25; i++) {
        const px = x + Math.random() * w;
        const py = y + Math.random() * h;
        ctx.fillRect(px, py, 1.2, 1.2);
      }
      break;
    }
    case 'solid':
    default: {
      ctx.fillStyle = baseColor;
      ctx.fillRect(x, y, w, h);
    }
  }
}

function drawDecorations(ctx, decorations = [], x, y) {
  for (const deco of decorations) {
    ctx.save();
    ctx.translate(x + deco.x, y + deco.y);
    ctx.rotate(((deco.rotation || 0) * Math.PI) / 180);
    ctx.scale(deco.scale || 1, deco.scale || 1);
    if (deco.type === 'dot') {
      ctx.fillStyle = deco.color || '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (deco.type === 'line') {
      ctx.strokeStyle = deco.color || '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();
    }
    // 'sticker' / 'stone' / 'image': requieren catálogo de assets — pendiente Fase 3.
    ctx.restore();
  }
}

export { paintPattern }; // reutilizado por NailCanvas.jsx en el editor
