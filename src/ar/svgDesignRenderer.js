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
  if (rect.contour?.baseLeft) {
    const c = rect.contour;
    ctx.beginPath();
    ctx.moveTo(c.baseLeft.x, c.baseLeft.y);
    ctx.quadraticCurveTo(-rect.width * 0.12, c.baseLeft.y - c.cuticleCurve, 0, c.baseLeft.y - c.cuticleCurve * 1.15);
    ctx.quadraticCurveTo(rect.width * 0.12, c.baseRight.y - c.cuticleCurve, c.baseRight.x, c.baseRight.y);
    ctx.bezierCurveTo(c.rightControl1.x, c.rightControl1.y, c.rightControl2.x, c.rightControl2.y, c.tipRight.x, c.tipRight.y);
    ctx.quadraticCurveTo(rect.width * 0.08, c.tipRight.y - rect.height * 0.035, 0, c.tipRight.y);
    ctx.quadraticCurveTo(-rect.width * 0.08, c.tipLeft.y - rect.height * 0.035, c.tipLeft.x, c.tipLeft.y);
    ctx.bezierCurveTo(c.leftControl2.x, c.leftControl2.y, c.leftControl1.x, c.leftControl1.y, c.baseLeft.x, c.baseLeft.y);
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
