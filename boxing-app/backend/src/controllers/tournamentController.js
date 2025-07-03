const { Tournament, Club, Fight, Boxer } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los torneos
const obtenerTorneos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, esPublico, activo } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause.nombre = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (esPublico !== undefined) {
      whereClause.esPublico = esPublico === 'true';
    }

    if (activo !== undefined) {
      const hoy = new Date().toISOString().split('T')[0];
      if (activo === 'true') {
        whereClause[Op.and] = [
          { fechaInicio: { [Op.lte]: hoy } },
          {
            [Op.or]: [
              { fechaFin: null },
              { fechaFin: { [Op.gte]: hoy } }
            ]
          }
        ];
      } else {
        whereClause.fechaFin = { [Op.lt]: hoy };
      }
    }

    const { count, rows: torneos } = await Tournament.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'clubOrganizador',
          attributes: ['nombre']
        },
        {
          association: 'combates',
          attributes: ['id', 'resultado']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fechaInicio', 'DESC']]
    });

    res.json({
      torneos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener torneos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener la lista de torneos'
    });
  }
};

// Obtener un torneo por ID
const obtenerTorneoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const torneo = await Tournament.findByPk(id, {
      include: [
        {
          association: 'clubOrganizador',
          attributes: ['nombre', 'direccion', 'telefono']
        },
        {
          association: 'combates',
          include: [
            { association: 'boxeador1', attributes: ['nombre', 'apellido'] },
            { association: 'boxeador2', attributes: ['nombre', 'apellido'] }
          ],
          order: [['fechaCombate', 'ASC']]
        }
      ]
    });

    if (!torneo) {
      return res.status(404).json({
        error: 'Torneo no encontrado',
        message: 'No existe un torneo con el ID especificado'
      });
    }

    res.json({ 
      torneo: {
        ...torneo.toJSON(),
        estaActivo: torneo.estaActivo(),
        haTerminado: torneo.haTerminado()
      }
    });

  } catch (error) {
    console.error('Error al obtener torneo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener el torneo'
    });
  }
};

// Crear un nuevo torneo
const crearTorneo = async (req, res) => {
  try {
    const {
      nombre,
      fechaInicio,
      fechaFin,
      ubicacion,
      esPublico = true,
      clubOrganizadorId
    } = req.body;

    // Validaciones básicas
    if (!nombre || !fechaInicio) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre y fecha de inicio son requeridos'
      });
    }

    // Validar fechas
    if (fechaFin && fechaFin < fechaInicio) {
      return res.status(400).json({
        error: 'Fechas inválidas',
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Verificar que el club organizador existe si se especifica
    if (clubOrganizadorId) {
      const club = await Club.findByPk(clubOrganizadorId);
      if (!club) {
        return res.status(404).json({
          error: 'Club no encontrado',
          message: 'El club organizador especificado no existe'
        });
      }
    }

    // Crear el torneo
    const nuevoTorneo = await Tournament.create({
      nombre,
      fechaInicio,
      fechaFin,
      ubicacion,
      esPublico,
      clubOrganizadorId
    });

    // Obtener el torneo completo con relaciones
    const torneoCompleto = await Tournament.findByPk(nuevoTorneo.id, {
      include: [
        { association: 'clubOrganizador', attributes: ['nombre'] }
      ]
    });

    res.status(201).json({
      message: 'Torneo creado exitosamente',
      torneo: torneoCompleto
    });

  } catch (error) {
    console.error('Error al crear torneo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear el torneo'
    });
  }
};

// Actualizar un torneo
const actualizarTorneo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      fechaInicio,
      fechaFin,
      ubicacion,
      esPublico,
      clubOrganizadorId
    } = req.body;

    const torneo = await Tournament.findByPk(id);
    if (!torneo) {
      return res.status(404).json({
        error: 'Torneo no encontrado',
        message: 'No existe un torneo con el ID especificado'
      });
    }

    // Validar fechas si se proporcionan
    const nuevaFechaInicio = fechaInicio || torneo.fechaInicio;
    const nuevaFechaFin = fechaFin !== undefined ? fechaFin : torneo.fechaFin;

    if (nuevaFechaFin && nuevaFechaFin < nuevaFechaInicio) {
      return res.status(400).json({
        error: 'Fechas inválidas',
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Verificar que el club organizador existe si se especifica
    if (clubOrganizadorId) {
      const club = await Club.findByPk(clubOrganizadorId);
      if (!club) {
        return res.status(404).json({
          error: 'Club no encontrado',
          message: 'El club organizador especificado no existe'
        });
      }
    }

    // Actualizar el torneo
    await torneo.update({
      nombre: nombre || torneo.nombre,
      fechaInicio: nuevaFechaInicio,
      fechaFin: nuevaFechaFin,
      ubicacion: ubicacion !== undefined ? ubicacion : torneo.ubicacion,
      esPublico: esPublico !== undefined ? esPublico : torneo.esPublico,
      clubOrganizadorId: clubOrganizadorId !== undefined ? clubOrganizadorId : torneo.clubOrganizadorId
    });

    // Obtener el torneo actualizado con relaciones
    const torneoActualizado = await Tournament.findByPk(id, {
      include: [
        { association: 'clubOrganizador', attributes: ['nombre'] }
      ]
    });

    res.json({
      message: 'Torneo actualizado exitosamente',
      torneo: torneoActualizado
    });

  } catch (error) {
    console.error('Error al actualizar torneo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar el torneo'
    });
  }
};

// Eliminar un torneo
const eliminarTorneo = async (req, res) => {
  try {
    const { id } = req.params;

    const torneo = await Tournament.findByPk(id);
    if (!torneo) {
      return res.status(404).json({
        error: 'Torneo no encontrado',
        message: 'No existe un torneo con el ID especificado'
      });
    }

    // Verificar si el torneo tiene combates
    const combatesCount = await Fight.count({ where: { torneoId: id } });

    if (combatesCount > 0) {
      return res.status(400).json({
        error: 'Torneo no se puede eliminar',
        message: 'El torneo tiene combates registrados. Primero debe eliminar los combates.'
      });
    }

    await torneo.destroy();

    res.json({
      message: 'Torneo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar el torneo'
    });
  }
};

// Obtener estadísticas de un torneo
const obtenerEstadisticasTorneo = async (req, res) => {
  try {
    const { id } = req.params;

    const torneo = await Tournament.findByPk(id);
    if (!torneo) {
      return res.status(404).json({
        error: 'Torneo no encontrado',
        message: 'No existe un torneo con el ID especificado'
      });
    }

    // Contar combates por estado
    const combates = await Fight.findAll({
      where: { torneoId: id },
      attributes: ['resultado']
    });

    const estadisticasCombates = combates.reduce((acc, combate) => {
      const resultado = combate.resultado || 'sin_resultado';
      acc[resultado] = (acc[resultado] || 0) + 1;
      return acc;
    }, {});

    // Contar boxeadores únicos participantes
    const boxeadoresIds = new Set();
    combates.forEach(combate => {
      boxeadoresIds.add(combate.boxeador1Id);
      boxeadoresIds.add(combate.boxeador2Id);
    });

    res.json({
      estadisticas: {
        totalCombates: combates.length,
        combatesPorResultado: estadisticasCombates,
        totalBoxeadores: boxeadoresIds.size,
        estaActivo: torneo.estaActivo(),
        haTerminado: torneo.haTerminado()
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del torneo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener las estadísticas del torneo'
    });
  }
};

module.exports = {
  obtenerTorneos,
  obtenerTorneoPorId,
  crearTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerEstadisticasTorneo
};

