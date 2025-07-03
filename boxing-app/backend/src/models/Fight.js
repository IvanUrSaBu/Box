const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fight = sequelize.define('Fight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  torneoId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'torneo_id'
  },
  boxeador1Id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'boxeador1_id'
  },
  boxeador2Id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'boxeador2_id',
    validate: {
      notSameBoxer(value) {
        if (value === this.boxeador1Id) {
          throw new Error('Un boxeador no puede combatir contra sí mismo');
        }
      }
    }
  },
  fechaCombate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'fecha_combate',
    validate: {
      isDate: true
    }
  },
  categoriaPeso: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'categoria_peso',
    validate: {
      notEmpty: true
    }
  },
  resultado: {
    type: DataTypes.ENUM('victoria_boxeador1', 'victoria_boxeador2', 'empate', 'sin_resultado'),
    allowNull: true,
    defaultValue: 'sin_resultado'
  },
  metodoVictoria: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'metodo_victoria'
  },
  rondas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12 // Máximo típico en boxeo amateur
    }
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'combates',
  timestamps: false
});

// Método para verificar si el combate ha ocurrido
Fight.prototype.haOcurrido = function() {
  const ahora = new Date();
  return this.fechaCombate < ahora;
};

// Método para obtener el ganador
Fight.prototype.getGanador = function() {
  switch (this.resultado) {
    case 'victoria_boxeador1':
      return this.boxeador1Id;
    case 'victoria_boxeador2':
      return this.boxeador2Id;
    case 'empate':
    case 'sin_resultado':
    default:
      return null;
  }
};

// Método para verificar si el combate está programado
Fight.prototype.estaProgramado = function() {
  const ahora = new Date();
  return this.fechaCombate > ahora;
};

module.exports = Fight;

