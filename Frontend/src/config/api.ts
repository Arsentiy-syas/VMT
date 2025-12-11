// src/config/api.ts
export const API_CONFIG = {
  // Сервер аутентификации (порт 8001)
  AUTH_BASE: 'http://localhost:8001',
  
  // Сервер API (порт 8000)
  API_BASE: 'http://localhost:8000',
  
  ENDPOINTS: {
    // Аутентификация на порту 8001
    PROFILE: '/api/v2/profile/profile/',
    LOGIN: '/api/v2/auth/login/',
    LOGOUT: '/api/v2/logout/',
    REGISTER: '/api/v2/auth/register/',
    
    // Видео на порту 8000
    VIDEO_UPLOAD: '/api/v1/wathingvid/',
    VIDEO_LIST: '/api/v1/wathingvid/',
    
    // Колледжи на порту 8000
    COLLEGES: '/api/v1/collegelist/',
  }
};

// Функция для получения полного URL с правильным портом
export const getApiUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS): string => {
  // Определяем к какому серверу относится endpoint
  const authEndpoints = ['PROFILE', 'LOGIN', 'LOGOUT', 'REGISTER'];
  
  if (authEndpoints.includes(endpoint)) {
    return API_CONFIG.AUTH_BASE + API_CONFIG.ENDPOINTS[endpoint];
  } else {
    return API_CONFIG.API_BASE + API_CONFIG.ENDPOINTS[endpoint];
  }
};