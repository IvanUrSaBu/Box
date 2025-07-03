const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Parseo de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Importar y usar rutas
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  
  const clubRoutes = require('./routes/clubRoutes');
  app.use('/api/clubes', clubRoutes);
  
  const boxerRoutes = require('./routes/boxerRoutes');
  app.use('/api/boxeadores', boxerRoutes);
  
  const tournamentRoutes = require('./routes/tournamentRoutes');
  app.use('/api/torneos', tournamentRoutes);
  
  const fightRoutes = require('./routes/fightRoutes');
  app.use('/api/combates', fightRoutes);
} catch (error) {
  console.error('Error al cargar rutas:', error);
}

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe en este servidor`
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos.');
    }
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor ejecutándose en http://0.0.0.0:${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = app;

