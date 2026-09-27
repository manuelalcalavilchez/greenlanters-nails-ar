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
  if (!pip || !dip || !tip) return null;

  const pipPx = pxPoint(pip, canvasSize);
  const dipPx = pxPoint(dip, canvasSize);
  const tipPx = pxPoint(tip, canvasSize);

  const axisX = tipPx.x - dipPx.x;
  const axisY = tipPx.y - dipPx.y;
  const axisLen = Math.hypot(axisX, axisY) || 1;
  const ux = axisX / axisLen;
  const uy = axisY / axisLen;
  const angleRad = Math.atan2(axisY, axisX);

  const proximalLen = distancePx(pipPx, dipPx);
  const widthFactor = fingerId === 'thumb' ? 0.85 : 0.72;
  const fingerWidthPx = Math.max(proximalLen * widthFactor, 8);

  const shape = getShapeById(shapeId);
  const desiredLength = fingerWidthPx * shape.aspect;
  const nailLength = Math.max(
    Math.min(desiredLength, axisLen * 1.02),
    Math.min(18, axisLen * 0.92),
  );

  const baseOffset = Math.max(1.5, axisLen * 0.035);
  const centerAlongAxis = baseOffset + nailLength / 2;

  return {
    x: dipPx.x + ux * centerAlongAxis,
    y: dipPx.y + uy * centerAlongAxis,
    width: fingerWidthPx,
    height: nailLength,
    angle: angleRad + Math.PI / 2,
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
