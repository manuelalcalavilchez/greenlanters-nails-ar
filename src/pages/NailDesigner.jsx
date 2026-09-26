import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NailEditor from '../components/NailEditor/NailEditor';
import { STARTER_TEMPLATES } from '../data/defaultDesigns';
import { createDefaultDesign } from '../data/nailPatterns';

export default function NailDesigner() {
  const [design, setDesign] = useState(createDefaultDesign());
  const navigate = useNavigate();

  return (
    <div className="page nail-designer">
      <h1>Diseña tus uñas</h1>

      <div className="templates-row">
        <span>Plantillas:</span>
        {STARTER_TEMPLATES.map((t, i) => (
          <button key={i} type="button" onClick={() => setDesign({ ...t, id: null })}>
            {t.name}
          </button>
        ))}
        <button type="button" onClick={() => setDesign(createDefaultDesign())}>En blanco</button>
      </div>

      <NailEditor initialDesign={design} onDesignChange={setDesign} />

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
