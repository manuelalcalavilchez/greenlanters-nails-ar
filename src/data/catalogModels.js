export const CATALOG_MODELS = [
  {
    id: 'cat-eye',
    name: 'Cat Eye',
    description: 'Efecto magnético elegante con acabado brillante.',
    price: 29.90,
    image: '/catalog/lookbook_cat_eye_1790278390086.jpg',
    shape: 'almond',
    baseColor: '#6B3B50',
    pattern: 'chrome',
  },
  {
    id: 'emerald-gold',
    name: 'Emerald Gold',
    description: 'Verde esmeralda con detalles dorados.',
    price: 32.90,
    image: '/catalog/lookbook_emerald_gold_1790278368263.jpg',
    shape: 'coffin',
    baseColor: '#176B57',
    pattern: 'gold-leaf',
  },
  {
    id: 'glazed-pearl',
    name: 'Glazed Pearl',
    description: 'Acabado perlado luminoso y sofisticado.',
    price: 27.90,
    image: '/catalog/lookbook_glazed_pearl_1790278378541.jpg',
    shape: 'almond',
    baseColor: '#F5EAF0',
    pattern: 'chrome',
  },
];
export function modelToDesign(model) {
  return {
    id: model.id,
    name: model.name,
    source: 'greenlanters-catalog',
    price: model.price,
    catalogImage: model.image,
    hand: 'right',
    nails: ['thumb', 'index', 'middle', 'ring', 'pinky'].map((finger) => ({
      finger,
      shape: model.shape,
      baseColor: model.baseColor,
      tipColor: null,
      pattern: model.pattern,
      gradient: null,
      decorations: [],
    })),
  };
}
