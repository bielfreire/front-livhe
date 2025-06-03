import { authService } from "@/services/authService";
import { buildApiUrl } from "./apiConfig";

// Tipo para opções da requisição
type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  isAuthenticated?: boolean;
};

/**
 * Função para fazer requisições HTTP
 * @param endpoint - Endpoint da API
 * @param options - Opções da requisição
 */
export const apiRequest = async (endpoint: string, options: RequestOptions = {}) => {
  const { 
    method = 'GET', 
    headers = {}, 
    body,
    isAuthenticated = true 
  } = options;

  // Configuração padrão
  const requestHeaders: Record<string, string> = {
    ...headers
  };

  // Adiciona Content-Type apenas se não for FormData
  if (!(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Adiciona o token de autenticação se necessário
  if (isAuthenticated) {
    const token = authService.getToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Opções da requisição
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Adiciona o corpo da requisição se necessário
  if (body) {
    // Se for FormData, enviamos diretamente. Se não, convertemos para JSON
    requestOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, requestOptions);
    
    // Para respostas sem conteúdo (204)
    if (response.status === 204) return null;
    
    // Tenta fazer o parse da resposta como JSON, mas se falhar, retorna o texto
    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data.message 
        ? data.message 
        : 'Ocorreu um erro na requisição';
      console.error('Resposta de erro:', data);
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};

// Função específica para buscar gifts do TikTok
export const fetchTikTokGifts = async (username: string) => {
  return apiRequest(`/tiktok/gifts?username=${encodeURIComponent(username)}`, {
    method: 'GET',
    isAuthenticated: true
  });
};

// Função específica para buscar sons
export const fetchSounds = async () => {
  const response = await apiRequest("/sounds/top", {
    method: "GET",
    isAuthenticated: true,
  });
  return response;
};

export const searchSounds = async (query: string) => {
  const response = await apiRequest(`/sounds/search?query=${encodeURIComponent(query)}`, {
    method: "GET",
    isAuthenticated: true,
  });
  return response;
};

// Cancelar assinatura Stripe
export const cancelStripeSubscription = async () => {
  return apiRequest('/stripe/cancel-subscription', {
    method: 'POST',
    isAuthenticated: true,
  });
};
