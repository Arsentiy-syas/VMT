// src/pages/LoginPage.tsx - ИСПРАВЛЕННЫЙ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<{username?: string; password?: string; general?: string}>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    console.log('🔐 Попытка входа:', { username: formData.username });

    try {
      const response = await fetch('http://localhost:8001/api/v2/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
      });

      console.log('📊 Статус ответа логина:', response.status);

      const data = await response.json();
      console.log('📦 Данные ответа логина:', data);

      if (response.ok && data.status === 'success') {
        console.log('✅ Успешный вход:', data);
        
        // Проверяем профиль после входа
        console.log('🔄 Проверка профиля после входа...');
        
        const profileResponse = await fetch('http://localhost:8001/api/v2/profile/profile/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (profileResponse.ok) {
          console.log('✅ Профиль получен');
          
          // Перенаправляем на главную
          window.location.href = '/';
        } else {
          console.log('❌ Ошибка получения профиля');
          setErrors({ general: 'Ошибка загрузки профиля после входа' });
        }
      } else {
        console.log('❌ Ошибка входа:', data);
        setErrors({ general: data.message || 'Неверные учетные данные' });
      }
    } catch (error) {
      console.error('🚨 Ошибка входа:', error);
      setErrors({ general: 'Ошибка соединения с сервером. Проверьте, запущен ли бэкенд на порту 8001' });
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
              disabled={loading}
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
              disabled={loading}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>

          <div className="register-link">
            Нет аккаунта? <span onClick={() => navigate('/register')}>Зарегистрироваться</span>
          </div>
        </form>
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
      `}</style>
    </div>
  );
};

export default LoginPage;