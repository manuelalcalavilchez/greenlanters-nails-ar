// Funcional en este MVP: añadir/quitar puntos y líneas con posición fija de
// partida (la usuaria las reposiciona arrastrando — arrastre pendiente de
// implementar, ver TODO). Pegatinas/piedras/imágenes requieren un catálogo
// de assets real (Fase 3) — aquí solo se define el modelo de datos y el tipo.

export default function NailDecorationPanel({ nail, onChange }) {
  function addDecoration(type) {
    const deco = {
      type,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      color: '#FFFFFF',
    };
    onChange({ ...nail, decorations: [...nail.decorations, deco] });
  }

  function removeDecoration(index) {
    const next = [...nail.decorations];
    next.splice(index, 1);
    onChange({ ...nail, decorations: next });
  }

  return (
    <div className="decoration-panel">
      <div className="decoration-actions">
        <button type="button" onClick={() => addDecoration('dot')}>+ Punto</button>
        <button type="button" onClick={() => addDecoration('line')}>+ Línea</button>
        <button type="button" disabled title="Requiere catálogo de assets (Fase 3)">
          + Pegatina (pendiente)
        </button>
        <button type="button" disabled title="Requiere catálogo de assets (Fase 3)">
          + Piedra (pendiente)
        </button>
      </div>
      <ul className="decoration-list">
        {nail.decorations.map((deco, i) => (
          <li key={i}>
            {deco.type}
            <button type="button" onClick={() => removeDecoration(i)} aria-label="Eliminar">✕</button>
          </li>
        ))}
      </ul>
      {/* TODO Fase 1.1: arrastre táctil de decoraciones sobre NailCanvas
          (pointerdown/pointermove actualizando deco.x/deco.y en tiempo real). */}
    </div>
  );
}
