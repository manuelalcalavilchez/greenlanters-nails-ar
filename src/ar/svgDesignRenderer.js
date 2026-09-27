const svgImageCache = new Map();

function getSvgImage(src) {
  if (!src) return null;

  const cached = svgImageCache.get(src);
  if (cached) return cached;

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => svgImageCache.set(src, image);
  image.src = src;
  svgImageCache.set(src, image);
  return image;
}

export function drawSvgNailDesign(ctx, rect, src, opacity = 1) {
  if (!ctx || !rect || !src) return false;

  const image = getSvgImage(src);
  if (!image || !image.complete || image.naturalWidth <= 0) return false;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(rect.x, rect.y);
  ctx.rotate(rect.angle);

  // Los SVG entregados usan viewBox 100x150 y dejan transparente la zona
  // exterior a la silueta. Esto hace que la máscara real del diseño sea la
  // forma SVG, no un rectángulo genérico.
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    image,
    -rect.width / 2,
    -rect.height / 2,
    rect.width,
    rect.height,
  );

  ctx.restore();
  return true;
}
