import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas de autenticación
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Páginas principales (se crearán en las siguientes fases)
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/ProfilePage';

// Páginas de clubes
import ClubsPage from './pages/clubs/ClubsPage';
import ClubFormPage from './pages/clubs/ClubFormPage';
import ClubDetailPage from './pages/clubs/ClubDetailPage';

// Páginas de boxeadores
import BoxersPage from './pages/boxers/BoxersPage';
import BoxerFormPage from './pages/boxers/BoxerFormPage';

// Páginas de torneos
import TournamentsPage from './pages/tournaments/TournamentsPage';
import TournamentFormPage from './pages/tournaments/TournamentFormPage';

// Páginas de combates
import FightsPage from './pages/fights/FightsPage';
import FightFormPage from './pages/fights/FightFormPage';
import FightResultPage from './pages/fights/FightResultPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Rutas públicas */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            
            {/* Rutas protegidas */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="perfil" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Rutas de clubes */}
            <Route path="clubes" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <ClubsPage />
              </ProtectedRoute>
            } />
            
            <Route path="clubes/nuevo" element={
              <ProtectedRoute roles={['administrador_general']}>
                <ClubFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="clubes/:id" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <ClubDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="clubes/:id/editar" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <ClubFormPage />
              </ProtectedRoute>
            } />
            
            {/* Rutas de boxeadores */}
            <Route path="boxeadores" element={
              <ProtectedRoute>
                <BoxersPage />
              </ProtectedRoute>
            } />
            
            <Route path="boxeadores/nuevo" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <BoxerFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="boxeadores/:id/editar" element={
              <ProtectedRoute>
                <BoxerFormPage />
              </ProtectedRoute>
            } />
            
            {/* Rutas de torneos */}
            <Route path="torneos" element={
              <ProtectedRoute>
                <TournamentsPage />
              </ProtectedRoute>
            } />
            
            <Route path="torneos/nuevo" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <TournamentFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="torneos/:id/editar" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <TournamentFormPage />
              </ProtectedRoute>
            } />
            
            {/* Rutas de combates */}
            <Route path="combates" element={
              <ProtectedRoute>
                <FightsPage />
              </ProtectedRoute>
            } />
            
            <Route path="combates/nuevo" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <FightFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="combates/:id/editar" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <FightFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="combates/:id/resultado" element={
              <ProtectedRoute roles={['administrador_general', 'administrador_club']}>
                <FightResultPage />
              </ProtectedRoute>
            } />
            
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Ruta 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Página no encontrada</p>
                  <a href="/dashboard" className="text-blue-600 hover:text-blue-500">
                    Volver al Dashboard
                  </a>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

