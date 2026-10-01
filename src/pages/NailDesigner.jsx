import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NailEditor from '../components/NailEditor/NailEditor';
import { createDefaultDesign } from '../data/nailPatterns';
import ARTemplateGallery from '../components/ARTemplateGallery/ARTemplateGallery';
import DesignPreviewStrip from '../components/DesignPreviewStrip/DesignPreviewStrip';

export default function NailDesigner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [design, setDesign] = useState(() => location.state?.design || createDefaultDesign());
  const [loadToken, setLoadToken] = useState(() => (location.state?.design ? 1 : 0));

  function loadDesign(nextDesign) {
    setDesign(nextDesign);
    setLoadToken((token) => token + 1);
  }

  return (
    <div className="page nail-designer">
      <div className="atelier-brandbar">
        <img src="/logo.png" alt="Las Greenlanters Nails" />
        <div>
          <strong>LAS GREENLANTERS NAILS</strong>
          <span>NAIL ATELIER · VIRTUAL TRY-ON</span>
        </div>
      </div>

      <header className="nail-designer__intro">
        <span className="eyebrow">VIRTUAL TRY-ON</span>
        <h1>Encuentra tu diseño</h1>
        <p>Elige un modelo y descubre cómo queda en tus cinco uñas.</p>
      </header>

      <div className="mobile-design-stage">
        <ARTemplateGallery onLoad={loadDesign} selected={design.arTemplate} />
        <DesignPreviewStrip
          design={design}
          onTryOn={() => navigate('/probar-diseno', { state: { design } })}
        />
      </div>

      <NailEditor
        initialDesign={design}
        loadToken={loadToken}
        onDesignChange={setDesign}
        compact
      />
    </div>
  );
}
