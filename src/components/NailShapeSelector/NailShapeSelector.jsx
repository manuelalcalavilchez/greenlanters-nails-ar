import { NAIL_SHAPES } from '../../data/nailShapes';

export default function NailShapeSelector({ value, onChange }) {
  return (
    <div className="shape-selector" role="radiogroup" aria-label="Forma de uña">
      {NAIL_SHAPES.map((shape) => (
        <button
          key={shape.id}
          type="button"
          className={`shape-btn ${value === shape.id ? 'active' : ''}`}
          onClick={() => onChange(shape.id)}
          aria-pressed={value === shape.id}
        >
          {shape.label}
        </button>
      ))}
    </div>
  );
}
