// Lista de endpoints que devem usar a URL local
const LOCAL_ENDPOINTS = [
  '/server',
  '/tester',
  '/sounds',
  '/websocket',
  '/tiktok',
  '/overlays',
  '/presets',
  // '/streamers',
  // '/users',
  // '/auth',
  // '/stripe', 
  // '/payment',
  '/gtav',
  // 
 
];

// URL base de produção
const PRODUCTION_URL = 'https://livhe-production.up.railway.app';

// URL base loca
// URL base local
const LOCAL_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:4000'
  : 'http://127.0.0.1:4000';



/**
 * Determina a URL base apropriada para um endpoint específico
 * @param endpoint - O endpoint da API
 * @returns A URL base apropriada
 */
export const getBaseUrl = (endpoint: string): string => {
  // Verifica se o endpoint começa com algum dos prefixos que devem usar a URL local
  const shouldUseLocal = LOCAL_ENDPOINTS.some(prefix => endpoint.startsWith(prefix));
  
  // Retorna a URL apropriada
  return shouldUseLocal ? LOCAL_URL : PRODUCTION_URL;
};

/**
 * Constrói a URL completa para uma requisição
 * @param endpoint - O endpoint da API
 * @returns A URL completa para a requisição
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl(endpoint);
  return `${baseUrl}${endpoint}`;
}; 