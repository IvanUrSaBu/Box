const { Fight, Boxer, Tournament, User } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los combates
const obtenerCombates = async (req, res) => {
  try {
    const { page = 1, limit = 10, torneoId, boxeadorId, resultado, fechaDesde, fechaHasta } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (torneoId) {
      whereClause.torneoId = torneoId;
    }

    if (boxeadorId) {
      whereClause[Op.or] = [
        { boxeador1Id: boxeadorId },
        { boxeador2Id: boxeadorId }
      ];
    }

    if (resultado) {
      whereClause.resultado = resultado;
    }

    if (fechaDesde || fechaHasta) {
      whereClause.fechaCombate = {};
      if (fechaDesde) {
        whereClause.fechaCombate[Op.gte] = new Date(fechaDesde);
      }
      if (fechaHasta) {
        whereClause.fechaCombate[Op.lte] = new Date(fechaHasta);
      }
    }

    const { count, rows: combates } = await Fight.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'boxeador1',
          attributes: ['nombre', 'apellido'],
          include: [{ association: 'club', attributes: ['nombre'] }]
        },
        {
          association: 'boxeador2',
          attributes: ['nombre', 'apellido'],
          include: [{ association: 'club', attributes: ['nombre'] }]
        },
        {
          association: 'torneo',
          attributes: ['nombre']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fechaCombate', 'DESC']]
    });

    res.json({
      combates,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener combates:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener la lista de combates'
    });
  }
};

// Obtener un combate por ID
const obtenerCombatePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const combate = await Fight.findByPk(id, {
      include: [
        {
          association: 'boxeador1',
          include: [
            { association: 'usuario', attributes: ['nombreUsuario'] },
            { association: 'club', attributes: ['nombre'] }
          ]
        },
        {
          association: 'boxeador2',
          include: [
            { association: 'usuario', attributes: ['nombreUsuario'] },
            { association: 'club', attributes: ['nombre'] }
          ]
        },
        {
          association: 'torneo',
          attributes: ['nombre', 'fechaInicio', 'fechaFin']
        }
      ]
    });

    if (!combate) {
      return res.status(404).json({
        error: 'Combate no encontrado',
        message: 'No existe un combate con el ID especificado'
      });
    }

    res.json({ 
      combate: {
        ...combate.toJSON(),
        haOcurrido: combate.haOcurrido(),
        estaProgramado: combate.estaProgramado(),
        ganador: combate.getGanador()
      }
    });

  } catch (error) {
    console.error('Error al obtener combate:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener el combate'
    });
  }
};

// Crear un nuevo combate
const crearCombate = async (req, res) => {
  try {
    const {
      torneoId,
      boxeador1Id,
      boxeador2Id,
      fechaCombate,
      categoriaPeso,
      resultado = 'sin_resultado',
      metodoVictoria,
      rondas
    } = req.body;

    // Validaciones básicas
    if (!boxeador1Id || !boxeador2Id || !fechaCombate || !categoriaPeso) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Boxeador 1, Boxeador 2, fecha de combate y categoría de peso son requeridos'
      });
    }

    // Verificar que los boxeadores son diferentes
    if (boxeador1Id === boxeador2Id) {
      return res.status(400).json({
        error: 'Boxeadores inválidos',
        message: 'Un boxeador no puede combatir contra sí mismo'
      });
    }

    // Verificar que los boxeadores existen
    const boxeador1 = await Boxer.findByPk(boxeador1Id);
    const boxeador2 = await Boxer.findByPk(boxeador2Id);

    if (!boxeador1 || !boxeador2) {
      return res.status(404).json({
        error: 'Boxeador no encontrado',
        message: 'Uno o ambos boxeadores especificados no existen'
      });
    }

    // Verificar que el torneo existe si se especifica
    if (torneoId) {
      const torneo = await Tournament.findByPk(torneoId);
      if (!torneo) {
        return res.status(404).json({
          error: 'Torneo no encontrado',
          message: 'El torneo especificado no existe'
        });
      }
    }

    // Crear el combate
    const nuevoCombate = await Fight.create({
      torneoId,
      boxeador1Id,
      boxeador2Id,
      fechaCombate,
      categoriaPeso,
      resultado,
      metodoVictoria,
      rondas
    });

    // Obtener el combate completo con relaciones
    const combateCompleto = await Fight.findByPk(nuevoCombate.id, {
      include: [
        { association: 'boxeador1', attributes: ['nombre', 'apellido'] },
        { association: 'boxeador2', attributes: ['nombre', 'apellido'] },
        { association: 'torneo', attributes: ['nombre'] }
      ]
    });

    res.status(201).json({
      message: 'Combate creado exitosamente',
      combate: combateCompleto
    });

  } catch (error) {
    console.error('Error al crear combate:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al crear el combate'
    });
  }
};

// Actualizar un combate
const actualizarCombate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      torneoId,
      fechaCombate,
      categoriaPeso,
      resultado,
      metodoVictoria,
      rondas
    } = req.body;

    const combate = await Fight.findByPk(id);
    if (!combate) {
      return res.status(404).json({
        error: 'Combate no encontrado',
        message: 'No existe un combate con el ID especificado'
      });
    }

    // Verificar que el torneo existe si se especifica
    if (torneoId) {
      const torneo = await Tournament.findByPk(torneoId);
      if (!torneo) {
        return res.status(404).json({
          error: 'Torneo no encontrado',
          message: 'El torneo especificado no existe'
        });
      }
    }

    // Actualizar el combate
    await combate.update({
      torneoId: torneoId !== undefined ? torneoId : combate.torneoId,
      fechaCombate: fechaCombate || combate.fechaCombate,
      categoriaPeso: categoriaPeso || combate.categoriaPeso,
      resultado: resultado !== undefined ? resultado : combate.resultado,
      metodoVictoria: metodoVictoria !== undefined ? metodoVictoria : combate.metodoVictoria,
      rondas: rondas !== undefined ? rondas : combate.rondas
    });

    // Obtener el combate actualizado con relaciones
    const combateActualizado = await Fight.findByPk(id, {
      include: [
        { association: 'boxeador1', attributes: ['nombre', 'apellido'] },
        { association: 'boxeador2', attributes: ['nombre', 'apellido'] },
        { association: 'torneo', attributes: ['nombre'] }
      ]
    });

    res.json({
      message: 'Combate actualizado exitosamente',
      combate: combateActualizado
    });

  } catch (error) {
    console.error('Error al actualizar combate:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar el combate'
    });
  }
};

// Eliminar un combate
const eliminarCombate = async (req, res) => {
  try {
    const { id } = req.params;

    const combate = await Fight.findByPk(id);
    if (!combate) {
      return res.status(404).json({
        error: 'Combate no encontrado',
        message: 'No existe un combate con el ID especificado'
      });
    }

    await combate.destroy();

    res.json({
      message: 'Combate eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar combate:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al eliminar el combate'
    });
  }
};

// Registrar resultado de un combate
const registrarResultado = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultado, metodoVictoria, rondas } = req.body;

    const combate = await Fight.findByPk(id, {
      include: [
        { association: 'boxeador1' },
        { association: 'boxeador2' }
      ]
    });

    if (!combate) {
      return res.status(404).json({
        error: 'Combate no encontrado',
        message: 'No existe un combate con el ID especificado'
      });
    }

    // Validar resultado
    const resultadosValidos = ['victoria_boxeador1', 'victoria_boxeador2', 'empate', 'sin_resultado'];
    if (!resultadosValidos.includes(resultado)) {
      return res.status(400).json({
        error: 'Resultado inválido',
        message: `El resultado debe ser uno de: ${resultadosValidos.join(', ')}`
      });
    }

    // Actualizar el combate
    await combate.update({
      resultado,
      metodoVictoria,
      rondas
    });

    // Actualizar records de los boxeadores si el combate tiene resultado definitivo
    if (resultado !== 'sin_resultado') {
      const boxeador1 = combate.boxeador1;
      const boxeador2 = combate.boxeador2;

      if (resultado === 'victoria_boxeador1') {
        await boxeador1.update({ recordVictorias: boxeador1.recordVictorias + 1 });
        await boxeador2.update({ recordDerrotas: boxeador2.recordDerrotas + 1 });
      } else if (resultado === 'victoria_boxeador2') {
        await boxeador2.update({ recordVictorias: boxeador2.recordVictorias + 1 });
        await boxeador1.update({ recordDerrotas: boxeador1.recordDerrotas + 1 });
      } else if (resultado === 'empate') {
        await boxeador1.update({ recordEmpates: boxeador1.recordEmpates + 1 });
        await boxeador2.update({ recordEmpates: boxeador2.recordEmpates + 1 });
      }
    }

    // Obtener el combate actualizado
    const combateActualizado = await Fight.findByPk(id, {
      include: [
        { association: 'boxeador1', attributes: ['nombre', 'apellido'] },
        { association: 'boxeador2', attributes: ['nombre', 'apellido'] },
        { association: 'torneo', attributes: ['nombre'] }
      ]
    });

    res.json({
      message: 'Resultado registrado exitosamente',
      combate: combateActualizado
    });

  } catch (error) {
    console.error('Error al registrar resultado:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al registrar el resultado del combate'
    });
  }
};

module.exports = {
  obtenerCombates,
  obtenerCombatePorId,
  crearCombate,
  actualizarCombate,
  eliminarCombate,
  registrarResultado
};

