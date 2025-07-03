import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import DataTable from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { clubService } from '../../services/clubService';
import { useApi, useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Plus, Building, Users, Trophy } from 'lucide-react';

const ClubsPage = () => {
  const navigate = useNavigate();
  const { isGeneralAdmin } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { execute: deleteClub, loading: deleting } = useAsyncOperation();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clubService.getClubs();
      setClubs(response.clubes || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (club) => {
    navigate(`/clubes/${club.id}/editar`);
  };

  const handleView = (club) => {
    navigate(`/clubes/${club.id}`);
  };

  const handleDelete = async (club) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el club "${club.nombre}"?`)) {
      return;
    }

    try {
      await deleteClub(() => clubService.deleteClub(club.id));
      await fetchClubs(); // Recargar la lista
    } catch (err) {
      setError(err);
    }
  };

  const columns = [
    {
      header: 'Nombre',
      accessor: 'nombre',
      render: (club) => (
        <div className="font-medium">{club.nombre}</div>
      )
    },
    {
      header: 'Ubicación',
      accessor: 'direccion',
      render: (club) => (
        <div className="text-sm text-gray-500">
          {club.direccion || 'No especificada'}
        </div>
      )
    },
    {
      header: 'Contacto',
      render: (club) => (
        <div className="text-sm">
          {club.email && (
            <div className="text-gray-900">{club.email}</div>
          )}
          {club.telefono && (
            <div className="text-gray-500">{club.telefono}</div>
          )}
        </div>
      )
    },
    {
      header: 'Boxeadores',
      render: (club) => (
        <Badge variant="secondary">
          {club.boxeadores?.length || 0} boxeadores
        </Badge>
      )
    },
    {
      header: 'Usuarios',
      render: (club) => (
        <Badge variant="outline">
          {club.usuarios?.length || 0} usuarios
        </Badge>
      )
    },
    {
      header: 'Fecha de Creación',
      accessor: 'fechaCreacion',
      render: (club) => (
        <div className="text-sm text-gray-500">
          {new Date(club.fechaCreacion).toLocaleDateString('es-ES')}
        </div>
      )
    }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Clubes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los clubes de boxeo registrados en el sistema
          </p>
        </div>
        
        {isGeneralAdmin() && (
          <Button onClick={() => navigate('/clubes/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Club
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clubes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clubs.length}</div>
            <p className="text-xs text-muted-foreground">
              Clubes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boxeadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clubs.reduce((total, club) => total + (club.boxeadores?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              En todos los clubes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Club</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clubs.length > 0 
                ? Math.round(clubs.reduce((total, club) => total + (club.boxeadores?.length || 0), 0) / clubs.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Boxeadores por club
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clubes</CardTitle>
          <CardDescription>
            Todos los clubes registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={clubs}
            columns={columns}
            searchPlaceholder="Buscar clubes..."
            onView={handleView}
            onEdit={isGeneralAdmin() ? handleEdit : undefined}
            onDelete={isGeneralAdmin() ? handleDelete : undefined}
            actions={true}
          />
        </CardContent>
      </Card>

      {/* Loading overlay for delete operation */}
      {deleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner className="mr-2" />
            <span>Eliminando club...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubsPage;

