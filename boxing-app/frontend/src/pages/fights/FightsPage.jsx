import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import DataTable from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { fightService } from '../../services/fightService';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Swords, Calendar, Trophy, Target, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FightsPage = () => {
  const navigate = useNavigate();
  const { isGeneralAdmin, isClubAdmin, isBoxer, user } = useAuth();
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: deleteFight, loading: deleting } = useAsyncOperation();

  useEffect(() => {
    fetchFights();
  }, []);

  const fetchFights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fightService.getFights();
      setFights(response.combates || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fight) => {
    navigate(`/combates/${fight.id}/editar`);
  };

  const handleView = (fight) => {
    navigate(`/combates/${fight.id}`);
  };

  const handleRegisterResult = (fight) => {
    navigate(`/combates/${fight.id}/resultado`);
  };

  const handleDelete = async (fight) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar este combate?`)) {
      return;
    }

    try {
      await deleteFight(() => fightService.deleteFight(fight.id));
      await fetchFights(); // Recargar la lista
    } catch (err) {
      setError(err);
    }
  };

  const canCreateFight = () => {
    return isGeneralAdmin() || isClubAdmin();
  };

  const canEditFight = (fight) => {
    if (isGeneralAdmin()) return true;
    if (isClubAdmin()) {
      // Puede editar si alguno de los boxeadores pertenece a su club
      return fight.boxeador1?.clubId === user?.clubId || 
             fight.boxeador2?.clubId === user?.clubId ||
             fight.torneo?.clubOrganizadorId === user?.clubId;
    }
    return false;
  };

  const getResultBadge = (fight) => {
    if (!fight.resultado) {
      return <Badge variant="outline">Sin resultado</Badge>;
    }

    switch (fight.resultado) {
      case 'victoria_boxeador1':
        return <Badge variant="default">Victoria {fight.boxeador1?.nombre}</Badge>;
      case 'victoria_boxeador2':
        return <Badge variant="default">Victoria {fight.boxeador2?.nombre}</Badge>;
      case 'empate':
        return <Badge variant="secondary">Empate</Badge>;
      default:
        return <Badge variant="outline">Sin resultado</Badge>;
    }
  };

  const getStatusBadge = (fight) => {
    const now = new Date();
    const fightDate = new Date(fight.fecha);

    if (fight.resultado) {
      return <Badge variant="success">Finalizado</Badge>;
    } else if (fightDate < now) {
      return <Badge variant="destructive">Pendiente</Badge>;
    } else {
      return <Badge variant="outline">Programado</Badge>;
    }
  };

  const columns = [
    {
      header: 'Combate',
      render: (fight) => (
        <div>
          <div className="font-medium">
            {fight.boxeador1?.nombre} {fight.boxeador1?.apellido}
            <span className="mx-2 text-gray-400">vs</span>
            {fight.boxeador2?.nombre} {fight.boxeador2?.apellido}
          </div>
          <div className="text-sm text-gray-500">
            {fight.categoriaPeso || 'Categoría no especificada'}
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      render: (fight) => getStatusBadge(fight)
    },
    {
      header: 'Resultado',
      render: (fight) => getResultBadge(fight)
    },
    {
      header: 'Fecha',
      render: (fight) => (
        <div className="text-sm">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(fight.fecha), 'dd MMM yyyy', { locale: es })}
          </div>
          <div className="text-gray-500">
            {format(new Date(fight.fecha), 'HH:mm', { locale: es })}
          </div>
        </div>
      )
    },
    {
      header: 'Torneo',
      render: (fight) => (
        <div>
          {fight.torneo ? (
            <Badge variant="outline">{fight.torneo.nombre}</Badge>
          ) : (
            <span className="text-gray-400">Combate libre</span>
          )}
        </div>
      )
    },
    {
      header: 'Método',
      render: (fight) => (
        <div className="text-sm">
          {fight.metodoVictoria || 'No especificado'}
        </div>
      )
    }
  ];

  // Filtrar combates según el rol del usuario
  const getFilteredFights = () => {
    if (isBoxer()) {
      // Solo mostrar combates donde el usuario es uno de los boxeadores
      return fights.filter(fight => 
        fight.boxeador1?.usuarioId === user?.id || 
        fight.boxeador2?.usuarioId === user?.id
      );
    }
    return fights;
  };

  // Calcular estadísticas
  const filteredFights = getFilteredFights();
  const totalFights = filteredFights.length;
  const completedFights = filteredFights.filter(f => f.resultado).length;
  const pendingFights = filteredFights.filter(f => !f.resultado && new Date(f.fecha) < new Date()).length;
  const upcomingFights = filteredFights.filter(f => !f.resultado && new Date(f.fecha) >= new Date()).length;

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
          <h1 className="text-3xl font-bold text-gray-900">Combates</h1>
          <p className="text-gray-600 mt-2">
            {isBoxer() 
              ? 'Tus combates y resultados'
              : 'Gestiona los combates del sistema'
            }
          </p>
        </div>
        
        {canCreateFight() && (
          <Button onClick={() => navigate('/combates/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Combate
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Combates</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFights}</div>
            <p className="text-xs text-muted-foreground">
              {isBoxer() ? 'Tus combates' : 'Combates registrados'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedFights}</div>
            <p className="text-xs text-muted-foreground">
              Con resultado registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingFights}</div>
            <p className="text-xs text-muted-foreground">
              Sin resultado registrado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingFights}</div>
            <p className="text-xs text-muted-foreground">
              Programados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Combates</CardTitle>
          <CardDescription>
            {isBoxer() 
              ? 'Tus combates programados y finalizados'
              : 'Todos los combates registrados en el sistema'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredFights}
            columns={columns}
            searchPlaceholder="Buscar combates..."
            onView={handleView}
            onEdit={(fight) => canEditFight(fight) ? handleEdit(fight) : undefined}
            onDelete={(fight) => canEditFight(fight) ? handleDelete(fight) : undefined}
            actions={true}
            renderCustomActions={(fight) => (
              <>
                {!fight.resultado && canEditFight(fight) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegisterResult(fight)}
                    className="mr-2"
                  >
                    Registrar Resultado
                  </Button>
                )}
              </>
            )}
          />
        </CardContent>
      </Card>

      {/* Loading overlay for delete operation */}
      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner className="mr-2" />
            <span>Eliminando combate...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FightsPage;

