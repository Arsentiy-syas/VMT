// src/hooks/useAuth.tsx (упрощенная версия)
import { useState, useEffect } from 'react';

interface UserData {
  username: string;
  email: string;
}

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8001/api/v2/profile/profile/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data && data.data) {
          setIsAuthenticated(true);
          setUser(data.data);
          return true;
        }
      }
      
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const cookies = document.cookie.split('; ');
      let csrfToken = '';
      for (const cookie of cookies) {
        if (cookie.trim().startsWith('csrftoken=')) {
          csrfToken = cookie.split('=')[1];
          break;
        }
      }

      await fetch('http://localhost:8001/api/v2/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    initAuth();
  }, []);

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
    logout,
  };
};