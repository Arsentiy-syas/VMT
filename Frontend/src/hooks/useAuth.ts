// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api';

interface UserData {
  username: string;
  email: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    console.log('🔐 Проверка авторизации (порт 8001)...');
    
    try {
      const response = await fetch(getApiUrl('PROFILE'), {
        method: 'GET',
        credentials: 'include', // Важно!
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📊 Статус:', response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUserData(data.data);
        console.log('✅ Авторизован:', data.data?.username);
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        console.log('❌ Не авторизован');
      }
    } catch (error) {
      console.error('🚨 Ошибка:', error);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(getApiUrl('LOGOUT'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } finally {
      setIsAuthenticated(false);
      setUserData(null);
      // Очищаем куки для обоих портов
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        // Удаляем для localhost
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    userData,
    isLoading,
    checkAuth,
    logout,
  };
};