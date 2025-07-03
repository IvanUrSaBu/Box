const express = require('express');
const {
  obtenerClubes,
  obtenerClubPorId,
  crearClub,
  actualizarClub,
  eliminarClub,
  obtenerEstadisticasClub
} = require('../controllers/clubController');
const { 
  verificarToken, 
  verificarRol, 
  verificarMismoClub 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/', obtenerClubes);
router.get('/:id', obtenerClubPorId);
router.get('/:id/estadisticas', obtenerEstadisticasClub);

// Rutas protegidas - Solo administradores pueden crear clubes
router.post('/', 
  verificarToken, 
  verificarRol('administrador_general'), 
  crearClub
);

// Rutas protegidas - Administradores generales y de club pueden actualizar
router.put('/:id', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'),
  verificarMismoClub,
  actualizarClub
);

// Rutas protegidas - Solo administradores generales pueden eliminar
router.delete('/:id', 
  verificarToken, 
  verificarRol('administrador_general'), 
  eliminarClub
);

module.exports = router;

