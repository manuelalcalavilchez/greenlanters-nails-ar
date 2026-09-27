// Suavizado exponencial por dedo, incluyendo la silueta completa.
export function createSmoother(alpha = 0.28) {
  const state = new Map();

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
      angle: smoothAngle(prev.angle, rect.angle, alpha),
      tipCurve: rect.tipCurve,
      contour: smoothContour(prev.contour, rect.contour, alpha),
    };

    state.set(fingerId, next);
    return next;
  }

  function reset() {
    state.clear();
  }

  return { smooth, reset };
}

function smoothContour(previous, current, alpha) {
  if (!current) return previous;
  if (!previous) return current;

  // La misma estructura de puntos se conserva para que la silueta no salte
  // cuando MediaPipe reajusta ligeramente los landmarks.
  if (previous.baseLeft && current.baseLeft) {
    const keys = [
      'baseLeft',
      'baseRight',
      'leftControl1',
      'leftControl2',
      'rightControl1',
      'rightControl2',
      'tipLeft',
      'tipRight',
    ];
    const contour = {};
    for (const key of keys) {
      contour[key] = {
        x: previous[key].x + (current[key].x - previous[key].x) * alpha,
        y: previous[key].y + (current[key].y - previous[key].y) * alpha,
      };
    }
    contour.cuticleCurve =
      previous.cuticleCurve +
      (current.cuticleCurve - previous.cuticleCurve) * alpha;
    return contour;
  }

  return current;
}

function smoothAngle(prevAngle, newAngle, alpha) {
  let diff = newAngle - prevAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return prevAngle + diff * alpha;
}
