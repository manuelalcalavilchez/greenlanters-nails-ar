import { FINGER_LANDMARKS } from './handTracker';
import { getShapeById } from '../data/nailShapes';

function pxPoint(point, canvasSize) {
  return { x: point.x * canvasSize.width, y: point.y * canvasSize.height };
}

function distancePx(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function estimateNailRect(landmarks, fingerId, shapeId, canvasSize) {
  const idx = FINGER_LANDMARKS[fingerId];
  if (!idx) return null;

  const pip = landmarks[idx.pip];
  const dip = landmarks[idx.dip];
  const tip = landmarks[idx.tip];
  const mcp = landmarks[idx.mcp];
  if (!pip || !dip || !tip || !mcp) return null;

  const pipPx = pxPoint(pip, canvasSize);
  const dipPx = pxPoint(dip, canvasSize);
  const tipPx = pxPoint(tip, canvasSize);
  const mcpPx = pxPoint(mcp, canvasSize);

  const axisX = tipPx.x - dipPx.x;
  const axisY = tipPx.y - dipPx.y;
  const axisLen = Math.hypot(axisX, axisY) || 1;
  const ux = axisX / axisLen;
  const uy = axisY / axisLen;

  // El grosor se estima en el plano local del dedo y se adapta a la longitud
  // real del dedo. El pulgar tiene una proporción diferente.
  const proximalLen = distancePx(mcpPx, pipPx);
  const distalLen = distancePx(dipPx, tipPx);
  const fingerWidthPx = Math.max(
    fingerId === 'thumb'
      ? proximalLen * 0.72
      : Math.min(proximalLen * 0.88, distalLen * 0.82),
    10
  );

  const shape = getShapeById(shapeId);
  const desiredLength = fingerWidthPx * shape.aspect;
  const nailLength = Math.min(desiredLength, distalLen * 1.02);

  // Pequeño margen desde la articulación DIP para que la uña no invada la piel.
  const baseOffset = Math.max(2, distalLen * 0.055);
  const centerAlongAxis = baseOffset + nailLength / 2;

  return {
    x: dipPx.x + ux * centerAlongAxis,
    y: dipPx.y + uy * centerAlongAxis,
    width: fingerWidthPx,
    height: Math.max(16, nailLength),
    angle: Math.atan2(axisY, axisX) + Math.PI / 2,
    tipCurve: shape.tipCurve,
  };
}

export function estimateHandNailRects(landmarks, nailDesign, canvasSize) {
  const result = {};
  for (const nail of nailDesign.nails) {
    result[nail.finger] = estimateNailRect(
      landmarks,
      nail.finger,
      nail.shape,
      canvasSize,
    );
  }
  return result;
}
