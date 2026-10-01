// One-Euro adaptativo por dedo: fuerte en reposo, reactivo al mover la mano.
export function createSmoother(options = {}) {
  const state = new Map();
  const config = {
    minCutoff: options.minCutoff ?? 1.2,
    beta: options.beta ?? 0.4,
    dCutoff: options.dCutoff ?? 1.0,
  };

  function smooth(fingerId, rect, timestampMs = performance.now()) {
    if (!rect) {
      state.delete(fingerId);
      return null;
    }

    let filters = state.get(fingerId);
    if (!filters) {
      filters = createRectFilters(config);
      state.set(fingerId, filters);
      return rect;
    }

    return {
      x: filters.x.filter(rect.x, timestampMs),
      y: filters.y.filter(rect.y, timestampMs),
      width: filters.width.filter(rect.width, timestampMs),
      height: filters.height.filter(rect.height, timestampMs),
      angle: filters.angle.filterAngle(rect.angle, timestampMs),
      tipCurve: rect.tipCurve,
      contour: smoothContourWithFilters(filters.contour, rect.contour, timestampMs),
    };
  }

  function reset() {
    state.clear();
  }

  return { smooth, reset };
}
function createRectFilters(config) {
  const make = () => new OneEuroScalar(config);
  const contour = {};
  for (const key of [
    'baseLeft', 'baseRight', 'leftControl1', 'leftControl2',
    'rightControl1', 'rightControl2', 'tipLeft', 'tipRight',
  ]) {
    contour[key] = { x: make(), y: make() };
  }
  contour.cuticleCurve = make();
  return {
    x: make(),
    y: make(),
    width: make(),
    height: make(),
    angle: makeAngleFilter(config),
    contour,
  };
}

function smoothContourWithFilters(filters, current, timestampMs) {
  if (!current) return null;
  const contour = {};
  for (const key of Object.keys(filters)) {
    if (key === 'cuticleCurve') continue;
    contour[key] = {
      x: filters[key].x.filter(current[key].x, timestampMs),
      y: filters[key].y.filter(current[key].y, timestampMs),
    };
  }
  contour.cuticleCurve = filters.cuticleCurve.filter(current.cuticleCurve, timestampMs);
  return contour;
}class OneEuroScalar {
  constructor({ minCutoff: min, beta: b, dCutoff: dc }) {
    this.minCutoff = min;
    this.beta = b;
    this.dCutoff = dc;
    this.x = null;
    this.dx = 0;
    this.lastTime = null;
  }

  filter(value, timestampMs) {
    if (this.lastTime == null) {
      this.lastTime = timestampMs;
      this.x = value;
      return value;
    }
    let dt = (timestampMs - this.lastTime) / 1000;
    if (!(dt > 0)) dt = 1 / 30;
    this.lastTime = timestampMs;
    const rawDx = (value - this.x) / dt;
    const dAlpha = lowPassAlpha(this.dCutoff, dt);
    this.dx += (rawDx - this.dx) * dAlpha;
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    const alpha = lowPassAlpha(cutoff, dt);
    this.x += (value - this.x) * alpha;
    return this.x;
  }
}

function makeAngleFilter(config) {
  const scalar = new OneEuroScalar(config);
  return {
    filter(value, timestampMs) {
      return scalar.filter(value, timestampMs);
    },
    filterAngle(value, timestampMs) {
      if (scalar.x == null) return scalar.filter(value, timestampMs);
      let delta = value - scalar.x;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      return scalar.filter(scalar.x + delta, timestampMs);
    },
  };
}

function lowPassAlpha(cutoff, dt) {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}
