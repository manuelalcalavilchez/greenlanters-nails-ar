import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NailDesigner from './pages/NailDesigner';
import VirtualTryOn from './pages/VirtualTryOn';
import SavedDesigns from './pages/SavedDesigns';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <header className="app-header">
        <span className="brand">Greenlanters Nails</span>
        <nav>
          <Link to="/disenador">Diseñador</Link>
          <Link to="/mis-disenos">Mis diseños</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<NailDesigner />} />
        <Route path="/disenador" element={<NailDesigner />} />
        <Route path="/probar-diseno" element={<VirtualTryOn />} />
        <Route path="/mis-disenos" element={<SavedDesigns />} />
      </Routes>
    </BrowserRouter>
  );
}
