import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NailEditor from '../components/NailEditor/NailEditor';
import { STARTER_TEMPLATES } from '../data/defaultDesigns';
import { createDefaultDesign } from '../data/nailPatterns';
import FullDesignUpload from '../components/FullDesignUpload/FullDesignUpload';
import ARTemplateGallery from '../components/ARTemplateGallery/ARTemplateGallery';

export default function NailDesigner() {
  const location = useLocation();
  const [design, setDesign] = useState(() => location.state?.design || createDefaultDesign());
  // loadToken identifica un evento de "cargar un diseÃ±o completo nuevo"
  // (plantilla de empresa, diseÃ±o en blanco, y en el futuro: diseÃ±o
  // personalizado del catÃ¡logo). Solo cuando este token cambia, NailEditor
  // debe sustituir su estado interno por initialDesign. Los cambios que el
  // propio editor emite via onDesignChange (color, forma, decoraciones...)
  // actualizan `design` pero NO deben disparar una recarga del editor, para
  // no perder el trabajo del usuario a mitad de ediciÃ³n.
  const [loadToken, setLoadToken] = useState(() => (location.state?.design ? 1 : 0));
  const navigate = useNavigate();

  function loadDesign(nextDesign) {
    setDesign(nextDesign);
    setLoadToken((t) => t + 1);
  }

  return (
    <div className="page nail-designer">
      <h1>DiseÃ±a tus uÃ±as</h1>

      <div className="templates-row">
        <span>Plantillas:</span>
        {STARTER_TEMPLATES.map((t, i) => (
          <button key={i} type="button" onClick={() => loadDesign({ ...t, id: null })}>
            {t.name}
          </button>
        ))}
        <button type="button" onClick={() => loadDesign(createDefaultDesign())}>En blanco</button>
      </div>

      <ARTemplateGallery onLoad={loadDesign} />

      <FullDesignUpload design={design} onLoad={loadDesign} />

      <NailEditor initialDesign={design} loadToken={loadToken} onDesignChange={setDesign} />

      <button
        type="button"
        className="primary cta-try-on"
        onClick={() => navigate('/probar-diseno', { state: { design } })}
      >
        Probar en mi mano â†’
      </button>
    </div>
  );
}`r`n