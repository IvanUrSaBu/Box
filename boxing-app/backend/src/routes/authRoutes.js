const express = require('express');
const { 
  registrar, 
  iniciarSesion, 
  obtenerPerfil, 
  actualizarPerfil 
} = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas
router.post('/registrar', registrar);
router.post('/login', iniciarSesion);

// Rutas protegidas
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);

module.exports = router;

