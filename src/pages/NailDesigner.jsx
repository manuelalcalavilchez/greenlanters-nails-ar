import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NailEditor from '../components/NailEditor/NailEditor';
import { createDefaultDesign } from '../data/nailPatterns';
import ARTemplateGallery from '../components/ARTemplateGallery/ARTemplateGallery';

export default function NailDesigner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [design, setDesign] = useState(
    () => location.state?.design || createDefaultDesign()
  );
  const [loadToken, setLoadToken] = useState(
    () => (location.state?.design ? 1 : 0)
  );

  function loadDesign(nextDesign) {
    setDesign(nextDesign);
    setLoadToken((token) => token + 1);
  }

  return (
    <div className="page nail-designer">
      <header className="nail-designer__intro">
        <span className="eyebrow">REALIDAD AUMENTADA</span>
        <h1>Diseña tus uñas</h1>
        <p>Elige una plantilla y pruébala directamente en tu mano.</p>
      </header>

      <ARTemplateGallery onLoad={loadDesign} />

      <NailEditor
        initialDesign={design}
        loadToken={loadToken}
        onDesignChange={setDesign}
      />

      <button
        type="button"
        className="primary cta-try-on"
        onClick={() => navigate('/probar-diseno', { state: { design } })}
      >
        Probar en mi mano →
      </button>
    </div>
  );
}
