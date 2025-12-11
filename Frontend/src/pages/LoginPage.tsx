// src/pages/LoginPage.tsx - ИСПРАВЛЕННЫЙ (TypeScript)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

interface ApiResponse {
  status?: string;
  message?: string;
  errors?: Record<string, string[] | string>;
  username?: string[] | string;
  password?: string[] | string;
  detail?: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  // Получаем CSRF токен при загрузке страницы
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        console.log('🔑 Получение CSRF токена...');
        const response = await fetch('http://localhost:8001/api/v2/csrf/', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken || '');
          console.log('✅ CSRF токен получен');
        } else {
          console.log('⚠️ Не удалось получить CSRF токен');
        }
      } catch (error) {
        console.error('❌ Ошибка получения CSRF токена:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    console.log('🔐 Попытка входа:', { username: formData.username });

    try {
      // Если CSRF токена нет, пробуем получить его снова
      let currentCsrfToken = csrfToken;
      if (!currentCsrfToken) {
        console.log('🔄 Получаем CSRF токен заново...');
        try {
          const csrfResponse = await fetch('http://localhost:8001/api/v2/csrf/', {
            method: 'GET',
            credentials: 'include',
          });
          if (csrfResponse.ok) {
            const csrfData = await csrfResponse.json();
            currentCsrfToken = csrfData.csrfToken || '';
            setCsrfToken(currentCsrfToken);
          }
        } catch (csrfError) {
          console.error('❌ Ошибка получения CSRF:', csrfError);
        }
      }

      const response = await fetch('http://localhost:8001/api/v2/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRFToken': currentCsrfToken || '',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      console.log('📊 Статус ответа логина:', response.status);

      const responseText = await response.text();
      console.log('📦 Текст ответа:', responseText);
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText) as ApiResponse;
      } catch {
        data = { message: 'Невалидный JSON ответ' };
      }

      if (response.ok && data.status === 'success') {
        console.log('✅ Успешный вход:', data);
        
        setSuccessMessage(data.message || 'Вход выполнен!');
        
        // Редирект на главную с обновлением состояния
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        console.log('❌ Ошибка входа:', data);
        
        // Детальная обработка ошибок
        if (data.username) {
          const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
          setErrors({ username: usernameError });
        } else if (data.password) {
          const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
          setErrors({ password: passwordError });
        } else if (data.errors) {
          // Обработка ошибок валидации
          const errorMessages: string[] = [];
          Object.keys(data.errors).forEach(key => {
            const value = data.errors![key];
            if (Array.isArray(value)) {
              errorMessages.push(`${key}: ${value[0]}`);
            } else {
              errorMessages.push(`${key}: ${value}`);
            }
          });
          setErrors({ general: errorMessages.join(', ') });
        } else if (data.message) {
          setErrors({ general: data.message });
        } else if (data.detail) {
          setErrors({ general: data.detail });
        } else {
          setErrors({ general: 'Неверные учетные данные' });
        }
      }
    } catch (error: any) {
      console.error('🚨 Ошибка входа:', error);
      if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        setErrors({ general: 'Ошибка соединения с сервером. Проверьте, запущен ли бэкенд на порту 8001' });
      } else {
        setErrors({ general: 'Ошибка соединения с сервером' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← На главную
          </button>
          <h1>Вход в систему</h1>
          <p>Введите ваши учетные данные</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
            <div className="redirect-message">
              Через 1 секунду вы будете перенаправлены на главную страницу...
            </div>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">Имя пользователя</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Введите имя пользователя"
                disabled={loading || successMessage.length > 0}
                className={errors.username ? 'error' : ''}
                autoComplete="username"
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Введите пароль"
                disabled={loading || successMessage.length > 0}
                className={errors.password ? 'error' : ''}
                autoComplete="current-password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || successMessage.length > 0}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>

            <div className="register-link">
              Нет аккаунта? <span onClick={() => navigate('/register')}>Зарегистрироваться</span>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 30px;
          position: relative;
        }
        
        .back-btn {
          position: absolute;
          left: 0;
          top: 0;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 0;
        }
        
        .back-btn:hover {
          color: #3b82f6;
        }
        
        .login-header h1 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 28px;
        }
        
        .login-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }
        
        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s;
        }
        
        .form-group input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        
        .form-group input.error {
          border-color: #ef4444;
        }
        
        .form-group input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }
        
        .field-error {
          color: #ef4444;
          font-size: 12px;
          font-weight: 500;
        }
        
        .error-message {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
        }
        
        .success-message {
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .redirect-message {
          color: #047857;
          font-size: 12px;
          margin-top: 8px;
        }
        
        .submit-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }
        
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .register-link {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 20px;
        }
        
        .register-link span {
          color: #3b82f6;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 600;
        }
        
        .register-link span:hover {
          color: #1d4ed8;
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 30px 20px;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;