import NailCanvas from '../NailCanvas/NailCanvas';
import { FINGERS } from '../../data/nailShapes';

export default function DesignPreviewStrip({ design, onTryOn }) {
  return (
    <section className="design-preview-strip">
      <div className="design-preview-strip__head">
        <div>
          <strong>Tu diseño · 5 uñas</strong>
          <small>{design?.name || 'Plantilla seleccionada'}</small>
        </div>
        <button type="button" className="primary design-preview-strip__cta" onClick={onTryOn}>
          Ver en realidad aumentada
        </button>
      </div>
      <div className="design-preview-strip__scroll" aria-label="Previsualización de las cinco uñas">
        {FINGERS.map((finger) => {
          const nail = design?.nails?.find((item) => item.finger === finger.id);
          if (!nail) return null;
          return (
            <div className="design-preview-strip__nail" key={finger.id}>
              <NailCanvas nail={nail} size={74} />
              <span>{finger.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
