import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATALOG_MODELS, modelToDesign } from '../data/catalogModels';

export default function Catalog() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  function useModel(model) {
    navigate('/disenador', { state: { design: modelToDesign(model) } });
  }

  return (
    <div className="page catalog-page">
      <div className="catalog-hero">
        <p className="eyebrow">LAS GREENLANTERS NAILS</p>
        <h1>Modelos de demostración</h1>
        <p>Selecciona un modelo visual, personalízalo y pruébalo en tu mano con realidad aumentada.</p>
      </div>
      <div className="catalog__grid">
        {CATALOG_MODELS.map((model) => (
          <article className="catalog-card" key={model.id}>
            <button className="catalog-card__image-button" type="button" onClick={() => setSelected(model)}>
              <img src={model.image} alt={model.name} />
            </button>
            <div className="catalog-card__body">
              <h2>{model.name}</h2>
              <p>{model.description}</p>
              <strong>{model.price.toFixed(2).replace('.', ',')} €</strong>
              <button className="primary" type="button" onClick={() => useModel(model)}>
                Diseñar y probar
              </button>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <div className="catalog-modal" role="dialog" aria-modal="true">
          <div className="catalog-modal__box">
            <img src={selected.image} alt={selected.name} />
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <div className="catalog-modal__actions">
              <button className="primary" type="button" onClick={() => useModel(selected)}>Usar este diseño</button>
              <button type="button" onClick={() => setSelected(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
