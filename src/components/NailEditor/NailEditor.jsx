import { useCallback, useMemo, useState } from 'react';
import NailCanvas from '../NailCanvas/NailCanvas';
import NailShapeSelector from '../NailShapeSelector/NailShapeSelector';
import NailPalette from '../NailPalette/NailPalette';
import NailDecorationPanel from '../NailDecorationPanel/NailDecorationPanel';
import { FINGERS } from '../../data/nailShapes';
import { createDefaultDesign } from '../../data/nailPatterns';
import { saveDesignLocal } from '../../services/designsApi';

const HISTORY_LIMIT = 30;

export default function NailEditor({ initialDesign, onDesignChange }) {
  const [design, setDesign] = useState(initialDesign || createDefaultDesign());
  const [selectedFinger, setSelectedFinger] = useState('thumb');
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const selectedNail = useMemo(
    () => design.nails.find((n) => n.finger === selectedFinger),
    [design, selectedFinger]
  );

  const pushHistory = useCallback((prevDesign) => {
    setHistory((h) => [...h.slice(-HISTORY_LIMIT + 1), prevDesign]);
    setFuture([]);
  }, []);

  function updateDesign(nextDesign) {
    pushHistory(design);
    setDesign(nextDesign);
    onDesignChange?.(nextDesign);
  }

  function updateSelectedNail(patch) {
    const nextNails = design.nails.map((n) =>
      n.finger === selectedFinger ? { ...n, ...patch } : n
    );
    updateDesign({ ...design, nails: nextNails });
  }

  function undo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [design, ...f]);
    setDesign(prev);
    onDesignChange?.(prev);
  }

  function redo() {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, design]);
    setDesign(next);
    onDesignChange?.(next);
  }

  function copyToOtherFinger(targetFinger) {
    if (!selectedNail) return;
    const nextNails = design.nails.map((n) =>
      n.finger === targetFinger ? { ...selectedNail, finger: targetFinger } : n
    );
    updateDesign({ ...design, nails: nextNails });
  }

  function applyToAllFingers() {
    if (!selectedNail) return;
    const nextNails = design.nails.map((n) => ({ ...selectedNail, finger: n.finger }));
    updateDesign({ ...design, nails: nextNails });
  }

  function resetNail() {
    updateSelectedNail({
      shape: 'almond',
      baseColor: '#F4C7D7',
      tipColor: null,
      pattern: 'solid',
      gradient: null,
      decorations: [],
    });
  }

  function resetAll() {
    updateDesign(createDefaultDesign(design.name, design.hand));
  }

  function handleSave() {
    const saved = saveDesignLocal(design);
    setDesign(saved);
    onDesignChange?.(saved);
  }

  function handleExportPng() {
    // Compone las 5 uñas en una sola imagen PNG usando un canvas offscreen.
    const size = 150;
    const canvas = document.createElement('canvas');
    canvas.width = size * design.nails.length;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // Reutiliza el mismo pintado que NailCanvas dibujando manualmente aquí
    // (evitamos duplicar canvases React fuera del DOM).
    import('../../ar/nailRenderer').then(({ paintPattern }) => {
      design.nails.forEach((nail, i) => {
        const offsetX = i * size;
        ctx.save();
        ctx.translate(offsetX + size / 2, size / 2);
        const w = size * 0.55;
        const h = w * 1.3;
        ctx.beginPath();
        ctx.rect(-w / 2, -h / 2, w, h);
        ctx.clip();
        paintPattern(ctx, nail, -w / 2, -h / 2, w, h);
        ctx.restore();
      });
      const link = document.createElement('a');
      link.download = `${design.name || 'diseno'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  return (
    <div className="nail-editor">
      <div className="nail-editor__hands">
        {FINGERS.map((f) => {
          const nail = design.nails.find((n) => n.finger === f.id);
          return (
            <div key={f.id} className="finger-slot">
              <NailCanvas
                nail={nail}
                selected={selectedFinger === f.id}
                onClick={() => setSelectedFinger(f.id)}
              />
              <span>{f.label}</span>
            </div>
          );
        })}
      </div>

      <div className="nail-editor__panel">
        <NailShapeSelector
          value={selectedNail.shape}
          onChange={(shape) => updateSelectedNail({ shape })}
        />
        <NailPalette nail={selectedNail} onChange={updateSelectedNail} />
        <NailDecorationPanel nail={selectedNail} onChange={updateSelectedNail} />

        <div className="nail-editor__copy-actions">
          <label>Copiar a:</label>
          {FINGERS.filter((f) => f.id !== selectedFinger).map((f) => (
            <button key={f.id} type="button" onClick={() => copyToOtherFinger(f.id)}>
              {f.label}
            </button>
          ))}
          <button type="button" onClick={applyToAllFingers}>Aplicar a todas</button>
        </div>

        <div className="nail-editor__actions">
          <button type="button" onClick={undo} disabled={history.length === 0}>Deshacer</button>
          <button type="button" onClick={redo} disabled={future.length === 0}>Rehacer</button>
          <button type="button" onClick={resetNail}>Restablecer uña</button>
          <button type="button" onClick={resetAll}>Restablecer todo</button>
          <button type="button" onClick={handleSave} className="primary">Guardar diseño</button>
          <button type="button" onClick={handleExportPng}>Exportar PNG</button>
        </div>
      </div>
    </div>
  );
}
