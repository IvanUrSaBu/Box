const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Parseo de JSON
app.use(express.json());

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Gestión de Boxeo Amateur',
    version: '1.0.0',
    status: 'funcionando'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas de prueba para autenticación
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simulación de login
  if (email === 'admin@test.com' && password === 'password') {
    res.json({
      token: 'fake-jwt-token',
      usuario: {
        id: 1,
        nombreUsuario: 'admin',
        email: 'admin@test.com',
        rol: 'administrador_general'
      }
    });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

app.post('/api/auth/registrar', (req, res) => {
  res.json({
    message: 'Usuario registrado exitosamente',
    usuario: {
      id: 2,
      nombreUsuario: req.body.nombreUsuario,
      email: req.body.email,
      rol: req.body.rol || 'boxeador'
    }
  });
});

// Rutas de prueba para clubes
app.get('/api/clubes', (req, res) => {
  res.json({
    clubes: [
      {
        id: 1,
        nombre: 'Club de Boxeo Madrid',
        fechaCreacion: new Date(),
        direccion: 'Calle Ejemplo 123, Madrid',
        telefono: '123456789',
        email: 'info@clubmadrid.com'
      }
    ]
  });
});

// Rutas de prueba para boxeadores
app.get('/api/boxeadores', (req, res) => {
  res.json({
    boxeadores: [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        categoriaPeso: 'Peso Medio (hasta 75kg)',
        peso: 72,
        recordVictorias: 5,
        recordDerrotas: 2,
        recordEmpates: 1
      }
    ]
  });
});

// Rutas de prueba para torneos
app.get('/api/torneos', (req, res) => {
  res.json({
    torneos: [
      {
        id: 1,
        nombre: 'Campeonato Regional 2024',
        fechaInicio: new Date(),
        esPublico: true,
        ubicacion: 'Polideportivo Municipal'
      }
    ]
  });
});

// Rutas de prueba para combates
app.get('/api/combates', (req, res) => {
  res.json({
    combates: [
      {
        id: 1,
        fecha: new Date(),
        categoriaPeso: 'Peso Medio (hasta 75kg)',
        resultado: null,
        boxeador1: { nombre: 'Juan', apellido: 'Pérez' },
        boxeador2: { nombre: 'Carlos', apellido: 'García' }
      }
    ]
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de prueba ejecutándose en http://0.0.0.0:${PORT}`);
});

module.exports = app;

