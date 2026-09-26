import { PATTERNS } from '../../data/nailPatterns';

const SAVED_COLORS = [
  '#F4C7D7', '#E8B4D8', '#B8336A', '#FFFFFF', '#000000',
  '#C9A66B', '#7DB5A3', '#E63946', '#457B9D', '#F1C40F',
];

export default function NailPalette({ nail, onChange }) {
  function update(patch) {
    onChange({ ...nail, ...patch });
  }

  return (
    <div className="nail-palette">
      <label>Color base</label>
      <input
        type="color"
        value={nail.baseColor}
        onChange={(e) => update({ baseColor: e.target.value })}
      />
      <div className="swatches">
        {SAVED_COLORS.map((c) => (
          <button
            key={c}
            className="swatch"
            style={{ background: c }}
            onClick={() => update({ baseColor: c })}
            aria-label={`Usar color ${c}`}
          />
        ))}
      </div>

      <label>Patrón</label>
      <select value={nail.pattern} onChange={(e) => update({ pattern: e.target.value })}>
        {PATTERNS.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>

      {nail.pattern === 'gradient' && (
        <div className="gradient-controls">
          <label>Desde</label>
          <input
            type="color"
            value={nail.gradient?.from || nail.baseColor}
            onChange={(e) => update({ gradient: { ...(nail.gradient || {}), from: e.target.value } })}
          />
          <label>Hasta</label>
          <input
            type="color"
            value={nail.gradient?.to || '#FFFFFF'}
            onChange={(e) => update({ gradient: { ...(nail.gradient || {}), to: e.target.value } })}
          />
        </div>
      )}

      {nail.pattern === 'french' && (
        <div className="french-controls">
          <label>Color de punta</label>
          <input
            type="color"
            value={nail.tipColor || '#FFFFFF'}
            onChange={(e) => update({ tipColor: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
