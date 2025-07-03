import api from './api';

export const clubService = {
  // Obtener todos los clubes
  getClubs: async (params = {}) => {
    const response = await api.get('/clubes', { params });
    return response.data;
  },

  // Obtener un club por ID
  getClubById: async (id) => {
    const response = await api.get(`/clubes/${id}`);
    return response.data;
  },

  // Crear un nuevo club
  createClub: async (clubData) => {
    const response = await api.post('/clubes', clubData);
    return response.data;
  },

  // Actualizar un club
  updateClub: async (id, clubData) => {
    const response = await api.put(`/clubes/${id}`, clubData);
    return response.data;
  },

  // Eliminar un club
  deleteClub: async (id) => {
    const response = await api.delete(`/clubes/${id}`);
    return response.data;
  },

  // Obtener estadísticas de un club
  getClubStats: async (id) => {
    const response = await api.get(`/clubes/${id}/estadisticas`);
    return response.data;
  }
};

