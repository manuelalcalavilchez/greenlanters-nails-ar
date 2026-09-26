import { createDefaultDesign } from './nailPatterns';

// Plantillas inspiradas en trabajos propios de Instagram.
// Los adornos complejos se representan como patrones hasta que el motor
// de RA disponga de assets 3D o texturas específicas.
const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];

const buildNails = ({ shape, baseColor, tipColor = null, pattern = 'solid', gradient = null, decorations = [] }) =>
  FINGERS.map((finger) => ({
    finger,
    shape,
    baseColor,
    tipColor,
    pattern,
    gradient,
    decorations: decorations.map((decoration) => ({ ...decoration })),
  }));

const createTemplate = (name, config) => ({
  ...createDefaultDesign(name, 'right'),
  nails: buildNails(config),
});

// Catálogo inicial: diseños basados en la estética glam, neón y bridal
// mostrada en el Instagram de The Green Lanterns Nail.
export const STARTER_TEMPLATES = [
  createTemplate('Francesa clásica', {
    shape: 'almond',
    baseColor: '#F9E1E7',
    tipColor: '#FFFFFF',
    pattern: 'french',
  }),
  createTemplate('Cromado rosa', {
    shape: 'coffin',
    baseColor: '#E8B4D8',
    pattern: 'chrome',
    gradient: { from: '#E8B4D8', to: '#FFFFFF', angle: 120 },
  }),
  createTemplate('Lima neón con ondas', {
    shape: 'stiletto',
    baseColor: '#C8FF1A',
    pattern: 'swirl',
    gradient: { from: '#C8FF1A', to: '#42D84A', angle: 135 },
  }),
  createTemplate('Azul eléctrico glossy', {
    shape: 'coffin',
    baseColor: '#2A21E8',
    pattern: 'solid',
  }),
  createTemplate('Fucsia glam', {
    shape: 'coffin',
    baseColor: '#E71BA6',
    pattern: 'solid',
  }),
  createTemplate('Rojo velvet', {
    shape: 'almond',
    baseColor: '#BD1026',
    pattern: 'solid',
    gradient: { from: '#E52B3E', to: '#7B0011', angle: 130 },
  }),
  createTemplate('French ice glitter', {
    shape: 'coffin',
    baseColor: '#F4E9ED',
    tipColor: '#FFFFFF',
    pattern: 'french',
    decorations: [{ type: 'glitter', color: '#D8E8FF', intensity: 0.65 }],
  }),
  createTemplate('Baby boomer blush', {
    shape: 'almond',
    baseColor: '#F5B8CD',
    pattern: 'gradient',
    gradient: { from: '#F5B8CD', to: '#FFFDFD', angle: 90 },
  }),
  createTemplate('Novia perlada', {
    shape: 'almond',
    baseColor: '#FFF9F3',
    pattern: 'chrome',
    gradient: { from: '#FFF9F3', to: '#E8DFF0', angle: 115 },
    decorations: [{ type: 'pearl', color: '#FFFFFF', intensity: 0.35 }],
  }),
  createTemplate('Nude oro luxe', {
    shape: 'almond',
    baseColor: '#D9A88B',
    pattern: 'gold-leaf',
    decorations: [{ type: 'gold', color: '#D4AF37', intensity: 0.8 }],
  }),
  createTemplate('Flor rosa 3D', {
    shape: 'almond',
    baseColor: '#F7C9D9',
    pattern: 'floral',
    decorations: [{ type: 'flower', color: '#FFFFFF', accent: '#EC6FA5', intensity: 0.7 }],
  }),
  createTemplate('Cristal nieve', {
    shape: 'coffin',
    baseColor: '#F7FBFF',
    pattern: 'glitter',
    gradient: { from: '#FFFFFF', to: '#C5DDF2', angle: 120 },
    decorations: [{ type: 'crystal', color: '#B7D8FF', intensity: 0.75 }],
  }),
];
