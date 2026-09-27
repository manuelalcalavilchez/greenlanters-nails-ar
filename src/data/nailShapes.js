// Formas de uña entregadas en el paquete SVG de WebAR.
export const NAIL_SHAPES = [
  { id: 'round', label: 'Redonda', aspect: 1.15, tipCurve: 0.75 },
  { id: 'oval', label: 'Ovalada', aspect: 1.2, tipCurve: 0.65 },
  { id: 'almond', label: 'Almendrada', aspect: 1.35, tipCurve: 0.55 },
  { id: 'square', label: 'Cuadrada', aspect: 1.05, tipCurve: 0.05 },
  { id: 'coffin', label: 'Coffin', aspect: 1.4, tipCurve: 0.15 },
  { id: 'stiletto', label: 'Stiletto', aspect: 1.6, tipCurve: 0.85 },
];

export const FINGERS = [
  { id: 'thumb', label: 'Pulgar' },
  { id: 'index', label: 'Índice' },
  { id: 'middle', label: 'Corazón' },
  { id: 'ring', label: 'Anular' },
  { id: 'pinky', label: 'Meñique' },
];

export function getShapeById(id) {
  return NAIL_SHAPES.find((s) => s.id === id) || NAIL_SHAPES[0];
}
