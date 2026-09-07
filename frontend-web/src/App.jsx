import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Catalog from './pages/Catalog.jsx';
import CourseDetail from './pages/CourseDetail';
import DashboardProfesor from './pages/DashboardProfesor';
import VizualizareGrile from './pages/VizualizareGrile';
import SustinereTest from './pages/SustinereTest';
import CatalogNote from './pages/CatalogNote';
import ExplorareCursuri from './pages/ExplorareCursuri';
import AdminDashboard from './pages/AdminDashboard';
import Orar from './pages/Orar';
import NoteStudent from './pages/NoteStudent';
import Profil from './pages/Profil';
import GlobalAnnouncements from './pages/GlobalAnnouncements';
import Agenda from './pages/Agenda';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route
            path="/anunturi"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
                <GlobalAnnouncements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
                <Agenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/:courseId"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explorare-cursuri"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <ExplorareCursuri />
              </ProtectedRoute>
            }
          />
          <Route
            path="/note-student"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <NoteStudent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orar"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER']}>
                <Orar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <SustinereTest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard-profesor"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                <DashboardProfesor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grile"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                <VizualizareGrile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/note"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER', 'ROLE_ADMIN']}>
                <CatalogNote />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/utilizatori"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cursuri"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sistem"
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_ADMIN']}>
                <Profil />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
