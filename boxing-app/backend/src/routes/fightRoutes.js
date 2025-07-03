const express = require('express');
const {
  obtenerCombates,
  obtenerCombatePorId,
  crearCombate,
  actualizarCombate,
  eliminarCombate,
  registrarResultado
} = require('../controllers/fightController');
const { 
  verificarToken, 
  verificarRol 
} = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/', obtenerCombates);
router.get('/:id', obtenerCombatePorId);

// Rutas protegidas - Administradores pueden crear combates
router.post('/', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'), 
  crearCombate
);

// Rutas protegidas - Administradores pueden actualizar combates
router.put('/:id', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'),
  actualizarCombate
);

// Rutas protegidas - Solo administradores generales pueden eliminar
router.delete('/:id', 
  verificarToken, 
  verificarRol('administrador_general'), 
  eliminarCombate
);

// Rutas protegidas - Administradores pueden registrar resultados
router.put('/:id/resultado', 
  verificarToken, 
  verificarRol('administrador_general', 'administrador_club'), 
  registrarResultado
);

module.exports = router;

