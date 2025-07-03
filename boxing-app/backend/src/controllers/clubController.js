const { Club, User, Boxer, Tournament } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los clubes
const obtenerClubes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause.nombre = {
        [Op.iLike]: `%${search}%`
      };
    }

    const { count, rows: clubes } = await Club.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'boxeadores',
          attributes: ['id', 'nombre', 'apellido', 'categoriaPeso']
        },
        {
          association: 'usuarios',
          attributes: ['id', 'nombreUsuario', 'rol']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']]
    });

    res.json({
      clubes,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener clubes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener la lista de clubes'
    });
  }
};

// Obtener un club por ID
const obtenerClubPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await Club.findByPk(id, {
      include: [
        {
          association: 'boxeadores',
          include: [{ association: 'usuario', attributes: ['nombreUsuario', 'email'] }]
        },
        {
          association: 'usuarios',
          attributes: ['id', 'nombreUsuario', 'email', 'rol']
        },
        {
          association: 'torneosOrganizados',
          attributes: ['id', 'nombre', 'fechaInicio', 'fechaFin']
        }
      ]
    });

    if (!club) {
      return res.status(404).json({
        error: 'Club no encontrado',
        message: 'No existe un club con el ID especificado'
      });
    }

    res.json({ club });

  } catch (error) {
    console.error('Error al obtener club:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener el club'
    });
  }
};

// Crear un nuevo club
const crearClub = async (req, res) => {
  try {
    const { nombre, direccion, telefono, email } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El nombre del club es requerido'
      });
    }

    // Verificar que no exista un club con el mismo nombre
    const clubExistente = await Club.findOne({ where: { nombre } });
    if (clubExistente) {
      return res.status(409).json({
        error: 'Club ya existe',
        message: 'Ya existe un club con ese nombre'
      });
    }

    // Crear el club
    const nuevoClub = await Club.create({
      nombre,
      direccion,
      telefono,
      email
    });

    res.status(201).json({
      message: 'Club creado exitosamente',
      club: nuevoClub
    });

  } catch (error) {
    console.error('Error al crear club:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear el club'
    });
  }
};

// Actualizar un club
const actualizarClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, direccion, telefono, email } = req.body;

    const club = await Club.findByPk(id);
    if (!club) {
      return res.status(404).json({
        error: 'Club no encontrado',
        message: 'No existe un club con el ID especificado'
      });
    }

    // Verificar que no exista otro club con el mismo nombre
    if (nombre && nombre !== club.nombre) {
      const clubExistente = await Club.findOne({
        where: {
          nombre,
          id: { [Op.ne]: id }
        }
      });

      if (clubExistente) {
        return res.status(409).json({
          error: 'Nombre ya en uso',
          message: 'Ya existe otro club con ese nombre'
        });
      }
    }

    // Actualizar el club
    await club.update({
      nombre: nombre || club.nombre,
      direccion: direccion !== undefined ? direccion : club.direccion,
      telefono: telefono !== undefined ? telefono : club.telefono,
      email: email !== undefined ? email : club.email
    });

    res.json({
      message: 'Club actualizado exitosamente',
      club
    });

  } catch (error) {
    console.error('Error al actualizar club:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar el club'
    });
  }
};

// Eliminar un club
const eliminarClub = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await Club.findByPk(id);
    if (!club) {
      return res.status(404).json({
        error: 'Club no encontrado',
        message: 'No existe un club con el ID especificado'
      });
    }

    // Verificar si el club tiene boxeadores o usuarios asociados
    const boxeadoresCount = await Boxer.count({ where: { clubId: id } });
    const usuariosCount = await User.count({ where: { clubId: id } });

    if (boxeadoresCount > 0 || usuariosCount > 0) {
      return res.status(400).json({
        error: 'Club no se puede eliminar',
        message: 'El club tiene boxeadores o usuarios asociados. Primero debe reasignarlos o eliminarlos.'
      });
    }

    await club.destroy();

    res.json({
      message: 'Club eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar club:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar el club'
    });
  }
};

// Obtener estadísticas de un club
const obtenerEstadisticasClub = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await Club.findByPk(id);
    if (!club) {
      return res.status(404).json({
        error: 'Club no encontrado',
        message: 'No existe un club con el ID especificado'
      });
    }

    // Contar boxeadores
    const totalBoxeadores = await Boxer.count({ where: { clubId: id } });

    // Contar usuarios por rol
    const usuarios = await User.findAll({
      where: { clubId: id },
      attributes: ['rol']
    });

    const usuariosPorRol = usuarios.reduce((acc, usuario) => {
      acc[usuario.rol] = (acc[usuario.rol] || 0) + 1;
      return acc;
    }, {});

    // Contar torneos organizados
    const torneosOrganizados = await Tournament.count({ where: { clubOrganizadorId: id } });

    res.json({
      estadisticas: {
        totalBoxeadores,
        usuariosPorRol,
        torneosOrganizados
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del club:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener las estadísticas del club'
    });
  }
};

module.exports = {
  obtenerClubes,
  obtenerClubPorId,
  crearClub,
  actualizarClub,
  eliminarClub,
  obtenerEstadisticasClub
};

