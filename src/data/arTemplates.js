import { createDefaultDesign } from './nailPatterns';

export const AR_TEMPLATE_CATALOG = [
  {
    id: '01',
    label: 'French naranja glitter',
    shape: 'oval',
    source: 'Imagen 1',
    base: '/nail-ar-templates/designs/01a-naranja-glitter-base.svg',
    accent: '/nail-ar-templates/designs/01b-naranja-glitter-accent.svg',
    accentFinger: 'ring',
  },
  {
    id: '02',
    label: 'French blanco + flor turquesa',
    shape: 'square',
    source: 'Imagen 2',
    base: '/nail-ar-templates/designs/02a-french-blanco-base.svg',
    accent: '/nail-ar-templates/designs/02b-french-blanco-accent.svg',
    accentFinger: 'ring',
  },
  {
    id: '03',
    label: 'Azul eléctrico + corazón 3D',
    shape: 'square',
    source: 'Imagen 3',
    base: '/nail-ar-templates/designs/03a-azul-base.svg',
    accent: '/nail-ar-templates/designs/03b-azul-corazon-accent.svg',
    accentFinger: 'ring',
  },
  {
    id: '04',
    label: 'Baby boomer ombré rosa-blanco',
    shape: 'almond',
    source: 'Imagen 4',
    base: '/nail-ar-templates/designs/04a-babyboomer.svg',
    accent: null,
    accentFinger: null,
  },
  {
    id: '05',
    label: 'Verde lima + hojas y perlas',
    shape: 'stiletto',
    source: 'Imagen 5',
    base: '/nail-ar-templates/designs/05a-verde-lima-base.svg',
    accent: '/nail-ar-templates/designs/05b-verde-lima-accent.svg',
    accentFinger: 'ring',
  },
  {
    id: '06',
    label: 'Nude lila + nube/pluma 3D',
    shape: 'stiletto',
    source: 'Imagen 6',
    base: '/nail-ar-templates/designs/06a-nude-lila-base.svg',
    accent: '/nail-ar-templates/designs/06b-nude-nube-pluma-accent.svg',
    accentFinger: 'ring',
  },
  {
    id: '07',
    label: 'French fucsia + strass + moño 3D',
    shape: 'square',
    source: 'Imagen 7',
    base: '/nail-ar-templates/designs/07a-fucsia-base.svg',
    accent: '/nail-ar-templates/designs/07b-fucsia-mono-accent.svg',
    accentFinger: 'ring',
  },
];

export function buildARTemplateDesign(template, variant = 'accent') {
  const design = createDefaultDesign(template.label, 'right');
  const useAccent = variant === 'accent' && template.accent;
  const accentFinger = template.accentFinger;

  return {
    ...design,
    id: null,
    name: template.label,
    arTemplate: {
      id: template.id,
      source: template.source,
      variant: useAccent ? 'accent' : 'base',
    },
    nails: design.nails.map((nail) => ({
      ...nail,
      shape: template.shape,
      svgDesign: useAccent && nail.finger === accentFinger ? template.accent : template.base,
      svgShape: `/nail-ar-templates/shapes/${template.shape}.svg`,
      arTemplateId: template.id,
      arTemplateVariant: useAccent && nail.finger === accentFinger ? 'accent' : 'base',
    })),
  };
}
