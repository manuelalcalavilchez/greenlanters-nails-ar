import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDesignsLocal, deleteDesignLocal } from '../services/designsApi';
import DesignPreview from '../components/DesignPreview/DesignPreview';

export default function SavedDesigns() {
  const [designs, setDesigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setDesigns(listDesignsLocal());
  }, []);

  function handleDelete(id) {
    deleteDesignLocal(id);
    setDesigns(listDesignsLocal());
  }

  if (designs.length === 0) {
    return <div className="page"><p>Todavía no has guardado ningún diseño.</p></div>;
  }

  return (
    <div className="page saved-designs">
      <h1>Mis diseños</h1>
      <div className="saved-designs__grid">
        {designs.map((d) => (
          <div key={d.id} className="saved-design-card">
            <DesignPreview design={d} />
            <div className="saved-design-card__actions">
              <button type="button" onClick={() => navigate('/probar-diseno', { state: { design: d } })}>
                Probar
              </button>
              <button type="button" onClick={() => handleDelete(d.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
