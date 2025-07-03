const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [3, 255],
      notEmpty: true
    }
  },
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_inicio',
    validate: {
      isDate: true
    }
  },
  fechaFin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_fin',
    validate: {
      isDate: true,
      isAfterStart(value) {
        if (value && this.fechaInicio && value < this.fechaInicio) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
    }
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  esPublico: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'es_publico'
  },
  clubOrganizadorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'club_organizador_id'
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'torneos',
  timestamps: false
});

// Método para verificar si el torneo está activo
Tournament.prototype.estaActivo = function() {
  const hoy = new Date().toISOString().split('T')[0];
  const inicio = this.fechaInicio;
  const fin = this.fechaFin;
  
  if (!fin) {
    return hoy >= inicio;
  }
  
  return hoy >= inicio && hoy <= fin;
};

// Método para verificar si el torneo ha terminado
Tournament.prototype.haTerminado = function() {
  if (!this.fechaFin) {
    return false;
  }
  
  const hoy = new Date().toISOString().split('T')[0];
  return hoy > this.fechaFin;
};

module.exports = Tournament;

