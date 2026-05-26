import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Catalog from './pages/Catalog.jsx';
import DashboardProfesor from './pages/DashboardProfesor';
import VizualizareGrile from './pages/VizualizareGrile';
import SustinereTest from './pages/SustinereTest';
import CatalogNote from './pages/CatalogNote';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta 1: Pagina de Login (fără meniu lateral) */}
        <Route path="/" element={<Login />} />

        {/* Ruta 2: Toate paginile cu Meniu Lateral trec prin MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/dashboard-profesor" element={<DashboardProfesor />} />
          <Route path="/grile" element={<VizualizareGrile />} />
          <Route path="/test" element={<SustinereTest />} />
          <Route path="/note" element={<CatalogNote />} />
        </Route>

        {/* Orice altă adresă duce la Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;