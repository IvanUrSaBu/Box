# 🥊 Aplicación de Gestión de Boxeo Amateur

Una aplicación web fullstack completa para gestionar competiciones de boxeo amateur en España, desarrollada con React, Node.js/Express, PostgreSQL y autenticación JWT.

## 🚀 Características Principales

### 👥 Roles de Usuario
- **Administrador General**: Gestión completa del sistema, clubes y torneos
- **Administrador de Club**: Gestión de su club, boxeadores y torneos
- **Boxeador**: Visualización de perfil y historial de combates

### 🏢 Gestión de Entidades
- **Clubes**: CRUD completo con estadísticas y gestión de miembros
- **Boxeadores**: Perfiles completos con categorías de peso y records
- **Torneos**: Organización de competiciones públicas y privadas
- **Combates**: Registro de peleas con resultados detallados

### 🔐 Sistema de Autenticación
- Autenticación JWT segura
- Control de acceso basado en roles
- Rutas protegidas en frontend y backend
- Gestión de sesiones persistentes

### 📱 Diseño Responsive
- Interfaz moderna y profesional
- Optimizado para dispositivos móviles y desktop
- Navegación intuitiva con sidebar colapsible
- Componentes UI reutilizables

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con Vite
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **Lucide React** para iconografía
- **Recharts** para gráficos y estadísticas

### Backend
- **Node.js** con Express
- **PostgreSQL** como base de datos
- **Sequelize** ORM
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **CORS** y **Helmet** para seguridad

## 📁 Estructura del Proyecto

```
boxing-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración de BD
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Middleware de autenticación
│   │   ├── models/          # Modelos de Sequelize
│   │   ├── routes/          # Rutas de la API
│   │   └── app.js          # Aplicación principal
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   ├── pages/          # Páginas de la aplicación
    │   ├── services/       # Servicios de API
    │   ├── contexts/       # Contextos de React
    │   ├── hooks/          # Hooks personalizados
    │   └── utils/          # Utilidades y constantes
    ├── package.json
    └── .env
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd boxing-app
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor
npm start
```

### 3. Configurar Frontend
```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Iniciar aplicación
npm run dev
```

### 4. Configurar Base de Datos
```sql
-- Crear base de datos
CREATE DATABASE boxing_app;

-- Crear usuario (opcional)
CREATE USER boxing_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE boxing_app TO boxing_user;
```

## 🔧 Variables de Entorno

### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boxing_app
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Gestión de Boxeo Amateur
```

## 📊 Esquema de Base de Datos

### Entidades Principales
- **usuarios**: Información de usuarios del sistema
- **clubes**: Clubes de boxeo registrados
- **boxeadores**: Perfiles de boxeadores
- **torneos**: Competiciones organizadas
- **combates**: Peleas individuales

### Relaciones
- Usuario → Club (1:N)
- Club → Boxeador (1:N)
- Club → Torneo (1:N)
- Torneo → Combate (1:N)
- Boxeador → Combate (N:M)

## 🎯 Funcionalidades por Rol

### Administrador General
- ✅ Gestión completa de clubes
- ✅ Supervisión de todos los boxeadores
- ✅ Organización de torneos nacionales
- ✅ Acceso a estadísticas globales
- ✅ Gestión de usuarios del sistema

### Administrador de Club
- ✅ Gestión de su club específico
- ✅ Registro y gestión de boxeadores del club
- ✅ Organización de torneos del club
- ✅ Estadísticas del club
- ✅ Invitación de nuevos miembros

### Boxeador
- ✅ Visualización de perfil personal
- ✅ Historial completo de combates
- ✅ Estadísticas de rendimiento
- ✅ Información del club
- ✅ Próximos combates programados

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/registrar` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/perfil` - Obtener perfil
- `PUT /api/auth/perfil` - Actualizar perfil

### Clubes
- `GET /api/clubes` - Listar clubes
- `POST /api/clubes` - Crear club
- `GET /api/clubes/:id` - Obtener club
- `PUT /api/clubes/:id` - Actualizar club
- `DELETE /api/clubes/:id` - Eliminar club

### Boxeadores
- `GET /api/boxeadores` - Listar boxeadores
- `POST /api/boxeadores` - Crear boxeador
- `GET /api/boxeadores/:id` - Obtener boxeador
- `PUT /api/boxeadores/:id` - Actualizar boxeador
- `DELETE /api/boxeadores/:id` - Eliminar boxeador

### Torneos
- `GET /api/torneos` - Listar torneos
- `POST /api/torneos` - Crear torneo
- `GET /api/torneos/:id` - Obtener torneo
- `PUT /api/torneos/:id` - Actualizar torneo
- `DELETE /api/torneos/:id` - Eliminar torneo

### Combates
- `GET /api/combates` - Listar combates
- `POST /api/combates` - Crear combate
- `GET /api/combates/:id` - Obtener combate
- `PUT /api/combates/:id` - Actualizar combate
- `PUT /api/combates/:id/resultado` - Registrar resultado

## 🎨 Componentes UI

### Componentes Base
- `Button` - Botones con variantes
- `Input` - Campos de entrada
- `Card` - Tarjetas de contenido
- `Badge` - Etiquetas de estado
- `DataTable` - Tablas con paginación
- `StatCard` - Tarjetas de estadísticas

### Componentes de Layout
- `Layout` - Layout principal
- `Navbar` - Barra de navegación
- `Sidebar` - Barra lateral responsive
- `LoadingSpinner` - Indicador de carga
- `ErrorMessage` - Mensajes de error

## 🚀 Despliegue

### Preparación para Producción

1. **Backend**:
```bash
npm run build
NODE_ENV=production npm start
```

2. **Frontend**:
```bash
npm run build
# Servir archivos estáticos desde dist/
```

### Opciones de Despliegue
- **Render**: Despliegue automático desde Git
- **Railway**: Plataforma moderna para aplicaciones fullstack
- **VPS**: Servidor privado virtual con Docker
- **Vercel**: Para frontend estático
- **Heroku**: Para aplicaciones Node.js

## 🔒 Seguridad

### Medidas Implementadas
- ✅ Autenticación JWT segura
- ✅ Hash de contraseñas con bcrypt
- ✅ Validación de entrada en frontend y backend
- ✅ CORS configurado correctamente
- ✅ Helmet para headers de seguridad
- ✅ Control de acceso basado en roles
- ✅ Sanitización de datos de entrada

## 📈 Extensibilidad Futura

### Características Planificadas
- 🔄 Soporte para otros deportes
- 🌐 Perfiles públicos compartibles
- 🏆 Sistema de rankings nacional/regional
- 📊 Panel de administración avanzado
- 🔌 API pública para sitios externos
- 📱 Aplicación móvil (PWA/nativa)
- 📝 Sistema de blog para noticias

### Arquitectura Escalable
- Microservicios preparados
- Base de datos optimizada
- Cache con Redis
- CDN para assets estáticos
- Monitoreo y logging

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para la comunidad de boxeo amateur en España.

---

## 🆘 Soporte

Para soporte técnico o preguntas:
- 📧 Email: soporte@boxeoapp.com
- 📱 Teléfono: +34 XXX XXX XXX
- 💬 Chat: Disponible en la aplicación

¡Gracias por usar nuestra aplicación de gestión de boxeo amateur! 🥊

