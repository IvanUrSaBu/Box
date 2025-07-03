const { Boxer, User, Club, Fight } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los boxeadores
const obtenerBoxeadores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, clubId, categoriaPeso } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { apellido: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (clubId) {
      whereClause.clubId = clubId;
    }

    if (categoriaPeso) {
      whereClause.categoriaPeso = categoriaPeso;
    }

    const { count, rows: boxeadores } = await Boxer.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'usuario',
          attributes: ['nombreUsuario', 'email']
        },
        {
          association: 'club',
          attributes: ['nombre']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['apellido', 'ASC'], ['nombre', 'ASC']]
    });

    res.json({
      boxeadores,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener boxeadores:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener la lista de boxeadores'
    });
  }
};

// Obtener un boxeador por ID
const obtenerBoxeadorPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const boxeador = await Boxer.findByPk(id, {
      include: [
        {
          association: 'usuario',
          attributes: ['nombreUsuario', 'email', 'fechaCreacion']
        },
        {
          association: 'club',
          attributes: ['nombre', 'direccion']
        }
      ]
    });

    if (!boxeador) {
      return res.status(404).json({
        error: 'Boxeador no encontrado',
        message: 'No existe un boxeador con el ID especificado'
      });
    }

    // Obtener combates del boxeador
    const combates = await Fight.findAll({
      where: {
        [Op.or]: [
          { boxeador1Id: id },
          { boxeador2Id: id }
        ]
      },
      include: [
        { association: 'boxeador1', attributes: ['nombre', 'apellido'] },
        { association: 'boxeador2', attributes: ['nombre', 'apellido'] },
        { association: 'torneo', attributes: ['nombre'] }
      ],
      order: [['fechaCombate', 'DESC']]
    });

    res.json({ 
      boxeador: {
        ...boxeador.toJSON(),
        edad: boxeador.getEdad(),
        record: boxeador.getRecord()
      },
      combates
    });

  } catch (error) {
    console.error('Error al obtener boxeador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener el boxeador'
    });
  }
};

// Crear un nuevo boxeador
const crearBoxeador = async (req, res) => {
  try {
    const {
      usuarioId,
      nombre,
      apellido,
      fechaNacimiento,
      peso,
      categoriaPeso,
      clubId
    } = req.body;

    // Validaciones básicas
    if (!usuarioId || !nombre || !apellido || !fechaNacimiento) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Usuario ID, nombre, apellido y fecha de nacimiento son requeridos'
      });
    }

    // Verificar que el usuario existe y no tiene ya un perfil de boxeador
    const usuario = await User.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'No existe un usuario con el ID especificado'
      });
    }

    const boxeadorExistente = await Boxer.findOne({ where: { usuarioId } });
    if (boxeadorExistente) {
      return res.status(409).json({
        error: 'Boxeador ya existe',
        message: 'El usuario ya tiene un perfil de boxeador'
      });
    }

    // Verificar que el club existe si se especifica
    if (clubId) {
      const club = await Club.findByPk(clubId);
      if (!club) {
        return res.status(404).json({
          error: 'Club no encontrado',
          message: 'El club especificado no existe'
        });
      }
    }

    // Crear el boxeador
    const nuevoBoxeador = await Boxer.create({
      usuarioId,
      nombre,
      apellido,
      fechaNacimiento,
      peso,
      categoriaPeso,
      clubId
    });

    // Obtener el boxeador completo con relaciones
    const boxeadorCompleto = await Boxer.findByPk(nuevoBoxeador.id, {
      include: [
        { association: 'usuario', attributes: ['nombreUsuario', 'email'] },
        { association: 'club', attributes: ['nombre'] }
      ]
    });

    res.status(201).json({
      message: 'Boxeador creado exitosamente',
      boxeador: boxeadorCompleto
    });

  } catch (error) {
    console.error('Error al crear boxeador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear el boxeador'
    });
  }
};

// Actualizar un boxeador
const actualizarBoxeador = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      fechaNacimiento,
      peso,
      categoriaPeso,
      clubId
    } = req.body;

    const boxeador = await Boxer.findByPk(id);
    if (!boxeador) {
      return res.status(404).json({
        error: 'Boxeador no encontrado',
        message: 'No existe un boxeador con el ID especificado'
      });
    }

    // Verificar que el club existe si se especifica
    if (clubId) {
      const club = await Club.findByPk(clubId);
      if (!club) {
        return res.status(404).json({
          error: 'Club no encontrado',
          message: 'El club especificado no existe'
        });
      }
    }

    // Actualizar el boxeador
    await boxeador.update({
      nombre: nombre || boxeador.nombre,
      apellido: apellido || boxeador.apellido,
      fechaNacimiento: fechaNacimiento || boxeador.fechaNacimiento,
      peso: peso !== undefined ? peso : boxeador.peso,
      categoriaPeso: categoriaPeso !== undefined ? categoriaPeso : boxeador.categoriaPeso,
      clubId: clubId !== undefined ? clubId : boxeador.clubId
    });

    // Obtener el boxeador actualizado con relaciones
    const boxeadorActualizado = await Boxer.findByPk(id, {
      include: [
        { association: 'usuario', attributes: ['nombreUsuario', 'email'] },
        { association: 'club', attributes: ['nombre'] }
      ]
    });

    res.json({
      message: 'Boxeador actualizado exitosamente',
      boxeador: boxeadorActualizado
    });

  } catch (error) {
    console.error('Error al actualizar boxeador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar el boxeador'
    });
  }
};

// Eliminar un boxeador
const eliminarBoxeador = async (req, res) => {
  try {
    const { id } = req.params;

    const boxeador = await Boxer.findByPk(id);
    if (!boxeador) {
      return res.status(404).json({
        error: 'Boxeador no encontrado',
        message: 'No existe un boxeador con el ID especificado'
      });
    }

    // Verificar si el boxeador tiene combates
    const combatesCount = await Fight.count({
      where: {
        [Op.or]: [
          { boxeador1Id: id },
          { boxeador2Id: id }
        ]
      }
    });

    if (combatesCount > 0) {
      return res.status(400).json({
        error: 'Boxeador no se puede eliminar',
        message: 'El boxeador tiene combates registrados. No se puede eliminar.'
      });
    }

    await boxeador.destroy();

    res.json({
      message: 'Boxeador eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar boxeador:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar el boxeador'
    });
  }
};

// Actualizar record de un boxeador
const actualizarRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { victorias, derrotas, empates } = req.body;

    const boxeador = await Boxer.findByPk(id);
    if (!boxeador) {
      return res.status(404).json({
        error: 'Boxeador no encontrado',
        message: 'No existe un boxeador con el ID especificado'
      });
    }

    // Validar que los valores sean números no negativos
    if (victorias < 0 || derrotas < 0 || empates < 0) {
      return res.status(400).json({
        error: 'Valores inválidos',
        message: 'Los valores del record deben ser números no negativos'
      });
    }

    await boxeador.update({
      recordVictorias: victorias !== undefined ? victorias : boxeador.recordVictorias,
      recordDerrotas: derrotas !== undefined ? derrotas : boxeador.recordDerrotas,
      recordEmpates: empates !== undefined ? empates : boxeador.recordEmpates
    });

    res.json({
      message: 'Record actualizado exitosamente',
      record: boxeador.getRecord()
    });

  } catch (error) {
    console.error('Error al actualizar record:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar el record'
    });
  }
};

module.exports = {
  obtenerBoxeadores,
  obtenerBoxeadorPorId,
  crearBoxeador,
  actualizarBoxeador,
  eliminarBoxeador,
  actualizarRecord
};

