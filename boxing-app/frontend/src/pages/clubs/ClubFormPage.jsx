import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { clubService } from '../../services/clubService';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

const ClubFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: ''
  });

  const { execute: saveClub, loading: saving, error } = useAsyncOperation();
  const [loadingClub, setLoadingClub] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchClub();
    }
  }, [id, isEditing]);

  const fetchClub = async () => {
    try {
      setLoadingClub(true);
      const response = await clubService.getClubById(id);
      const club = response.club;
      
      setFormData({
        nombre: club.nombre || '',
        direccion: club.direccion || '',
        telefono: club.telefono || '',
        email: club.email || ''
      });
    } catch (err) {
      console.error('Error al cargar club:', err);
      navigate('/clubes');
    } finally {
      setLoadingClub(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      return;
    }

    try {
      if (isEditing) {
        await saveClub(() => clubService.updateClub(id, formData));
      } else {
        await saveClub(() => clubService.createClub(formData));
      }
      
      navigate('/clubes');
    } catch (err) {
      // El error se maneja en el hook useAsyncOperation
    }
  };

  const handleCancel = () => {
    navigate('/clubes');
  };

  if (loadingClub) {
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
            {isEditing ? 'Editar Club' : 'Nuevo Club'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Modifica la información del club' 
              : 'Completa los datos para crear un nuevo club'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Club</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Nombre */}
              <div>
                <Label htmlFor="nombre">
                  Nombre del Club <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Club Deportivo Madrid"
                  required
                />
              </div>

              {/* Dirección */}
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Dirección completa del club"
                  rows={3}
                />
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+34 123 456 789"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contacto@club.com"
                  />
                </div>
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
                disabled={saving || !formData.nombre.trim()}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Club' : 'Crear Club'}
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
              <li>El nombre del club debe ser único en el sistema</li>
              <li>La dirección ayudará a los boxeadores a encontrar el club</li>
              <li>Los datos de contacto son opcionales pero recomendados</li>
              <li>Una vez creado, podrás agregar boxeadores y organizar torneos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubFormPage;

