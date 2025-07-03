const sequelize = require('../config/database');

// Importar todos los modelos
const User = require('./User');
const Club = require('./Club');
const Boxer = require('./Boxer');
const Tournament = require('./Tournament');
const Fight = require('./Fight');

// Definir relaciones entre modelos

// Usuario pertenece a un Club (opcional)
User.belongsTo(Club, { 
  foreignKey: 'clubId', 
  as: 'club',
  onDelete: 'SET NULL'
});
Club.hasMany(User, { 
  foreignKey: 'clubId', 
  as: 'usuarios'
});

// Boxeador pertenece a un Usuario (relación 1:1)
Boxer.belongsTo(User, { 
  foreignKey: 'usuarioId', 
  as: 'usuario',
  onDelete: 'CASCADE'
});
User.hasOne(Boxer, { 
  foreignKey: 'usuarioId', 
  as: 'boxeador'
});

// Boxeador pertenece a un Club (opcional)
Boxer.belongsTo(Club, { 
  foreignKey: 'clubId', 
  as: 'club',
  onDelete: 'SET NULL'
});
Club.hasMany(Boxer, { 
  foreignKey: 'clubId', 
  as: 'boxeadores'
});

// Torneo puede ser organizado por un Club (opcional)
Tournament.belongsTo(Club, { 
  foreignKey: 'clubOrganizadorId', 
  as: 'clubOrganizador',
  onDelete: 'SET NULL'
});
Club.hasMany(Tournament, { 
  foreignKey: 'clubOrganizadorId', 
  as: 'torneosOrganizados'
});

// Combate pertenece a un Torneo (opcional)
Fight.belongsTo(Tournament, { 
  foreignKey: 'torneoId', 
  as: 'torneo',
  onDelete: 'SET NULL'
});
Tournament.hasMany(Fight, { 
  foreignKey: 'torneoId', 
  as: 'combates'
});

// Combate tiene dos Boxeadores
Fight.belongsTo(Boxer, { 
  foreignKey: 'boxeador1Id', 
  as: 'boxeador1',
  onDelete: 'RESTRICT'
});
Fight.belongsTo(Boxer, { 
  foreignKey: 'boxeador2Id', 
  as: 'boxeador2',
  onDelete: 'RESTRICT'
});

// Un boxeador puede tener muchos combates (como boxeador1 o boxeador2)
Boxer.hasMany(Fight, { 
  foreignKey: 'boxeador1Id', 
  as: 'combatesComoBoxeador1'
});
Boxer.hasMany(Fight, { 
  foreignKey: 'boxeador2Id', 
  as: 'combatesComoBoxeador2'
});

// Exportar todos los modelos y la instancia de sequelize
module.exports = {
  sequelize,
  User,
  Club,
  Boxer,
  Tournament,
  Fight
};

