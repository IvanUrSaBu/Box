import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { fightService } from '../../services/fightService';
import { boxerService } from '../../services/boxerService';
import { tournamentService } from '../../services/tournamentService';
import { useAuth } from '../../contexts/AuthContext';
import { WEIGHT_CATEGORIES } from '../../utils/constants';
import { useAsyncOperation } from '../../hooks/useApi';
import ErrorMessage from '../../components/ui/ErrorMessage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

const FightFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isGeneralAdmin, isClubAdmin } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    boxeador1Id: '',
    boxeador2Id: '',
    fecha: '',
    hora: '',
    categoriaPeso: '',
    torneoId: ''
  });

  const [boxers, setBoxers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const { execute: saveFight, loading: saving, error } = useAsyncOperation();
  const [loadingFight, setLoadingFight] = useState(isEditing);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchData();
    if (isEditing) {
      fetchFight();
    }
  }, [id, isEditing]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [boxersResponse, tournamentsResponse] = await Promise.all([
        boxerService.getBoxers(),
        tournamentService.getTournaments()
      ]);
      
      setBoxers(boxersResponse.boxeadores || []);
      setTournaments(tournamentsResponse.torneos || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchFight = async () => {
    try {
      setLoadingFight(true);
      const response = await fightService.getFightById(id);
      const fight = response.combate;
      
      const fightDate = new Date(fight.fecha);
      
      setFormData({
        boxeador1Id: fight.boxeador1Id || '',
        boxeador2Id: fight.boxeador2Id || '',
        fecha: fightDate.toISOString().split('T')[0],
        hora: fightDate.toTimeString().slice(0, 5),
        categoriaPeso: fight.categoriaPeso || '',
        torneoId: fight.torneoId || ''
      });
    } catch (err) {
      console.error('Error al cargar combate:', err);
      navigate('/combates');
    } finally {
      setLoadingFight(false);
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
    if (!formData.boxeador1Id || !formData.boxeador2Id || !formData.fecha) {
      return;
    }

    if (formData.boxeador1Id === formData.boxeador2Id) {
      setError(new Error('Un boxeador no puede combatir contra sí mismo'));
      return;
    }

    try {
      // Combinar fecha y hora
      const fechaCompleta = new Date(`${formData.fecha}T${formData.hora || '00:00'}`);
      
      const submitData = {
        boxeador1Id: formData.boxeador1Id,
        boxeador2Id: formData.boxeador2Id,
        fecha: fechaCompleta.toISOString(),
        categoriaPeso: formData.categoriaPeso || null,
        torneoId: formData.torneoId || null
      };

      if (isEditing) {
        await saveFight(() => fightService.updateFight(id, submitData));
      } else {
        await saveFight(() => fightService.createFight(submitData));
      }
      
      navigate('/combates');
    } catch (err) {
      // El error se maneja en el hook useAsyncOperation
    }
  };

  const handleCancel = () => {
    navigate('/combates');
  };

  const getAvailableBoxers = () => {
    if (isGeneralAdmin()) {
      return boxers;
    }
    if (isClubAdmin() && user?.clubId) {
      // Puede seleccionar boxeadores de su club o sin club
      return boxers.filter(boxer => 
        boxer.clubId === user.clubId || !boxer.clubId
      );
    }
    return [];
  };

  const getAvailableTournaments = () => {
    if (isGeneralAdmin()) {
      return tournaments;
    }
    if (isClubAdmin() && user?.clubId) {
      // Puede seleccionar torneos de su club o públicos
      return tournaments.filter(tournament => 
        tournament.clubOrganizadorId === user.clubId || 
        tournament.esPublico
      );
    }
    return tournaments.filter(t => t.esPublico);
  };

  const getBoxerInfo = (boxerId) => {
    const boxer = boxers.find(b => b.id === boxerId);
    if (!boxer) return null;
    
    return {
      ...boxer,
      displayName: `${boxer.nombre} ${boxer.apellido}`,
      info: `${boxer.categoriaPeso || 'Sin categoría'} - ${boxer.peso ? `${boxer.peso}kg` : 'Sin peso'}`
    };
  };

  if (loadingFight || loadingData) {
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
            {isEditing ? 'Editar Combate' : 'Nuevo Combate'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing 
              ? 'Modifica la información del combate' 
              : 'Programa un nuevo combate entre boxeadores'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Combate</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Boxeadores */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Boxeadores</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="boxeador1Id">
                    Boxeador 1 <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.boxeador1Id} 
                    onValueChange={(value) => handleSelectChange('boxeador1Id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona boxeador 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBoxers().map((boxer) => (
                        <SelectItem key={boxer.id} value={boxer.id}>
                          <div>
                            <div>{boxer.nombre} {boxer.apellido}</div>
                            <div className="text-xs text-gray-500">
                              {boxer.categoriaPeso || 'Sin categoría'} - {boxer.peso ? `${boxer.peso}kg` : 'Sin peso'}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="boxeador2Id">
                    Boxeador 2 <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.boxeador2Id} 
                    onValueChange={(value) => handleSelectChange('boxeador2Id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona boxeador 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBoxers()
                        .filter(boxer => boxer.id !== formData.boxeador1Id)
                        .map((boxer) => (
                        <SelectItem key={boxer.id} value={boxer.id}>
                          <div>
                            <div>{boxer.nombre} {boxer.apellido}</div>
                            <div className="text-xs text-gray-500">
                              {boxer.categoriaPeso || 'Sin categoría'} - {boxer.peso ? `${boxer.peso}kg` : 'Sin peso'}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mostrar información de los boxeadores seleccionados */}
              {(formData.boxeador1Id || formData.boxeador2Id) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Información de los boxeadores:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {formData.boxeador1Id && (
                      <div>
                        <strong>Boxeador 1:</strong>
                        <div>{getBoxerInfo(formData.boxeador1Id)?.displayName}</div>
                        <div className="text-gray-600">{getBoxerInfo(formData.boxeador1Id)?.info}</div>
                      </div>
                    )}
                    {formData.boxeador2Id && (
                      <div>
                        <strong>Boxeador 2:</strong>
                        <div>{getBoxerInfo(formData.boxeador2Id)?.displayName}</div>
                        <div className="text-gray-600">{getBoxerInfo(formData.boxeador2Id)?.info}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fecha y Hora */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Fecha y Hora</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha">
                    Fecha <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    name="hora"
                    type="time"
                    value={formData.hora}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Detalles del Combate */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Detalles del Combate</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <Label htmlFor="torneoId">Torneo (Opcional)</Label>
                  <Select 
                    value={formData.torneoId} 
                    onValueChange={(value) => handleSelectChange('torneoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona torneo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Combate libre</SelectItem>
                      {getAvailableTournaments().map((tournament) => (
                        <SelectItem key={tournament.id} value={tournament.id}>
                          {tournament.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                disabled={saving || !formData.boxeador1Id || !formData.boxeador2Id || !formData.fecha}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Actualizar Combate' : 'Crear Combate'}
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
              <li>Los boxeadores deben ser diferentes</li>
              <li>Se recomienda que los boxeadores sean de categorías similares</li>
              <li>La fecha y hora pueden modificarse antes del combate</li>
              <li>El torneo es opcional, sin torneo será un combate libre</li>
              <li>Una vez creado, podrás registrar el resultado del combate</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FightFormPage;

