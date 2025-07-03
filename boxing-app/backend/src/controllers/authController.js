const jwt = require('jsonwebtoken');
const { User, Club, Boxer } = require('../models');

// Generar token JWT
const generarToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Registro de usuario
const registrar = async (req, res) => {
  try {
    const {
      nombreUsuario,
      email,
      password,
      rol = 'boxeador',
      clubId,
      // Datos adicionales para boxeadores
      nombre,
      apellido,
      fechaNacimiento,
      peso,
      categoriaPeso
    } = req.body;

    // Validaciones básicas
    if (!nombreUsuario || !email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre de usuario, email y contraseña son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña muy corta',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({
      where: {
        $or: [
          { email },
          { nombreUsuario }
        ]
      }
    });

    if (usuarioExistente) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'Ya existe un usuario con ese email o nombre de usuario'
      });
    }

    // Si se especifica un club, verificar que existe
    if (clubId) {
      const club = await Club.findByPk(clubId);
      if (!club) {
        return res.status(404).json({
          error: 'Club no encontrado',
          message: 'El club especificado no existe'
        });
      }
    }

    // Crear el usuario
    const nuevoUsuario = await User.create({
      nombreUsuario,
      email,
      passwordHash: password, // Se hasheará automáticamente en el hook
      rol,
      clubId
    });

    // Si es un boxeador, crear también el perfil de boxeador
    if (rol === 'boxeador' && nombre && apellido && fechaNacimiento) {
      await Boxer.create({
        usuarioId: nuevoUsuario.id,
        nombre,
        apellido,
        fechaNacimiento,
        peso,
        categoriaPeso,
        clubId
      });
    }

    // Generar token
    const token = generarToken(nuevoUsuario.id);

    // Obtener usuario completo con relaciones
    const usuarioCompleto = await User.findByPk(nuevoUsuario.id, {
      include: [
        { association: 'club' },
        { association: 'boxeador' }
      ]
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: usuarioCompleto
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al registrar el usuario'
    });
  }
};

// Inicio de sesión
const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email
    const usuario = await User.findOne({
      where: { email },
      include: [
        { association: 'club' },
        { association: 'boxeador' }
      ]
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password);
    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Actualizar última conexión
    await usuario.update({ ultimaConexion: new Date() });

    // Generar token
    const token = generarToken(usuario.id);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario
    });

  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al iniciar sesión'
    });
  }
};

// Obtener perfil del usuario actual
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findByPk(req.usuario.id, {
      include: [
        { association: 'club' },
        { association: 'boxeador' }
      ]
    });

    res.json({
      usuario
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al obtener el perfil del usuario'
    });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  try {
    const { nombreUsuario, email, password } = req.body;
    const usuario = req.usuario;

    // Preparar datos para actualizar
    const datosActualizacion = {};
    
    if (nombreUsuario) datosActualizacion.nombreUsuario = nombreUsuario;
    if (email) datosActualizacion.email = email;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'Contraseña muy corta',
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }
      datosActualizacion.passwordHash = password;
    }

    // Verificar que no exista otro usuario con el mismo email o nombre de usuario
    if (nombreUsuario || email) {
      const condiciones = [];
      if (nombreUsuario) condiciones.push({ nombreUsuario });
      if (email) condiciones.push({ email });

      const usuarioExistente = await User.findOne({
        where: {
          $or: condiciones,
          id: { $ne: usuario.id } // Excluir el usuario actual
        }
      });

      if (usuarioExistente) {
        return res.status(409).json({
          error: 'Datos ya en uso',
          message: 'Ya existe otro usuario con ese email o nombre de usuario'
        });
      }
    }

    // Actualizar usuario
    await usuario.update(datosActualizacion);

    // Obtener usuario actualizado
    const usuarioActualizado = await User.findByPk(usuario.id, {
      include: [
        { association: 'club' },
        { association: 'boxeador' }
      ]
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Error al actualizar el perfil'
    });
  }
};

module.exports = {
  registrar,
  iniciarSesion,
  obtenerPerfil,
  actualizarPerfil
};

