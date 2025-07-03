import api from './api';

export const tournamentService = {
  // Obtener todos los torneos
  getTournaments: async (params = {}) => {
    const response = await api.get('/torneos', { params });
    return response.data;
  },

  // Obtener un torneo por ID
  getTournamentById: async (id) => {
    const response = await api.get(`/torneos/${id}`);
    return response.data;
  },

  // Crear un nuevo torneo
  createTournament: async (tournamentData) => {
    const response = await api.post('/torneos', tournamentData);
    return response.data;
  },

  // Actualizar un torneo
  updateTournament: async (id, tournamentData) => {
    const response = await api.put(`/torneos/${id}`, tournamentData);
    return response.data;
  },

  // Eliminar un torneo
  deleteTournament: async (id) => {
    const response = await api.delete(`/torneos/${id}`);
    return response.data;
  },

  // Obtener estadísticas de un torneo
  getTournamentStats: async (id) => {
    const response = await api.get(`/torneos/${id}/estadisticas`);
    return response.data;
  }
};

