
// Serviço para gerenciar autenticação
export const authService = {
  // Salvar token no localStorage
  setToken: (token: string): void => {
    localStorage.setItem('access_token', token);
  },

  // Obter token do localStorage
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  // Remover token do localStorage (logout)
  removeToken: (): void => {
    localStorage.removeItem('access_token');
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  }
};
