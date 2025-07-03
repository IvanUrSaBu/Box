const express = require('express');
const {
  obtenerTorneos,
  obtenerTorneoPorId,
  crearTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerEstadisticasTorneo
} = require('../controllers/tournamentController');
const { 
  verificarToken, 
  verificarRol, 
  verificarMismoClub 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/', obtenerTorneos);
router.get('/:id', obtenerTorneoPorId);
router.get('/:id/estadisticas', obtenerEstadisticasTorneo);

// Rutas protegidas - Administradores pueden crear torneos
router.post('/', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'), 
  crearTorneo
);

// Rutas protegidas - Administradores pueden actualizar torneos
router.put('/:id', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'),
  actualizarTorneo
);

// Rutas protegidas - Solo administradores generales pueden eliminar
router.delete('/:id', 
  verificarToken, 
  verificarRol('administrador_general'), 
  eliminarTorneo
);

module.exports = router;

