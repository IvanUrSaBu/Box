import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { boxerService } from '../../services/boxerService';
import { clubService } from '../../services/clubService';
import { useAuth } from '../../contexts/AuthContext';
import { WEIGHT_CATEGORIES } from '../../utils/constants';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

const BoxerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isGeneralAdmin, isClubAdmin } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    peso: '',
    categoriaPeso: '',
    clubId: ''
  });

  const [clubs, setClubs] = useState([]);
  const { execute: saveBoxer, loading: saving, error } = useAsyncOperation();
  const [loadingBoxer, setLoadingBoxer] = useState(isEditing);
  const [loadingClubs, setLoadingClubs] = useState(true);

  useEffect(() => {
    fetchClubs();
    if (isEditing) {
      fetchBoxer();
    }
  }, [id, isEditing]);

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

  const fetchBoxer = async () => {
    try {
      setLoadingBoxer(true);
      const response = await boxerService.getBoxerById(id);
      const boxer = response.boxeador;
      
      setFormData({
        nombre: boxer.nombre || '',
        apellido: boxer.apellido || '',
        fechaNacimiento: boxer.fechaNacimiento ? boxer.fechaNacimiento.split('T')[0] : '',
        peso: boxer.peso || '',
        categoriaPeso: boxer.categoriaPeso || '',
        clubId: boxer.clubId || ''
      });
    } catch (err) {
      console.error('Error al cargar boxeador:', err);
      navigate('/boxeadores');
    } finally {
      setLoadingBoxer(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      return;
    }

    try {
      const submitData = {
        ...formData,
        peso: formData.peso ? parseFloat(formData.peso) : null,
        clubId: formData.clubId || null
      };

      if (isEditing) {
        await saveBoxer(() => boxerService.updateBoxer(id, submitData));
      } else {
        await saveBoxer(() => boxerService.createBoxer(submitData));
      }
      
      navigate('/boxeadores');
    } catch (err) {
      // El error se maneja en el hook useAsyncOperation
    }
  };

  const handleCancel = () => {
    navigate('/boxeadores');
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

  if (loadingBoxer || loadingClubs) {
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
            {isEditing ? 'Editar Boxeador' : 'Nuevo Boxeador'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Modifica la información del boxeador' 
              : 'Completa los datos para registrar un nuevo boxeador'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Boxeador</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="apellido">
                    Apellido <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Información de Boxeo */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Información de Boxeo</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    name="peso"
                    type="number"
                    step="0.1"
                    min="40"
                    max="150"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="70.5"
                  />
                </div>

                <div>
                  <Label htmlFor="categoriaPeso">Categoría de Peso</Label>
                  <Select 
                    value={formData.categoriaPeso} 
                    onValueChange={(value) => handleSelectChange('categoriaPeso', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="clubId">Club</Label>
                <Select 
                  value={formData.clubId} 
                  onValueChange={(value) => handleSelectChange('clubId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin club</SelectItem>
                    {getAvailableClubs().map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                disabled={saving || !formData.nombre.trim() || !formData.apellido.trim()}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Boxeador' : 'Crear Boxeador'}
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
              <li>El nombre y apellido son campos obligatorios</li>
              <li>La fecha de nacimiento se usa para calcular la edad</li>
              <li>El peso y categoría son importantes para los emparejamientos</li>
              <li>El club puede cambiarse posteriormente</li>
              <li>El record de combates se actualiza automáticamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoxerFormPage;

