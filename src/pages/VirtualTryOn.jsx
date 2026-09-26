import { useLocation, useNavigate } from 'react-router-dom';
import ARCamera from '../components/ARCamera/ARCamera';
import { createDefaultDesign } from '../data/nailPatterns';
import { isCameraSupported, isSecureContextOk } from '../services/cameraService';

export default function VirtualTryOn() {
  const location = useLocation();
  const navigate = useNavigate();
  const design = location.state?.design || createDefaultDesign();

  if (!isCameraSupported()) {
    return <div className="page"><p>Tu navegador no soporta acceso a cámara.</p></div>;
  }
  if (!isSecureContextOk()) {
    return <div className="page"><p>Esta función requiere HTTPS (o localhost) para acceder a la cámara.</p></div>;
  }

  return (
    <div className="page virtual-try-on">
      <button type="button" onClick={() => navigate(-1)}>← Volver al editor</button>
      <h1>Prueba virtual</h1>
      <p className="privacy-note">
        El vídeo se procesa en tu dispositivo. No se envía a ningún servidor salvo que pulses "Capturar / Compartir".
      </p>
      <ARCamera design={design} preferredHand={design.hand} />
    </div>
  );
}
