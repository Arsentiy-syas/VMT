// src/pages/RegistrationPage.tsx - ОБНОВЛЕННЫЙ
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegistrationForm {
  username: string;
  email: string;
  password: string;
  password2: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegistrationForm>({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState<Partial<RegistrationForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof RegistrationForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationForm> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.password2) {
      newErrors.password2 = 'Подтвердите пароль';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // 1. Регистрация
      const registrationResponse = await fetch('http://localhost:8001/api/v2/registration/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2
        }),
      });

      if (registrationResponse.status === 201) {
        const registrationData = await registrationResponse.json();
        console.log('✅ Регистрация успешна:', registrationData);
        
        // 2. Автоматический вход после регистрации
        setSuccessMessage(`Добро пожаловать, ${formData.username}! Выполняется вход...`);
        
        try {
          const loginResponse = await fetch('http://localhost:8001/api/v2/login/', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password
            }),
          });

          if (loginResponse.status === 200) {
            const loginData = await loginResponse.json();
            console.log('✅ Автоматический вход успешен:', loginData);
            
            // Сохраняем информацию о регистрации
            sessionStorage.setItem('registrationSuccess', 'true');
            sessionStorage.setItem('registeredUsername', formData.username);
            
            // Немедленно перенаправляем на главную
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            // Если вход не удался, но регистрация прошла
            console.log('⚠️ Автоматический вход не удался, но регистрация прошла');
            setSuccessMessage(`Регистрация успешна! Войдите в систему.`);
            
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          }
        } catch (loginError) {
          console.log('⚠️ Ошибка автоматического входа:', loginError);
          setSuccessMessage(`Регистрация успешна! Войдите в систему.`);
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        const errorData = await registrationResponse.json();
        throw new Error(errorData.message || 'Ошибка регистрации');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message.includes('Network Error')) {
        setErrors({ username: 'Ошибка соединения с сервером. Проверьте, запущен ли бэкенд на порту 8001' });
      } else {
        setErrors({ username: error.message || 'Неизвестная ошибка при регистрации' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Inline styles
  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    } as React.CSSProperties,
    
    container: {
      width: '100%',
      maxWidth: '480px'
    } as React.CSSProperties,
    
    card: {
      background: 'white',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    } as React.CSSProperties,
    
    header: {
      textAlign: 'center' as const,
      marginBottom: '32px',
      position: 'relative' as const
    },
    
    backButton: {
      position: 'absolute' as const,
      left: '0',
      top: '0',
      background: 'none',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '8px 0',
      fontSize: '14px',
      transition: 'color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    } as React.CSSProperties,
    
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px',
      marginTop: '0'
    } as React.CSSProperties,
    
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem',
      margin: '0'
    } as React.CSSProperties,
    
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px'
    } as React.CSSProperties,
    
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px'
    } as React.CSSProperties,
    
    label: {
      fontWeight: '600',
      color: '#374151',
      fontSize: '14px'
    } as React.CSSProperties,
    
    input: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      background: 'white',
      outline: 'none'
    } as React.CSSProperties,
    
    inputError: {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
    } as React.CSSProperties,
    
    inputDisabled: {
      backgroundColor: '#f9fafb',
      cursor: 'not-allowed',
      opacity: 0.7
    } as React.CSSProperties,
    
    errorText: {
      color: '#ef4444',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '4px'
    } as React.CSSProperties,
    
    submitButton: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      padding: '14px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '8px'
    } as React.CSSProperties,
    
    submitButtonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed'
    } as React.CSSProperties,
    
    spinner: {
      width: '18px',
      height: '18px',
      border: '2px solid transparent',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    } as React.CSSProperties,
    
    successMessage: {
      background: '#d1fae5',
      border: '1px solid #a7f3d0',
      color: '#065f46',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center' as const,
      animation: 'fadeIn 0.3s ease-out'
    } as React.CSSProperties,
    
    redirectMessage: {
      color: '#6b7280',
      fontSize: '12px',
      textAlign: 'center' as const,
      marginTop: '8px'
    } as React.CSSProperties,
    
    footer: {
      textAlign: 'center' as const,
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    } as React.CSSProperties,
    
    footerText: {
      color: '#6b7280',
      margin: '0'
    } as React.CSSProperties,
    
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontSize: 'inherit',
      padding: '0',
      fontWeight: '600'
    } as React.CSSProperties,
    
    serverError: {
      background: '#fef2f2',
      border: '1px solid #fee2e2',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      fontWeight: '500'
    } as React.CSSProperties
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <button 
              style={styles.backButton}
              onClick={() => navigate('/')}
            >
              ← На главную
            </button>
            <h1 style={styles.title}>Регистрация</h1>
            <p style={styles.subtitle}>Создайте аккаунт для доступа ко всем возможностям</p>
          </div>

          {successMessage && (
            <>
              <div style={styles.successMessage}>
                {successMessage}
              </div>
              <div style={styles.redirectMessage}>
                {successMessage.includes('вход') 
                  ? 'Через 1 секунду вы будете перенаправлены на главную страницу...'
                  : 'Через 2 секунды вы будете перенаправлены на страницу входа...'}
              </div>
            </>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Общая ошибка сервера */}
              {errors.username && errors.username.includes('сервер') && (
                <div style={styles.serverError}>
                  {errors.username}
                </div>
              )}

              <div style={styles.formGroup}>
                <label htmlFor="username" style={styles.label}>Имя пользователя *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.username && !errors.username.includes('сервер') ? styles.inputError : {}),
                    ...(isLoading ? styles.inputDisabled : {})
                  }}
                  placeholder="Введите имя пользователя"
                  disabled={isLoading || successMessage.length > 0}
                />
                {errors.username && !errors.username.includes('сервер') && (
                  <span style={styles.errorText}>{errors.username}</span>
                )}
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="email" style={styles.label}>Email адрес *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {}),
                    ...(isLoading ? styles.inputDisabled : {})
                  }}
                  placeholder="Введите ваш email"
                  disabled={isLoading || successMessage.length > 0}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="password" style={styles.label}>Пароль *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.password ? styles.inputError : {}),
                    ...(isLoading ? styles.inputDisabled : {})
                  }}
                  placeholder="Введите пароль"
                  disabled={isLoading || successMessage.length > 0}
                />
                {errors.password && <span style={styles.errorText}>{errors.password}</span>}
              </div>

              <div style={styles.formGroup}>
                <label htmlFor="password2" style={styles.label}>Подтверждение пароля *</label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    ...(errors.password2 ? styles.inputError : {}),
                    ...(isLoading ? styles.inputDisabled : {})
                  }}
                  placeholder="Повторите пароль"
                  disabled={isLoading || successMessage.length > 0}
                />
                {errors.password2 && <span style={styles.errorText}>{errors.password2}</span>}
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.submitButtonDisabled : {})
                }}
                disabled={isLoading || successMessage.length > 0}
                onMouseOver={(e) => {
                  if (!isLoading && !successMessage) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && !successMessage) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={styles.spinner}></div>
                    Регистрация...
                  </>
                ) : (
                  successMessage ? 'Зарегистрировано!' : 'Зарегистрироваться'
                )}
              </button>
            </form>
          )}

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Уже есть аккаунт?{' '}
              <button 
                style={styles.linkButton}
                onClick={() => navigate('/login')}
                disabled={isLoading || successMessage.length > 0}
              >
                Войти
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        @media (max-width: 640px) {
          .registration-card {
            padding: 24px;
          }
          
          h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationPage;