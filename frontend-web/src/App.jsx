import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importuri Pagini
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Catalog from './pages/Catalog.jsx';
import DashboardProfesor from './pages/DashboardProfesor';
import VizualizareGrile from './pages/VizualizareGrile';
import SustinereTest from './pages/SustinereTest';
import CatalogNote from './pages/CatalogNote';
import ExplorareCursuri from './pages/ExplorareCursuri'; 
import AdminDashboard from './pages/AdminDashboard'; 

// Import Gardian de Rute
import ProtectedRoute from './ProtectedRoute'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta 1: Pagina de Login publică (fără meniu lateral) */}
        <Route path="/" element={<Login />} />

        {/* Ruta 2: Toate paginile cu Meniu Lateral trec prin MainLayout */}
        <Route element={<MainLayout />}>
          
          {/* ========================================== */}
          {/* RUTE SPECIFICE STUDENTULUI                 */}
          {/* ========================================== */}
          <Route path="/catalog" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <Catalog />
            </ProtectedRoute>
          } />
          
          <Route path="/explorare-cursuri" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <ExplorareCursuri />
            </ProtectedRoute>
          } />

          <Route path="/test" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <SustinereTest />
            </ProtectedRoute>
          } />

          {/* ========================================== */}
          {/* RUTE SPECIFICE PROFESORULUI (și Adminului) */}
          {/* ========================================== */}
          <Route path="/dashboard-profesor" element={
            <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
              <DashboardProfesor />
            </ProtectedRoute>
          } />

          <Route path="/grile" element={
            <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
              <VizualizareGrile />
            </ProtectedRoute>
          } />

          <Route path="/note" element={
            <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
              <CatalogNote />
            </ProtectedRoute>
          } />

          {/* ========================================== */}
          {/* RUTE STRICT PENTRU ADMINISTRATOR           */}
          {/* ========================================== */}
          <Route path="/admin/sistem" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

        </Route>

        {/* Orice altă adresă duce la Login ca măsură de siguranță fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;