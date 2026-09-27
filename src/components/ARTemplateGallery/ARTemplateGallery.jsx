import { useState } from 'react';
import { AR_TEMPLATE_CATALOG, buildARTemplateDesign } from '../../data/arTemplates';

export default function ARTemplateGallery({ onLoad, selected }) {
  const [activeVariant, setActiveVariant] = useState({});

  function choose(template, variant) {
    setActiveVariant((current) => ({ ...current, [template.id]: variant }));
    onLoad(buildARTemplateDesign(template, variant));
  }

  return (
    <section className="ar-template-gallery">
      <div className="ar-template-gallery__intro">
        <div>
          <h2>Elige tu modelo</h2>
          <p>Desliza y toca una plantilla para verla en las 5 uñas.</p>
        </div>
        <span className="ar-template-gallery__count">{AR_TEMPLATE_CATALOG.length} modelos</span>
      </div>
      <div className="ar-template-gallery__rail" aria-label="Modelos de uñas">
        {AR_TEMPLATE_CATALOG.map((template) => {
          const variant = activeVariant[template.id] || (template.accent ? 'accent' : 'base');
          const isSelected = selected?.id === template.id && selected?.variant === variant;
          return (
            <article key={template.id} className={`ar-template-card ${isSelected ? 'is-selected' : ''}`}>
              <button type="button" className="ar-template-card__select" onClick={() => choose(template, variant)}>
                <div className="ar-template-card__preview">
                  <img src={template.base} alt="" aria-hidden="true" />
                </div>
                <strong>{template.label}</strong>
                <small>{template.shape}</small>
              </button>
              <div className="ar-template-card__actions">
                <button type="button" className={variant === 'base' ? 'active' : ''} onClick={() => choose(template, 'base')}>Base</button>
                {template.accent && (
                  <button type="button" className={variant === 'accent' ? 'active primary' : ''} onClick={() => choose(template, 'accent')}>Acento</button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
