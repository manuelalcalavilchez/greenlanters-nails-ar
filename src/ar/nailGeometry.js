[Reading 88 lines from start (total: 88 lines, 0 remaining)]

// Geometría estimada de la uña a partir de los 21 landmarks de MediaPipe.
import { FINGER_LANDMARKS } from './handTracker';
import { getShapeById } from '../data/nailShapes';

function pxPoint(point, canvasSize) {
  return {
    x: point.x * canvasSize.width,
    y: point.y * canvasSize.height,
  };
}

function distancePx(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * MediaPipe no segmenta la uña. Aquí estimamos la zona de uña dentro de la
 * falange distal y hacemos que su eje siga exactamente el eje del dedo.
 *
 * El extremo proximal queda cerca de DIP, no detrás de él: esto evita que el
 * overlay pinte piel por debajo de la uña.
 */
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

  // Anchura del dedo estimada desde la falange proximal. Trabajamos siempre
  // en píxeles para que no haya distorsión cuando el canvas no sea cuadrado.
  const proximalLen = distancePx(pipPx, dipPx);
  const widthFactor = fingerId === 'thumb' ? 0.85 : 0.72;
  const fingerWidthPx = Math.max(proximalLen * widthFactor, 8);

  const shape = getShapeById(shapeId);
  const desiredLength = fingerWidthPx * shape.aspect;
  const distalLen = axisLen;

  // La uña se mantiene dentro de la falange distal detectada. El pequeño
  // margen proximal hace que la base quede cerca de la cutícula/DIP.
  const nailLength = Math.max(
    Math.min(desiredLength, distalLen * 1.02),
    Math.min(18, distalLen * 0.92),
  );
  const baseOffset = Math.max(1.5, distalLen * 0.035);
  const centerAlongAxis = baseOffset + nailLength / 2;

  // El renderer usa una forma vertical cuyo extremo de punta está arriba
  // (-Y). angle + PI/2 hace que ese -Y coincida con el eje DIP -> TIP.
  const centerX = dipPx.x + ux * centerAlongAxis;
  const centerY = dipPx.y + uy * centerAlongAxis;

  return {
    x: centerX,
    y: centerY,
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

[executed on device: torrearny (eef82570-0e14-4ff0-ac35-b4d890e31f4e)]