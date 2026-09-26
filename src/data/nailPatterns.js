// Patrones funcionales en el MVP (implementados en NailCanvas / nailRenderer).
// Los patrones avanzados tienen fallback visual seguro mientras se amplía el renderer.
export const PATTERNS = [
  { id: 'solid', label: 'Color liso' },
  { id: 'gradient', label: 'Degradado' },
  { id: 'french', label: 'Francesa' },
  { id: 'chrome', label: 'Cromado' },
  { id: 'glitter', label: 'Purpurina' },
  { id: 'swirl', label: 'Ondas neón' },
  { id: 'gold-leaf', label: 'Pan de oro' },
  { id: 'floral', label: 'Floral' },
];

export const DECORATION_TYPES = [
  { id: 'sticker', label: 'Pegatina' },
  { id: 'stone', label: 'Piedra' },
  { id: 'line', label: 'Línea' },
  { id: 'dot', label: 'Punto' },
  { id: 'image', label: 'Imagen personalizada' },
  { id: 'glitter', label: 'Brillo' },
  { id: 'pearl', label: 'Perla' },
  { id: 'gold', label: 'Oro' },
  { id: 'flower', label: 'Flor' },
  { id: 'crystal', label: 'Cristal' },
];

// Modelo de datos por uña individual.
export function createEmptyNail(finger) {
  return {
    finger,
    shape: 'almond',
    baseColor: '#F4C7D7',
    tipColor: null,
    pattern: 'solid',
    gradient: null,
    decorations: [],
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
