import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/ui/StatCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents';
import StatsChart from '../../components/dashboard/StatsChart';
import { Users, Building, Trophy, Swords, TrendingUp, Award } from 'lucide-react';

const DashboardPage = () => {
  const { user, isGeneralAdmin, isClubAdmin, isBoxer } = useAuth();
  const [stats, setStats] = useState({
    clubs: 0,
    boxers: 0,
    tournaments: 0,
    fights: 0
  });

  useEffect(() => {
    // Simular carga de estadísticas
    // En una implementación real, aquí se harían llamadas a la API
    setStats({
      clubs: 12,
      boxers: 156,
      tournaments: 8,
      fights: 342
    });
  }, []);

  const getDashboardTitle = () => {
    if (isGeneralAdmin()) return 'Dashboard - Administrador General';
    if (isClubAdmin()) return 'Dashboard - Administrador de Club';
    if (isBoxer()) return 'Dashboard - Boxeador';
    return 'Dashboard';
  };

  const getWelcomeMessage = () => {
    if (isGeneralAdmin()) {
      return 'Gestiona todos los clubes, boxeadores y torneos del sistema.';
    }
    if (isClubAdmin()) {
      return 'Gestiona tu club, boxeadores y torneos.';
    }
    if (isBoxer()) {
      return 'Consulta tu perfil, combates y estadísticas.';
    }
    return 'Bienvenido al sistema de gestión de boxeo amateur.';
  };

  const renderAdminStats = () => (
    <>
      {isGeneralAdmin() && (
        <StatCard
          title="Clubes Registrados"
          value={stats.clubs}
          description="Total de clubes en el sistema"
          icon={Building}
          trend="up"
          trendValue="+2 este mes"
        />
      )}
      
      <StatCard
        title="Boxeadores Activos"
        value={stats.boxers}
        description={isBoxer() ? 'Tu perfil de boxeador' : 'Total de boxeadores registrados'}
        icon={Users}
        trend="up"
        trendValue="+12 este mes"
      />
      
      <StatCard
        title="Torneos"
        value={stats.tournaments}
        description={isBoxer() ? 'Torneos en los que participas' : 'Torneos activos'}
        icon={Trophy}
        trend="neutral"
        trendValue="3 activos"
      />
      
      <StatCard
        title="Combates"
        value={stats.fights}
        description={isBoxer() ? 'Tus combates totales' : 'Total de combates registrados'}
        icon={Swords}
        trend="up"
        trendValue="+28 este mes"
      />
    </>
  );

  const renderBoxerStats = () => (
    <>
      <StatCard
        title="Combates Totales"
        value="15"
        description="Total de combates disputados"
        icon={Swords}
      />
      
      <StatCard
        title="Victorias"
        value="12"
        description="80% de efectividad"
        icon={Award}
        trend="up"
        trendValue="Racha de 3"
      />
      
      <StatCard
        title="Ranking"
        value="#3"
        description="En tu categoría de peso"
        icon={TrendingUp}
        trend="up"
        trendValue="+2 posiciones"
      />
      
      <StatCard
        title="Próximo Combate"
        value="7 días"
        description="vs Miguel Torres"
        icon={Trophy}
      />
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getDashboardTitle()}
        </h1>
        <p className="text-blue-100">
          Bienvenido, {user?.nombreUsuario}. {getWelcomeMessage()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isBoxer() ? renderBoxerStats() : renderAdminStats()}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {!isBoxer() && (
          <StatsChart
            type="bar"
            title="Actividad Mensual"
            description="Combates y torneos por mes"
          />
        )}
        
        <StatsChart
          type={isBoxer() ? "line" : "pie"}
          title={isBoxer() ? "Tu Progreso" : "Distribución por Categorías"}
          description={isBoxer() ? "Evolución de tu rendimiento" : "Boxeadores por categoría de peso"}
        />
      </div>

      {/* Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <UpcomingEvents />
      </div>

      {/* Additional Info for Boxers */}
      {isBoxer() && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tu Record Personal
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-green-700">Victorias</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-red-700">Derrotas</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-yellow-700">Empates</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

