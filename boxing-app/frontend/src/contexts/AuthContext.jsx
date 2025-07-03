import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, usuario } = response;
      
      authService.saveAuthData(token, usuario);
      setUser(usuario);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { token, usuario } = response;
      
      authService.saveAuthData(token, usuario);
      setUser(usuario);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      setUser(response.usuario);
      
      // Actualizar también en localStorage
      authService.saveAuthData(localStorage.getItem('token'), response.usuario);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return user.rol === roles;
  };

  const isAdmin = () => {
    return hasRole(['administrador_general', 'administrador_club']);
  };

  const isGeneralAdmin = () => {
    return hasRole('administrador_general');
  };

  const isClubAdmin = () => {
    return hasRole('administrador_club');
  };

  const isBoxer = () => {
    return hasRole('boxeador');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
    isAdmin,
    isGeneralAdmin,
    isClubAdmin,
    isBoxer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

