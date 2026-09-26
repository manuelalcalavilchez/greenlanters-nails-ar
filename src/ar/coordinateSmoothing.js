// coordinateSmoothing.js
// Suavizado exponencial (EMA) por dedo, para evitar el "temblor" típico de
// landmarks frame a frame. alpha bajo = más suave pero más lag; alpha alto
// = más reactivo pero más tembloroso. 0.35 es un punto de partida razonable
// para 30fps; ajustar según pruebas reales en el dispositivo objetivo.

export function createSmoother(alpha = 0.35) {
  const state = new Map(); // fingerId -> último rect suavizado

  function smooth(fingerId, rect) {
    if (!rect) {
      state.delete(fingerId);
      return null;
    }
    const prev = state.get(fingerId);
    if (!prev) {
      state.set(fingerId, rect);
      return rect;
    }
    const next = {
      x: prev.x + (rect.x - prev.x) * alpha,
      y: prev.y + (rect.y - prev.y) * alpha,
      width: prev.width + (rect.width - prev.width) * alpha,
      height: prev.height + (rect.height - prev.height) * alpha,
      // Los ángulos necesitan suavizado circular para evitar saltos en el
      // paso por ±180°.
      angle: smoothAngle(prev.angle, rect.angle, alpha),
      tipCurve: rect.tipCurve,
    };
    state.set(fingerId, next);
    return next;
  }

  function reset() {
    state.clear();
  }

  return { smooth, reset };
}

function smoothAngle(prevAngle, newAngle, alpha) {
  let diff = newAngle - prevAngle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return prevAngle + diff * alpha;
}
