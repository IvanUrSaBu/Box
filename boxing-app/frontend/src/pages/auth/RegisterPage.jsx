import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { clubService } from '../../services/clubService';
import { WEIGHT_CATEGORIES } from '../../utils/constants';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'boxeador',
    clubId: '',
    // Datos adicionales para boxeadores
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    peso: '',
    categoriaPeso: ''
  });
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await clubService.getClubs();
        setClubs(response.clubes || []);
      } catch (err) {
        console.error('Error al cargar clubes:', err);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchClubs();
  }, []);

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
    setLoading(true);
    setError(null);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    // Si es boxeador, validar campos adicionales
    if (formData.rol === 'boxeador') {
      if (!formData.nombre || !formData.apellido || !formData.fechaNacimiento) {
        setError('Para boxeadores, nombre, apellido y fecha de nacimiento son requeridos');
        setLoading(false);
        return;
      }
    }

    try {
      const registrationData = {
        nombreUsuario: formData.nombreUsuario,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
        clubId: formData.clubId || null
      };

      // Agregar datos de boxeador si aplica
      if (formData.rol === 'boxeador') {
        registrationData.nombre = formData.nombre;
        registrationData.apellido = formData.apellido;
        registrationData.fechaNacimiento = formData.fechaNacimiento;
        registrationData.peso = formData.peso ? parseFloat(formData.peso) : null;
        registrationData.categoriaPeso = formData.categoriaPeso || null;
      }

      await register(registrationData);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Boxeo Amateur
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Completa los datos para crear tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Datos básicos */}
              <div>
                <Label htmlFor="nombreUsuario">Nombre de Usuario</Label>
                <Input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  required
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  placeholder="usuario123"
                />
              </div>

              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => handleSelectChange('rol', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boxeador">Boxeador</SelectItem>
                    <SelectItem value="administrador_club">Administrador de Club</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="clubId">Club (Opcional)</Label>
                <Select 
                  value={formData.clubId} 
                  onValueChange={(value) => handleSelectChange('clubId', value)}
                  disabled={loadingClubs}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingClubs ? "Cargando clubes..." : "Selecciona un club"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin club</SelectItem>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Datos adicionales para boxeadores */}
              {formData.rol === 'boxeador' && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Información del Boxeador
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        placeholder="Pérez"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        name="peso"
                        type="number"
                        step="0.1"
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
                </>
              )}

              {error && <ErrorMessage error={error} />}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

