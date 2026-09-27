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

  // El contorno detectado por MediaPipe actúa como máscara final para que
  // el diseño siga la uña real aunque el SVG tenga una silueta distinta.
  if (Array.isArray(rect.contour) && rect.contour.length >= 5) {
    ctx.beginPath();
    ctx.moveTo(rect.contour[0].x, rect.contour[0].y);
    for (let i = 1; i < rect.contour.length; i += 1) {
      ctx.lineTo(rect.contour[i].x, rect.contour[i].y);
    }
    ctx.closePath();
    ctx.clip();
  }

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
