export const config = {
  apiUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:4000'
    : 'http://127.0.0.1:4000', // Em produção, o backend roda localmente
  isDev: process.env.NODE_ENV === 'development'
}; 