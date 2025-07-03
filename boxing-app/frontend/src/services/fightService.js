import api from './api';

export const fightService = {
  // Obtener todos los combates
  getFights: async (params = {}) => {
    const response = await api.get('/combates', { params });
    return response.data;
  },

  // Obtener un combate por ID
  getFightById: async (id) => {
    const response = await api.get(`/combates/${id}`);
    return response.data;
  },

  // Crear un nuevo combate
  createFight: async (fightData) => {
    const response = await api.post('/combates', fightData);
    return response.data;
  },

  // Actualizar un combate
  updateFight: async (id, fightData) => {
    const response = await api.put(`/combates/${id}`, fightData);
    return response.data;
  },

  // Eliminar un combate
  deleteFight: async (id) => {
    const response = await api.delete(`/combates/${id}`);
    return response.data;
  },

  // Registrar resultado de un combate
  registerResult: async (id, resultData) => {
    const response = await api.put(`/combates/${id}/resultado`, resultData);
    return response.data;
  }
};

