// nailGeometry.js
// LIMITACIÓN IMPORTANTE (léela antes de tocar este archivo):
// MediaPipe HandLandmarker NO detecta la uña. Da 21 puntos del esqueleto de
// la mano. Todo lo de aquí es una ESTIMACIÓN geométrica de dónde está la uña
// a partir de esos puntos, no una segmentación real. Funciona bien para
// overlays tipo "sticker que sigue al dedo" pero:
//   - No sigue el contorno real de la uña de la usuaria (cutícula, forma
//     real de su uña) — asume una uña "genérica" centrada en la falange distal.
//   - Es sensible a oclusiones y a ángulos de mano muy laterales.
//   - No corrige por longitud de uña real (una uña muy larga sobresale del
//     dedo; esto lo compensamos parcialmente con `NAIL_SHAPES.aspect`, pero
//     no es exacto).
// Mejora futura: modelo de segmentación de uñas entrenado específicamente
// (ver sección "Mejoras futuras" en el README).

import { FINGER_LANDMARKS } from './handTracker';
import { getShapeById } from '../data/nailShapes';

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Calcula el rectángulo orientado (centro, ancho, alto, ángulo) donde debe
 * dibujarse el diseño de una uña, a partir de los landmarks de un dedo.
 *
 * @param {Array<{x:number,y:number,z:number}>} landmarks - los 21 puntos normalizados [0,1] de MediaPipe
 * @param {string} fingerId - 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
 * @param {string} shapeId - id de NAIL_SHAPES, afecta el aspect ratio del rectángulo
 * @param {{width:number,height:number}} canvasSize - tamaño en px del canvas destino
 */
export function estimateNailRect(landmarks, fingerId, shapeId, canvasSize) {
  const idx = FINGER_LANDMARKS[fingerId];
  if (!idx) return null;

  const dip = landmarks[idx.dip];
  const tip = landmarks[idx.tip];
  const pip = landmarks[idx.pip];
  if (!dip || !tip) return null;

  // Dirección del dedo: vector de la articulación intermedia a la punta.
  const dirX = tip.x - pip.x;
  const dirY = tip.y - pip.y;
  const dirLen = Math.hypot(dirX, dirY) || 1;
  const angleRad = Math.atan2(dirY, dirX);

  // Ancho del dedo aproximado como una fracción de la distancia pip->dip,
  // ya que MediaPipe no da anchura directamente. Factor calibrado
  // empíricamente (0.55) para falange distal media; ajustable por dedo.
  const phalanxLen = dist(pip, dip) * (canvasSize.width); // en px (x e y normalizados igual si canvas es cuadrado; ver nota abajo)
  const widthFactor = fingerId === 'thumb' ? 0.75 : 0.55;
  const fingerWidthPx = Math.max(phalanxLen * widthFactor, 8);

  const shape = getShapeById(shapeId);
  const nailHeightPx = fingerWidthPx * shape.aspect;

  // Centro del rectángulo: entre DIP y TIP, ligeramente desplazado hacia
  // la punta (la uña ocupa el tercio distal de la falange, no toda ella).
  const centerX = (dip.x + tip.x * 1.4) / 2.4 * canvasSize.width;
  const centerY = (dip.y + tip.y * 1.4) / 2.4 * canvasSize.height;

  return {
    x: centerX,
    y: centerY,
    width: fingerWidthPx,
    height: nailHeightPx,
    angle: angleRad + Math.PI / 2, // +90° porque el "alto" del rectángulo va a lo largo del dedo
    tipCurve: shape.tipCurve,
  };
}

/**
 * Calcula los 5 rectángulos de uña para una mano detectada.
 * Devuelve { thumb: rect, index: rect, ... } (rect puede ser null si el
 * landmark no es fiable).
 */
export function estimateHandNailRects(landmarks, nailDesign, canvasSize) {
  const result = {};
  for (const nail of nailDesign.nails) {
    result[nail.finger] = estimateNailRect(landmarks, nail.finger, nail.shape, canvasSize);
  }
  return result;
}
