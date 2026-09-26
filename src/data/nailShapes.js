// Formas de uña soportadas. `aspect` es alto/ancho aproximado, usado tanto
// por el editor (dibujo de la vista previa) como por el módulo AR
// (nailGeometry.js) para escalar el rectángulo de la uña sobre el dedo real.
export const NAIL_SHAPES = [
  { id: 'almond', label: 'Almendrada', aspect: 1.35, tipCurve: 0.55 },
  { id: 'square', label: 'Cuadrada', aspect: 1.05, tipCurve: 0.05 },
  { id: 'coffin', label: 'Coffin', aspect: 1.4, tipCurve: 0.15 },
  { id: 'stiletto', label: 'Stiletto', aspect: 1.6, tipCurve: 0.85 },
  { id: 'oval', label: 'Ovalada', aspect: 1.2, tipCurve: 0.65 },
  { id: 'natural', label: 'Natural', aspect: 1.0, tipCurve: 0.35 },
];

export const FINGERS = [
  { id: 'thumb', label: 'Pulgar' },
  { id: 'index', label: 'Índice' },
  { id: 'middle', label: 'Corazón' },
  { id: 'ring', label: 'Anular' },
  { id: 'pinky', label: 'Meñique' },
];

export function getShapeById(id) {
  return NAIL_SHAPES.find((s) => s.id === id) || NAIL_SHAPES[NAIL_SHAPES.length - 1];
}
