import { AR_TEMPLATE_CATALOG, buildARTemplateDesign } from '../../data/arTemplates';

export default function ARTemplateGallery({ onLoad }) {
  return (
    <section className="ar-template-gallery">
      <div className="ar-template-gallery__intro">
        <div>
          <h2>Modelos AR incluidos</h2>
          <p>Plantillas SVG entregadas para probar directamente en la mano.</p>
        </div>
        <span className="ar-template-gallery__count">
          {AR_TEMPLATE_CATALOG.length} modelos · 13 variantes
        </span>
      </div>

      <div className="ar-template-gallery__grid">
        {AR_TEMPLATE_CATALOG.map((template) => (
          <article key={template.id} className="ar-template-card">
            <div className="ar-template-card__preview">
              <img src={template.base} alt="" aria-hidden="true" />
            </div>
            <div className="ar-template-card__body">
              <strong>{template.label}</strong>
              <small>{template.shape} · {template.source}</small>
              <div className="ar-template-card__actions">
                <button type="button" onClick={() => onLoad(buildARTemplateDesign(template, 'base'))}>
                  Base
                </button>
                {template.accent && (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => onLoad(buildARTemplateDesign(template, 'accent'))}
                  >
                    Con acento
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
