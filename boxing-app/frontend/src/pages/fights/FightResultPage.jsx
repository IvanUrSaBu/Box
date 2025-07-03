import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { fightService } from '../../services/fightService';
import { useAuth } from '../../contexts/AuthContext';
import { VICTORY_METHODS } from '../../utils/constants';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save, Trophy, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const FightResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isGeneralAdmin, isClubAdmin } = useAuth();

  const [fight, setFight] = useState(null);
  const [formData, setFormData] = useState({
    resultado: '',
    metodoVictoria: '',
    observaciones: ''
  });

  const { execute: saveResult, loading: saving, error } = useAsyncOperation();
  const [loadingFight, setLoadingFight] = useState(true);

  useEffect(() => {
    fetchFight();
  }, [id]);

  const fetchFight = async () => {
    try {
      setLoadingFight(true);
      const response = await fightService.getFightById(id);
      const fightData = response.combate;
      
      setFight(fightData);
      
      // Si ya tiene resultado, cargar los datos
      if (fightData.resultado) {
        setFormData({
          resultado: fightData.resultado || '',
          metodoVictoria: fightData.metodoVictoria || '',
          observaciones: fightData.observaciones || ''
        });
      }
    } catch (err) {
      console.error('Error al cargar combate:', err);
      navigate('/combates');
    } finally {
      setLoadingFight(false);
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.resultado) {
      return;
    }

    try {
      await saveResult(() => fightService.registerResult(id, formData));
      navigate('/combates');
    } catch (err) {
      // El error se maneja en el hook useAsyncOperation
    }
  };

  const handleCancel = () => {
    navigate('/combates');
  };

  const canRegisterResult = () => {
    if (!fight) return false;
    if (isGeneralAdmin()) return true;
    if (isClubAdmin()) {
      return fight.boxeador1?.clubId === user?.clubId || 
             fight.boxeador2?.clubId === user?.clubId ||
             fight.torneo?.clubOrganizadorId === user?.clubId;
    }
    return false;
  };

  const getResultOptions = () => {
    if (!fight) return [];
    
    return [
      {
        value: 'victoria_boxeador1',
        label: `Victoria de ${fight.boxeador1?.nombre} ${fight.boxeador1?.apellido}`,
        color: 'bg-green-100 text-green-800'
      },
      {
        value: 'victoria_boxeador2',
        label: `Victoria de ${fight.boxeador2?.nombre} ${fight.boxeador2?.apellido}`,
        color: 'bg-blue-100 text-blue-800'
      },
      {
        value: 'empate',
        label: 'Empate',
        color: 'bg-yellow-100 text-yellow-800'
      },
      {
        value: 'sin_resultado',
        label: 'Sin resultado / Cancelado',
        color: 'bg-gray-100 text-gray-800'
      }
    ];
  };

  if (loadingFight) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!fight) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <ErrorMessage error="Combate no encontrado" />
      </div>
    );
  }

  if (!canRegisterResult()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <ErrorMessage error="No tienes permisos para registrar el resultado de este combate" />
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
            {fight.resultado ? 'Editar Resultado' : 'Registrar Resultado'}
          </h1>
          <p className="text-gray-600 mt-2">
            Registra el resultado del combate
          </p>
        </div>
      </div>

      {/* Fight Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Información del Combate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Boxeadores */}
            <div className="text-center">
              <div className="text-2xl font-bold">
                {fight.boxeador1?.nombre} {fight.boxeador1?.apellido}
                <span className="mx-4 text-gray-400">VS</span>
                {fight.boxeador2?.nombre} {fight.boxeador2?.apellido}
              </div>
              <div className="text-gray-600 mt-2">
                {fight.categoriaPeso || 'Categoría no especificada'}
              </div>
            </div>

            {/* Detalles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Fecha</span>
                </div>
                <div className="text-sm">
                  {format(new Date(fight.fecha), 'dd MMM yyyy HH:mm', { locale: es })}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Torneo</span>
                </div>
                <div className="text-sm">
                  {fight.torneo ? (
                    <Badge variant="outline">{fight.torneo.nombre}</Badge>
                  ) : (
                    'Combate libre'
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Estado</span>
                </div>
                <div className="text-sm">
                  {fight.resultado ? (
                    <Badge variant="success">Finalizado</Badge>
                  ) : (
                    <Badge variant="outline">Pendiente</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Form */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado del Combate</CardTitle>
          <CardDescription>
            Selecciona el resultado y método de victoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resultado */}
            <div>
              <Label htmlFor="resultado">
                Resultado <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.resultado} 
                onValueChange={(value) => handleSelectChange('resultado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el resultado" />
                </SelectTrigger>
                <SelectContent>
                  {getResultOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${option.color}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Método de Victoria */}
            {formData.resultado && formData.resultado !== 'empate' && formData.resultado !== 'sin_resultado' && (
              <div>
                <Label htmlFor="metodoVictoria">Método de Victoria</Label>
                <Select 
                  value={formData.metodoVictoria} 
                  onValueChange={(value) => handleSelectChange('metodoVictoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el método" />
                  </SelectTrigger>
                  <SelectContent>
                    {VICTORY_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observaciones */}
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Comentarios adicionales sobre el combate..."
                rows={3}
              />
            </div>

            {/* Preview del resultado */}
            {formData.resultado && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumen del resultado:</h4>
                <div className="text-sm">
                  <div>
                    <strong>Resultado:</strong> {getResultOptions().find(o => o.value === formData.resultado)?.label}
                  </div>
                  {formData.metodoVictoria && (
                    <div>
                      <strong>Método:</strong> {formData.metodoVictoria}
                    </div>
                  )}
                  {formData.observaciones && (
                    <div>
                      <strong>Observaciones:</strong> {formData.observaciones}
                    </div>
                  )}
                </div>
              </div>
            )}

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
                disabled={saving || !formData.resultado}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando resultado...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {fight.resultado ? 'Actualizar Resultado' : 'Registrar Resultado'}
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
              <li>El resultado se registrará automáticamente en el record de ambos boxeadores</li>
              <li>Una vez registrado, el resultado puede modificarse si es necesario</li>
              <li>El método de victoria es opcional pero recomendado para estadísticas</li>
              <li>Las observaciones pueden incluir detalles del combate</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FightResultPage;

