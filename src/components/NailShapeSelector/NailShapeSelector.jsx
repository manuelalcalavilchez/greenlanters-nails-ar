import { NAIL_SHAPES } from '../../data/nailShapes';

const SVG_SHAPES = new Set(['round', 'oval', 'almond', 'square', 'coffin', 'stiletto']);

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
          {SVG_SHAPES.has(shape.id) ? (
            <img
              src={`/nail-ar-templates/shapes/${shape.id}.svg`}
              alt=""
              aria-hidden="true"
              className="shape-btn__svg"
            />
          ) : (
            <span className="shape-btn__fallback" aria-hidden="true">⌁</span>
          )}
          <span>{shape.label}</span>
        </button>
      ))}
    </div>
  );
}
