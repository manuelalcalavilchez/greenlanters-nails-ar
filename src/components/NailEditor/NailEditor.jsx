import { useEffect, useMemo, useRef, useState } from 'react';
import NailCanvas from '../NailCanvas/NailCanvas';
import NailShapeSelector from '../NailShapeSelector/NailShapeSelector';
import NailPalette from '../NailPalette/NailPalette';
import { FINGERS } from '../../data/nailShapes';
import { createDefaultDesign } from '../../data/nailPatterns';

export default function NailEditor({ initialDesign, loadToken, onDesignChange }) {
  const [design, setDesign] = useState(initialDesign || createDefaultDesign());
  const [selectedFinger, setSelectedFinger] = useState('thumb');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDesign(initialDesign || createDefaultDesign());
  }, [loadToken]);

  const selectedNail = useMemo(
    () => design.nails.find((nail) => nail.finger === selectedFinger) || design.nails[0],
    [design, selectedFinger]
  );

  function updateSelectedNail(patch) {
    const nextNails = design.nails.map((nail) =>
      nail.finger === selectedFinger ? { ...nail, ...patch } : nail
    );
    const nextDesign = { ...design, nails: nextNails };
    setDesign(nextDesign);
    onDesignChange?.(nextDesign);
  }

  return (
    <section className="nail-editor">
      <div className="nail-editor__hands">
        {FINGERS.map((finger) => {
          const nail = design.nails.find((item) => item.finger === finger.id);
          return (
            <button
              key={finger.id}
              type="button"
              className={`finger-slot ${selectedFinger === finger.id ? 'active' : ''}`}
              onClick={() => setSelectedFinger(finger.id)}
            >
              <NailCanvas
                nail={nail}
                selected={selectedFinger === finger.id}
                onClick={() => setSelectedFinger(finger.id)}
              />
              <span>{finger.label}</span>
            </button>
          );
        })}
      </div>

      <div className="nail-editor__panel">
        <h2>Personaliza la plantilla</h2>
        <p className="nail-editor__hint">
          Selecciona una uña para cambiar su forma o color.
        </p>

        <NailShapeSelector
          value={selectedNail.shape}
          onChange={(shape) => updateSelectedNail({ shape })}
        />

        <NailPalette nail={selectedNail} onChange={updateSelectedNail} />
      </div>
    </section>
  );
}
