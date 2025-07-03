const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Boxer = sequelize.define('Boxer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'usuario_id'
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'fecha_nacimiento',
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0] // No puede nacer en el futuro
    }
  },
  peso: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 30.0, // Peso mínimo razonable
      max: 200.0 // Peso máximo razonable
    }
  },
  categoriaPeso: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'categoria_peso'
  },
  clubId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'club_id'
  },
  recordVictorias: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'record_victorias',
    validate: {
      min: 0
    }
  },
  recordDerrotas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'record_derrotas',
    validate: {
      min: 0
    }
  },
  recordEmpates: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'record_empates',
    validate: {
      min: 0
    }
  },
  fechaCreacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_creacion'
  }
}, {
  tableName: 'boxeadores',
  timestamps: false
});

// Método virtual para calcular la edad
Boxer.prototype.getEdad = function() {
  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
};

// Método virtual para obtener el record completo
Boxer.prototype.getRecord = function() {
  return {
    victorias: this.recordVictorias,
    derrotas: this.recordDerrotas,
    empates: this.recordEmpates,
    total: this.recordVictorias + this.recordDerrotas + this.recordEmpates
  };
};

module.exports = Boxer;

