const express = require('express');
const {
  obtenerBoxeadores,
  obtenerBoxeadorPorId,
  crearBoxeador,
  actualizarBoxeador,
  eliminarBoxeador,
  actualizarRecord
} = require('../controllers/boxerController');
const { 
  verificarToken, 
  verificarRol, 
  verificarMismoClub,
  verificarPropietario
} = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/', obtenerBoxeadores);
router.get('/:id', obtenerBoxeadorPorId);

// Rutas protegidas - Administradores pueden crear boxeadores
router.post('/', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'), 
  crearBoxeador
);

// Rutas protegidas - Administradores y el propio boxeador pueden actualizar
router.put('/:id', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club', 'boxeador'),
  actualizarBoxeador
);

// Rutas protegidas - Solo administradores pueden eliminar
router.delete('/:id', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'), 
  eliminarBoxeador
);

// Rutas protegidas - Solo administradores pueden actualizar records manualmente
router.put('/:id/record', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'), 
  actualizarRecord
);

module.exports = router;

