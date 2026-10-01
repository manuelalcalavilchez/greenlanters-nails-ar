import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NailDesigner from './pages/NailDesigner';
import VirtualTryOn from './pages/VirtualTryOn';
import SavedDesigns from './pages/SavedDesigns';
import Catalog from './pages/Catalog';
import './styles/global.css';

const MAIN_SITE = 'https://lasgreenlantersnail.es/';

function AppHeader() {
  return (
    <header className="app-header">
      <a className="app-header__brand" href={MAIN_SITE} aria-label="Volver a Las Greenlanters Nails">
        <span className="brand">Las Greenlanters Nails</span>
      </a>
      <nav className="app-header__nav" aria-label="Navegación principal">
        <a className="app-header__home" href={MAIN_SITE}>Inicio</a>
        <Link to="/catalogo">Catálogo</Link>
        <Link to="/disenador">Diseñador</Link>
        <Link to="/mis-disenos">Mis diseños</Link>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppHeader />
      <Routes>
        <Route path="/" element={<NailDesigner />} />
        <Route path="/disenador" element={<NailDesigner />} />
        <Route path="/probar-diseno" element={<VirtualTryOn />} />
        <Route path="/mis-disenos" element={<SavedDesigns />} />
        <Route path="/catalogo" element={<Catalog />} />
      </Routes>
    </BrowserRouter>
  );
}