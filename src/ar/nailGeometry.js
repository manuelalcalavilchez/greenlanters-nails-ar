import { FINGER_LANDMARKS } from './handTracker';
import { getShapeById } from '../data/nailShapes';

function pxPoint(point, canvasSize) {
  return { x: point.x * canvasSize.width, y: point.y * canvasSize.height };
}

function distancePx(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(x, y) {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function getFingerWidth(landmarks, fingerId, canvasSize, proximalLen, distalLen) {
  const p = landmarks.map((point) => pxPoint(point, canvasSize));
  const idx = FINGER_LANDMARKS[fingerId];
  if (!idx) return Math.max(10, proximalLen * 0.6);

  if (fingerId === 'thumb') {
    return Math.max(18, proximalLen * 0.68, distalLen * 0.92);
  }

  const neighbors = {
    index: [p[6], p[10]],
    middle: [p[6], p[14]],
    ring: [p[10], p[18]],
    pinky: [p[14], p[18]],
  };
  const pair = neighbors[fingerId];
  const neighborWidth = pair?.[0] && pair?.[1] ? distancePx(pair[0], pair[1]) * 0.47 : 0;
  const boneWidth = proximalLen * (fingerId === 'pinky' ? 0.76 : 0.82);
  return Math.max(14, neighborWidth * 0.9, boneWidth, distalLen * 0.58);
}

function buildContour(shape, width, length, fingerId) {
  const half = width / 2;
  const baseInset = half * (fingerId === 'thumb' ? 0.04 : 0.08);
  const tip = shape.tipCurve;
  const shoulder = shape.id === 'stiletto' ? 0.58 : shape.id === 'coffin' ? 0.96 : 0.82;
  const tipHalf = half * (shape.id === 'square' ? 0.98 : shape.id === 'coffin' ? 0.88 : tip < 0.25 ? 0.72 : 0.34);

  return [
    { x: -half + baseInset, y: length * 0.5 },
    { x: -half * shoulder, y: length * 0.18 },
    { x: -tipHalf, y: -length * 0.30 },
    { x: -tipHalf * 0.72, y: -length * 0.43 },
    { x: 0, y: -length * 0.5 },
    { x: tipHalf * 0.72, y: -length * 0.43 },
    { x: tipHalf, y: -length * 0.30 },
    { x: half * shoulder, y: length * 0.18 },
    { x: half - baseInset, y: length * 0.5 },
  ];
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
  const axis = normalize(tipPx.x - dipPx.x, tipPx.y - dipPx.y);

  const proximalLen = distancePx(mcpPx, pipPx);
  const distalLen = distancePx(dipPx, tipPx);
  const fingerWidthPx = getFingerWidth(
    landmarks,
    fingerId,
    canvasSize,
    proximalLen,
    distalLen,
  );

  const shape = getShapeById(shapeId);
  const nailLength = Math.max(
    18,
    Math.min(fingerWidthPx * shape.aspect, distalLen * 1.18),
  );
  const baseOffset = Math.max(1.5, distalLen * 0.06);
  const centerAlongAxis = baseOffset + nailLength / 2;
  const center = {
    x: dipPx.x + axis.x * centerAlongAxis,
    y: dipPx.y + axis.y * centerAlongAxis,
  };

  const contour = buildContour(shape, fingerWidthPx, nailLength, fingerId);
  return {
    x: center.x,
    y: center.y,
    width: fingerWidthPx,
    height: nailLength,
    angle: Math.atan2(axis.y, axis.x) + Math.PI / 2,
    tipCurve: shape.tipCurve,
    contour,
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
