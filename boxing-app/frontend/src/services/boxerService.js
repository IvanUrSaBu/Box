import api from './api';

export const boxerService = {
  // Obtener todos los boxeadores
  getBoxers: async (params = {}) => {
    const response = await api.get('/boxeadores', { params });
    return response.data;
  },

  // Obtener un boxeador por ID
  getBoxerById: async (id) => {
    const response = await api.get(`/boxeadores/${id}`);
    return response.data;
  },

  // Crear un nuevo boxeador
  createBoxer: async (boxerData) => {
    const response = await api.post('/boxeadores', boxerData);
    return response.data;
  },

  // Actualizar un boxeador
  updateBoxer: async (id, boxerData) => {
    const response = await api.put(`/boxeadores/${id}`, boxerData);
    return response.data;
  },

  // Eliminar un boxeador
  deleteBoxer: async (id) => {
    const response = await api.delete(`/boxeadores/${id}`);
    return response.data;
  },

  // Actualizar record de un boxeador
  updateBoxerRecord: async (id, recordData) => {
    const response = await api.put(`/boxeadores/${id}/record`, recordData);
    return response.data;
  }
};

