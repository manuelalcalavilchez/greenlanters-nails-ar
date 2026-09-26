// Patrones funcionales en el MVP (implementados en NailCanvas / nailRenderer).
// 'stickers', 'stones' e 'images' están soportados como tipo de decoración
// pero con assets de ejemplo — sustituir por catálogo real en Fase 3.
export const PATTERNS = [
  { id: 'solid', label: 'Color liso' },
  { id: 'gradient', label: 'Degradado' },
  { id: 'french', label: 'Francesa' },
  { id: 'chrome', label: 'Cromado' }, // aproximado con gradiente metálico, no shader real
  { id: 'glitter', label: 'Purpurina' }, // aproximado con ruido generado en canvas
];

export const DECORATION_TYPES = [
  { id: 'sticker', label: 'Pegatina' },
  { id: 'stone', label: 'Piedra' },
  { id: 'line', label: 'Línea' },
  { id: 'dot', label: 'Punto' },
  { id: 'image', label: 'Imagen personalizada' },
];

// Modelo de datos por uña individual.
export function createEmptyNail(finger) {
  return {
    finger,
    shape: 'almond',
    baseColor: '#F4C7D7',
    tipColor: null,
    pattern: 'solid',
    gradient: null, // { from: '#hex', to: '#hex', angle: 90 }
    decorations: [], // [{ type, x, y, rotation, scale, color, src }]
  };
}

export function createDefaultDesign(name = 'Nuevo diseño', hand = 'right') {
  return {
    id: null,
    name,
    hand,
    nails: ['thumb', 'index', 'middle', 'ring', 'pinky'].map(createEmptyNail),
    createdAt: new Date().toISOString(),
  };
}
