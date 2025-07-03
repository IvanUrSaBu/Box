import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import DataTable from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { tournamentService } from '../../services/tournamentService';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Trophy, Calendar, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TournamentsPage = () => {
  const navigate = useNavigate();
  const { isGeneralAdmin, isClubAdmin, user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: deleteTournament, loading: deleting } = useAsyncOperation();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tournamentService.getTournaments();
      setTournaments(response.torneos || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tournament) => {
    navigate(`/torneos/${tournament.id}/editar`);
  };

  const handleView = (tournament) => {
    navigate(`/torneos/${tournament.id}`);
  };

  const handleDelete = async (tournament) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el torneo "${tournament.nombre}"?`)) {
      return;
    }

    try {
      await deleteTournament(() => tournamentService.deleteTournament(tournament.id));
      await fetchTournaments(); // Recargar la lista
    } catch (err) {
      setError(err);
    }
  };

  const canCreateTournament = () => {
    return isGeneralAdmin() || isClubAdmin();
  };

  const canEditTournament = (tournament) => {
    if (isGeneralAdmin()) return true;
    if (isClubAdmin() && tournament.clubOrganizadorId === user?.clubId) return true;
    return false;
  };

  const getStatusBadge = (tournament) => {
    const now = new Date();
    const startDate = new Date(tournament.fechaInicio);
    const endDate = tournament.fechaFin ? new Date(tournament.fechaFin) : null;

    if (endDate && now > endDate) {
      return <Badge variant="secondary">Finalizado</Badge>;
    } else if (now >= startDate) {
      return <Badge variant="default">En Curso</Badge>;
    } else {
      return <Badge variant="outline">Próximo</Badge>;
    }
  };

  const columns = [
    {
      header: 'Torneo',
      render: (tournament) => (
        <div>
          <div className="font-medium">{tournament.nombre}</div>
          <div className="text-sm text-gray-500">{tournament.descripcion}</div>
        </div>
      )
    },
    {
      header: 'Estado',
      render: (tournament) => getStatusBadge(tournament)
    },
    {
      header: 'Fechas',
      render: (tournament) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(tournament.fechaInicio), 'dd MMM yyyy', { locale: es })}
          </div>
          {tournament.fechaFin && (
            <div className="text-gray-500">
              hasta {format(new Date(tournament.fechaFin), 'dd MMM yyyy', { locale: es })}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Ubicación',
      render: (tournament) => (
        <div className="text-sm">
          {tournament.ubicacion ? (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {tournament.ubicacion}
            </div>
          ) : (
            <span className="text-gray-400">No especificada</span>
          )}
        </div>
      )
    },
    {
      header: 'Organizador',
      render: (tournament) => (
        <div>
          {tournament.clubOrganizador ? (
            <Badge variant="outline">{tournament.clubOrganizador.nombre}</Badge>
          ) : (
            <span className="text-gray-400">Sin organizador</span>
          )}
        </div>
      )
    },
    {
      header: 'Tipo',
      render: (tournament) => (
        <Badge variant={tournament.esPublico ? "default" : "secondary"}>
          {tournament.esPublico ? 'Público' : 'Privado'}
        </Badge>
      )
    },
    {
      header: 'Combates',
      render: (tournament) => (
        <div className="text-sm text-center">
          {tournament.combates?.length || 0}
        </div>
      )
    }
  ];

  // Calcular estadísticas
  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter(t => {
    const now = new Date();
    const start = new Date(t.fechaInicio);
    const end = t.fechaFin ? new Date(t.fechaFin) : null;
    return now >= start && (!end || now <= end);
  }).length;
  const upcomingTournaments = tournaments.filter(t => new Date(t.fechaInicio) > new Date()).length;
  const totalFights = tournaments.reduce((sum, t) => sum + (t.combates?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Torneos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los torneos de boxeo del sistema
          </p>
        </div>
        
        {canCreateTournament() && (
          <Button onClick={() => navigate('/torneos/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Torneo
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Torneos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTournaments}</div>
            <p className="text-xs text-muted-foreground">
              Torneos registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Torneos Activos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTournaments}</div>
            <p className="text-xs text-muted-foreground">
              En curso actualmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Torneos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTournaments}</div>
            <p className="text-xs text-muted-foreground">
              Por comenzar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Combates</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFights}</div>
            <p className="text-xs text-muted-foreground">
              En todos los torneos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Torneos</CardTitle>
          <CardDescription>
            Todos los torneos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tournaments}
            columns={columns}
            searchPlaceholder="Buscar torneos..."
            onView={handleView}
            onEdit={(tournament) => canEditTournament(tournament) ? handleEdit(tournament) : undefined}
            onDelete={(tournament) => canEditTournament(tournament) ? handleDelete(tournament) : undefined}
            actions={true}
          />
        </CardContent>
      </Card>

      {/* Loading overlay for delete operation */}
      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner className="mr-2" />
            <span>Eliminando torneo...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;

