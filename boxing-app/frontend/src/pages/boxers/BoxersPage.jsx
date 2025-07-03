import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import DataTable from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { boxerService } from '../../services/boxerService';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Users, Trophy, Target, TrendingUp } from 'lucide-react';

const BoxersPage = () => {
  const navigate = useNavigate();
  const { isGeneralAdmin, isClubAdmin, isBoxer, user } = useAuth();
  const [boxers, setBoxers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: deleteBoxer, loading: deleting } = useAsyncOperation();

  useEffect(() => {
    fetchBoxers();
  }, []);

  const fetchBoxers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boxerService.getBoxers();
      setBoxers(response.boxeadores || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (boxer) => {
    navigate(`/boxeadores/${boxer.id}/editar`);
  };

  const handleView = (boxer) => {
    navigate(`/boxeadores/${boxer.id}`);
  };

  const handleDelete = async (boxer) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al boxeador "${boxer.nombre} ${boxer.apellido}"?`)) {
      return;
    }

    try {
      await deleteBoxer(() => boxerService.deleteBoxer(boxer.id));
      await fetchBoxers(); // Recargar la lista
    } catch (err) {
      setError(err);
    }
  };

  const canCreateBoxer = () => {
    return isGeneralAdmin() || isClubAdmin();
  };

  const canEditBoxer = (boxer) => {
    if (isGeneralAdmin()) return true;
    if (isClubAdmin() && boxer.clubId === user?.clubId) return true;
    if (isBoxer() && boxer.usuarioId === user?.id) return true;
    return false;
  };

  const columns = [
    {
      header: 'Boxeador',
      render: (boxer) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {boxer.nombre?.charAt(0)}{boxer.apellido?.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium">{boxer.nombre} {boxer.apellido}</div>
            <div className="text-sm text-gray-500">@{boxer.usuario?.nombreUsuario}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Club',
      render: (boxer) => (
        <div>
          {boxer.club ? (
            <Badge variant="outline">{boxer.club.nombre}</Badge>
          ) : (
            <span className="text-gray-400">Sin club</span>
          )}
        </div>
      )
    },
    {
      header: 'Categoría',
      accessor: 'categoriaPeso',
      render: (boxer) => (
        <Badge variant="secondary">
          {boxer.categoriaPeso || 'No especificada'}
        </Badge>
      )
    },
    {
      header: 'Peso',
      render: (boxer) => (
        <div className="text-sm">
          {boxer.peso ? `${boxer.peso} kg` : 'No especificado'}
        </div>
      )
    },
    {
      header: 'Record',
      render: (boxer) => (
        <div className="text-sm">
          <span className="text-green-600 font-medium">{boxer.recordVictorias}V</span>
          {' - '}
          <span className="text-red-600 font-medium">{boxer.recordDerrotas}D</span>
          {' - '}
          <span className="text-yellow-600 font-medium">{boxer.recordEmpates}E</span>
        </div>
      )
    },
    {
      header: 'Edad',
      render: (boxer) => {
        if (!boxer.fechaNacimiento) return 'No especificada';
        const age = new Date().getFullYear() - new Date(boxer.fechaNacimiento).getFullYear();
        return `${age} años`;
      }
    }
  ];

  // Calcular estadísticas
  const totalBoxers = boxers.length;
  const totalFights = boxers.reduce((sum, boxer) => 
    sum + boxer.recordVictorias + boxer.recordDerrotas + boxer.recordEmpates, 0
  );
  const totalVictories = boxers.reduce((sum, boxer) => sum + boxer.recordVictorias, 0);
  const winRate = totalFights > 0 ? ((totalVictories / totalFights) * 100).toFixed(1) : 0;

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
          <h1 className="text-3xl font-bold text-gray-900">Boxeadores</h1>
          <p className="text-gray-600 mt-2">
            {isBoxer() 
              ? 'Tu perfil y estadísticas como boxeador'
              : 'Gestiona los boxeadores registrados en el sistema'
            }
          </p>
        </div>
        
        {canCreateBoxer() && (
          <Button onClick={() => navigate('/boxeadores/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Boxeador
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boxeadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoxers}</div>
            <p className="text-xs text-muted-foreground">
              Boxeadores registrados
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
              Combates disputados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Victoria</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio general
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boxeadores Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boxers.filter(boxer => 
                (boxer.recordVictorias + boxer.recordDerrotas + boxer.recordEmpates) > 0
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con combates registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Boxeadores</CardTitle>
          <CardDescription>
            {isBoxer() 
              ? 'Tu información como boxeador'
              : 'Todos los boxeadores registrados en el sistema'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={isBoxer() ? boxers.filter(boxer => boxer.usuarioId === user?.id) : boxers}
            columns={columns}
            searchPlaceholder="Buscar boxeadores..."
            onView={handleView}
            onEdit={(boxer) => canEditBoxer(boxer) ? handleEdit(boxer) : undefined}
            onDelete={(boxer) => (isGeneralAdmin() || (isClubAdmin() && boxer.clubId === user?.clubId)) ? handleDelete(boxer) : undefined}
            actions={true}
          />
        </CardContent>
      </Card>

      {/* Loading overlay for delete operation */}
      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner className="mr-2" />
            <span>Eliminando boxeador...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxersPage;

