import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import DataTable from '../../components/ui/DataTable';
import { clubService } from '../../services/clubService';
import { useAuth } from '../../contexts/AuthContext';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Trophy,
  Building
} from 'lucide-react';

const ClubDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isGeneralAdmin, isClubAdmin, user } = useAuth();
  
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clubService.getClubById(id);
      setClub(response.club);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = () => {
    return isGeneralAdmin() || (isClubAdmin() && user?.clubId === id);
  };

  const handleEdit = () => {
    navigate(`/clubes/${id}/editar`);
  };

  const handleBack = () => {
    navigate('/clubes');
  };

  const boxersColumns = [
    {
      header: 'Nombre',
      render: (boxer) => (
        <div>
          <div className="font-medium">{boxer.nombre} {boxer.apellido}</div>
          <div className="text-sm text-gray-500">@{boxer.usuario?.nombreUsuario}</div>
        </div>
      )
    },
    {
      header: 'Categoría',
      accessor: 'categoriaPeso',
      render: (boxer) => (
        <Badge variant="outline">
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
          <span className="text-green-600">{boxer.recordVictorias}V</span>
          {' - '}
          <span className="text-red-600">{boxer.recordDerrotas}D</span>
          {' - '}
          <span className="text-yellow-600">{boxer.recordEmpates}E</span>
        </div>
      )
    }
  ];

  const usersColumns = [
    {
      header: 'Usuario',
      render: (user) => (
        <div>
          <div className="font-medium">{user.nombreUsuario}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      header: 'Rol',
      render: (user) => (
        <Badge variant="secondary">
          {user.rol.replace('_', ' ')}
        </Badge>
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

  if (error || !club) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <ErrorMessage error={error || 'Club no encontrado'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{club.nombre}</h1>
            <p className="text-gray-600 mt-2">
              Información detallada del club
            </p>
          </div>
        </div>
        
        {canEdit() && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Club
          </Button>
        )}
      </div>

      {/* Club Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Información del Club
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                  <p className="text-gray-900">{club.nombre}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(club.fechaCreacion).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              {club.direccion && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dirección</Label>
                  <p className="text-gray-900 flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    {club.direccion}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {club.telefono && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {club.telefono}
                    </p>
                  </div>
                )}

                {club.email && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {club.email}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">Boxeadores</span>
                </div>
                <Badge variant="secondary">
                  {club.boxeadores?.length || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm">Usuarios</span>
                </div>
                <Badge variant="outline">
                  {club.usuarios?.length || 0}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                  <span className="text-sm">Torneos</span>
                </div>
                <Badge variant="outline">
                  {club.torneosOrganizados?.length || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Boxers Table */}
      {club.boxeadores && club.boxeadores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Boxeadores del Club</CardTitle>
            <CardDescription>
              Lista de boxeadores registrados en este club
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={club.boxeadores}
              columns={boxersColumns}
              searchPlaceholder="Buscar boxeadores..."
              actions={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {club.usuarios && club.usuarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Usuarios del Club</CardTitle>
            <CardDescription>
              Usuarios asociados a este club
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={club.usuarios}
              columns={usersColumns}
              searchPlaceholder="Buscar usuarios..."
              actions={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Tournaments */}
      {club.torneosOrganizados && club.torneosOrganizados.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Torneos Organizados</CardTitle>
            <CardDescription>
              Torneos organizados por este club
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {club.torneosOrganizados.map((torneo) => (
                <div key={torneo.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{torneo.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(torneo.fechaInicio).toLocaleDateString('es-ES')}
                      {torneo.fechaFin && ` - ${new Date(torneo.fechaFin).toLocaleDateString('es-ES')}`}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClubDetailPage;

