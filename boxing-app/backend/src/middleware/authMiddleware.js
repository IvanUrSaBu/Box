const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido',
        message: 'Debe proporcionar un token de autorización válido'
      });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const usuario = await User.findByPk(decoded.userId, {
      include: [
        { association: 'club' },
        { association: 'boxeador' }
      ]
    });
    
    if (!usuario) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El usuario asociado al token no existe'
      });
    }
    
    // Actualizar última conexión
    await usuario.update({ ultimaConexion: new Date() });
    
    // Agregar usuario a la request
    req.usuario = usuario;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicie sesión nuevamente'
      });
    }
    
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al verificar la autenticación'
    });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        error: 'Usuario no autenticado',
        message: 'Debe estar autenticado para acceder a este recurso'
      });
    }
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
      });
    }
    
    next();
  };
};

// Middleware para verificar que el usuario pertenece al mismo club
const verificarMismoClub = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'Usuario no autenticado',
      message: 'Debe estar autenticado para acceder a este recurso'
    });
  }
  
  // Los administradores generales pueden acceder a todo
  if (req.usuario.rol === 'administrador_general') {
    return next();
  }
  
  // Los administradores de club solo pueden acceder a su propio club
  if (req.usuario.rol === 'administrador_club') {
    const clubId = req.params.clubId || req.body.clubId;
    
    if (clubId && req.usuario.clubId !== clubId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puede gestionar su propio club'
      });
    }
  }
  
  next();
};

// Middleware para verificar que el usuario puede acceder a sus propios datos
const verificarPropietario = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: 'Usuario no autenticado',
      message: 'Debe estar autenticado para acceder a este recurso'
    });
  }
  
  // Los administradores generales pueden acceder a todo
  if (req.usuario.rol === 'administrador_general') {
    return next();
  }
  
  const usuarioId = req.params.usuarioId || req.params.id;
  
  if (usuarioId && req.usuario.id !== usuarioId) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo puede acceder a sus propios datos'
    });
  }
  
  next();
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarMismoClub,
  verificarPropietario
};

