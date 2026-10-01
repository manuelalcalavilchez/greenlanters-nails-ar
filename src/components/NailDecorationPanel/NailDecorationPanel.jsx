// Decoraciones básicas y carga de imágenes personalizadas.
// Las imágenes se guardan como data URL dentro del diseño para que el diseño
// guardado en localStorage siga siendo autocontenido y pueda volver a abrirse.

export default function NailDecorationPanel({ nail, onChange }) {
  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      window.alert('Selecciona una imagen JPG, PNG o WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert('La imagen no puede superar 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const deco = {
        type: 'image',
        src: reader.result,
        name: file.name,
        x: 0.5,
        y: 0.5,
        rotation: 0,
        scale: 1,
        color: '#FFFFFF',
      };
      onChange({ ...nail, decorations: [...nail.decorations, deco] });
    };
    reader.readAsDataURL(file);
  }

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
        <label className="upload-design-button">
          + Cargar diseño / imagen
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
            hidden
          />
        </label>
        <small>La imagen se añade a la uña seleccionada. Máximo 5 MB.</small>
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
