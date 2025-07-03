import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import ErrorMessage from '../components/ui/ErrorMessage';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    nombreUsuario: user?.nombreUsuario || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validaciones
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const updateData = {
        nombreUsuario: formData.nombreUsuario,
        email: formData.email
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateProfile(updateData);
      setSuccess(true);
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Actualiza tu información de usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
                <Input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  required
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
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Nueva Contraseña (opcional)</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para mantener la actual"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmar nueva contraseña"
                />
              </div>

              {error && <ErrorMessage error={error} />}
              
              {success && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  Perfil actualizado exitosamente
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Perfil'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de la Cuenta</CardTitle>
            <CardDescription>
              Detalles de tu cuenta en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Rol</Label>
              <p className="text-sm text-gray-900 capitalize">
                {user?.rol?.replace('_', ' ')}
              </p>
            </div>

            {user?.club && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Club</Label>
                <p className="text-sm text-gray-900">
                  {user.club.nombre}
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-500">Fecha de Registro</Label>
              <p className="text-sm text-gray-900">
                {user?.fechaCreacion ? new Date(user.fechaCreacion).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-500">Última Conexión</Label>
              <p className="text-sm text-gray-900">
                {user?.ultimaConexion ? new Date(user.ultimaConexion).toLocaleDateString('es-ES') : 'No disponible'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

