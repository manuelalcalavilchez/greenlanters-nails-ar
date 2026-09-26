import { createDefaultDesign } from './nailPatterns';

// Plantillas de ejemplo mostradas en "Nuevo diseño". Pendiente (Fase 3):
// sustituir por catálogo real servido desde /api/catalog.
export const STARTER_TEMPLATES = [
  {
    ...createDefaultDesign('Francesa clásica', 'right'),
    nails: ['thumb', 'index', 'middle', 'ring', 'pinky'].map((finger) => ({
      finger,
      shape: 'almond',
      baseColor: '#F9E1E7',
      tipColor: '#FFFFFF',
      pattern: 'french',
      gradient: null,
      decorations: [],
    })),
  },
  {
    ...createDefaultDesign('Cromado rosa', 'right'),
    nails: ['thumb', 'index', 'middle', 'ring', 'pinky'].map((finger) => ({
      finger,
      shape: 'coffin',
      baseColor: '#E8B4D8',
      tipColor: null,
      pattern: 'chrome',
      gradient: { from: '#E8B4D8', to: '#FFFFFF', angle: 120 },
      decorations: [],
    })),
  },
];
