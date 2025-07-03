import api from './api';

export const authService = {
  // Registrar usuario
  register: async (userData) => {
    const response = await api.post('/auth/registrar', userData);
    return response.data;
  },

  // Iniciar sesión
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Obtener perfil del usuario actual
  getProfile: async () => {
    const response = await api.get('/auth/perfil');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/perfil', profileData);
    return response.data;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario actual del localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Guardar datos de autenticación
  saveAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

