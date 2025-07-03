// Configuración de la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000
};

// Roles de usuario
export const USER_ROLES = {
  GENERAL_ADMIN: 'administrador_general',
  CLUB_ADMIN: 'administrador_club',
  BOXER: 'boxeador'
};

// Categorías de peso
export const WEIGHT_CATEGORIES = [
  'Peso Mosca (hasta 51kg)',
  'Peso Gallo (hasta 54kg)',
  'Peso Pluma (hasta 57kg)',
  'Peso Ligero (hasta 60kg)',
  'Peso Welter Ligero (hasta 64kg)',
  'Peso Welter (hasta 69kg)',
  'Peso Medio (hasta 75kg)',
  'Peso Semipesado (hasta 81kg)',
  'Peso Pesado (hasta 91kg)',
  'Peso Superpesado (más de 91kg)'
];

// Métodos de victoria
export const VICTORY_METHODS = [
  'Decisión unánime',
  'Decisión mayoritaria',
  'Decisión dividida',
  'KO (Knockout)',
  'TKO (Knockout técnico)',
  'Abandono',
  'Descalificación',
  'Decisión técnica'
];

// Estados de combate
export const FIGHT_STATUS = {
  SCHEDULED: 'programado',
  PENDING: 'pendiente',
  COMPLETED: 'finalizado',
  CANCELLED: 'cancelado'
};

// Tipos de resultado
export const FIGHT_RESULTS = {
  BOXER1_WIN: 'victoria_boxeador1',
  BOXER2_WIN: 'victoria_boxeador2',
  DRAW: 'empate',
  NO_RESULT: 'sin_resultado'
};

