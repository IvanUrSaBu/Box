import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { tournamentService } from '../../services/tournamentService';
import { clubService } from '../../services/clubService';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

const TournamentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isGeneralAdmin, isClubAdmin } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    ubicacion: '',
    esPublico: true,
    clubOrganizadorId: ''
  });

  const [clubs, setClubs] = useState([]);
  const { execute: saveTournament, loading: saving, error } = useAsyncOperation();
  const [loadingTournament, setLoadingTournament] = useState(isEditing);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    fetchClubs();
    if (isEditing) {
      fetchTournament();
    } else {
      // Si es admin de club, preseleccionar su club
      if (isClubAdmin() && user?.clubId) {
        setFormData(prev => ({
          ...prev,
          clubOrganizadorId: user.clubId
        }));
      }
    }
  }, [id, isEditing, user]);

  const fetchClubs = async () => {
    try {
      setLoadingClubs(true);
      const response = await clubService.getClubs();
      setClubs(response.clubes || []);
    } catch (err) {
      console.error('Error al cargar clubes:', err);
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchTournament = async () => {
    try {
      setLoadingTournament(true);
      const response = await tournamentService.getTournamentById(id);
      const tournament = response.torneo;
      
      setFormData({
        nombre: tournament.nombre || '',
        descripcion: tournament.descripcion || '',
        fechaInicio: tournament.fechaInicio ? tournament.fechaInicio.split('T')[0] : '',
        fechaFin: tournament.fechaFin ? tournament.fechaFin.split('T')[0] : '',
        ubicacion: tournament.ubicacion || '',
        esPublico: tournament.esPublico ?? true,
        clubOrganizadorId: tournament.clubOrganizadorId || ''
      });
    } catch (err) {
      console.error('Error al cargar torneo:', err);
      navigate('/torneos');
    } finally {
      setLoadingTournament(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (name, checked) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.fechaInicio) {
      return;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (formData.fechaFin && formData.fechaInicio && formData.fechaFin < formData.fechaInicio) {
      setError(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
      return;
    }

    try {
      const submitData = {
        ...formData,
        clubOrganizadorId: formData.clubOrganizadorId || null,
        fechaFin: formData.fechaFin || null
      };

      if (isEditing) {
        await saveTournament(() => tournamentService.updateTournament(id, submitData));
      } else {
        await saveTournament(() => tournamentService.createTournament(submitData));
      }
      
      navigate('/torneos');
    } catch (err) {
      // El error se maneja en el hook useAsyncOperation
    }
  };

  const handleCancel = () => {
    navigate('/torneos');
  };

  const getAvailableClubs = () => {
    if (isGeneralAdmin()) {
      return clubs;
    }
    if (isClubAdmin() && user?.clubId) {
      return clubs.filter(club => club.id === user.clubId);
    }
    return [];
  };

  if (loadingTournament || loadingClubs) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Torneo' : 'Nuevo Torneo'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Modifica la información del torneo' 
              : 'Completa los datos para crear un nuevo torneo'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Torneo</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              
              <div>
                <Label htmlFor="nombre">
                  Nombre del Torneo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Campeonato Regional de Primavera 2024"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del torneo, categorías, premios, etc."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleChange}
                  placeholder="Polideportivo Municipal, Madrid"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Fechas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fechaInicio"
                    name="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="fechaFin">Fecha de Fin (Opcional)</Label>
                  <Input
                    id="fechaFin"
                    name="fechaFin"
                    type="date"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    min={formData.fechaInicio}
                  />
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Configuración</h3>
              
              <div>
                <Label htmlFor="clubOrganizadorId">Club Organizador</Label>
                <Select 
                  value={formData.clubOrganizadorId} 
                  onValueChange={(value) => handleSelectChange('clubOrganizadorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el club organizador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin club organizador</SelectItem>
                    {getAvailableClubs().map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="esPublico"
                  checked={formData.esPublico}
                  onCheckedChange={(checked) => handleSwitchChange('esPublico', checked)}
                />
                <Label htmlFor="esPublico">Torneo Público</Label>
              </div>
              <p className="text-sm text-gray-500">
                Los torneos públicos son visibles para todos los usuarios. Los privados solo para miembros del club organizador.
              </p>
            </div>

            {/* Error Message */}
            {error && <ErrorMessage error={error} />}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !formData.nombre.trim() || !formData.fechaInicio}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Torneo' : 'Crear Torneo'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">Información importante:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>El nombre del torneo debe ser descriptivo y único</li>
              <li>La fecha de inicio es obligatoria, la de fin es opcional</li>
              <li>Los torneos públicos son visibles para todos los usuarios</li>
              <li>Solo el club organizador puede gestionar los combates del torneo</li>
              <li>Una vez creado, podrás agregar combates y gestionar participantes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentFormPage;

