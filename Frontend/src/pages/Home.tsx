// src/pages/Home.tsx - ИСПРАВЛЕННЫЙ
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  username: string;
  email: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Проверка авторизации
  const checkAuthStatus = async () => {
    try {
      console.log('🔐 Проверка авторизации...');
      
      // Проверяем флаг успешной регистрации
      const registrationSuccess = sessionStorage.getItem('registrationSuccess');
      if (registrationSuccess === 'true') {
        console.log('🔄 Проверка авторизации после регистрации...');
      }
      
      const response = await fetch(`http://localhost:8001/api/v2/profile/profile/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      console.log('📊 Статус проверки:', response.status);

      if (response.status === 200) {
        const data = await response.json();
        console.log('📦 Данные профиля:', data);
        
        if (data && data.status === 'success' && data.data && data.data.username) {
          console.log('✅ Пользователь авторизован:', data.data.username);
          setIsAuthenticated(true);
          setUserData(data.data);
          
          // Убираем флаг успешной регистрации
          if (registrationSuccess === 'true') {
            sessionStorage.removeItem('registrationSuccess');
            sessionStorage.removeItem('registeredUsername');
          }
        } else {
          console.log('❌ Нет данных пользователя');
          setIsAuthenticated(false);
          setUserData(null);
        }
      } else {
        console.log('❌ Не авторизован, статус:', response.status);
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('🚨 Ошибка проверки:', error);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Выход
  const handleLogout = async () => {
    console.log('👋 Выход...');
    
    // 1. Сбрасываем состояние
    setIsAuthenticated(false);
    setUserData(null);
    
    // 2. Очищаем хранилища
    localStorage.clear();
    sessionStorage.clear();
    
    // 3. Очищаем cookies
    document.cookie.split(";").forEach(cookie => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // 4. Пытаемся отправить запрос на сервер
    try {
      await fetch('http://localhost:8001/api/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log('⚠️ Ошибка отправки запроса:', error);
    }
    
    // 5. Сообщение и перезагрузка
    alert('Вы успешно вышли из системы!');
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  useEffect(() => {
    // Проверка регистрации
    const registrationSuccess = sessionStorage.getItem('registrationSuccess');
    const username = sessionStorage.getItem('registeredUsername');
    
    if (registrationSuccess === 'true' && username) {
      setShowSuccessNotification(true);
      setRegisteredUsername(username);
      
      sessionStorage.removeItem('registrationSuccess');
      sessionStorage.removeItem('registeredUsername');
      
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }

    // Проверка авторизации
    checkAuthStatus();
  }, []);

  const closeNotification = () => {
    setShowSuccessNotification(false);
  };

  if (isCheckingAuth) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Уведомление о регистрации */}
      {showSuccessNotification && (
        <div style={styles.notification}>
          <div style={styles.notificationIcon}>✓</div>
          <div style={styles.notificationContent}>
            <h4 style={styles.notificationTitle}>Регистрация успешна!</h4>
            <p style={styles.notificationMessage}>
              Добро пожаловать, {registeredUsername}!
            </p>
          </div>
          <button 
            style={styles.notificationClose}
            onClick={closeNotification}
          >
            ×
          </button>
        </div>
      )}

      {/* Шапка */}
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerContent}>
            {/* Логотип */}
            <div style={styles.logo}>
              <div style={styles.logoIcon}>🎓</div>
              <div style={styles.logoText}>
                <span style={styles.logoTitle}>Волховский</span>
                <span style={styles.logoSubtitle}>Многопрофильный техникум</span>
              </div>
            </div>
            
            {/* Навигация */}
            <nav style={styles.nav}>
              <button 
                style={styles.navButton}
                onClick={() => navigate('/colleges')}
              >
                Колледжи
              </button>
            </nav>

            {/* Кнопки входа/выхода */}
            <div style={styles.headerActions}>
              {isAuthenticated && userData ? (
                <div style={styles.userMenu}>
                  <span style={styles.welcomeText}>
                    {userData.username}
                  </span>
                  <button 
                    style={styles.btnProfile}
                    onClick={() => navigate('/profile')}
                  >
                    Профиль
                  </button>
                  <button 
                    style={styles.btnLogout}
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div style={styles.authButtons}>
                  <button 
                    style={styles.btnLogin}
                    onClick={() => navigate('/login')}
                  >
                    Войти
                  </button>
                  <button 
                    style={styles.btnRegister}
                    onClick={() => navigate('/register')}
                  >
                    Регистрация
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.hero}>
            <h1 style={styles.heroTitle}>Добро пожаловать в Волховский многопрофильный техникум</h1>
            <p style={styles.heroSubtitle}>Получите качественное образование для успешного будущего</p>
            <div style={styles.ctaButtons}>
              <button 
                style={styles.primaryCta}
                onClick={() => navigate('/colleges')}
              >
                Посмотреть колледжи
              </button>
              {!isAuthenticated && (
                <button 
                  style={styles.secondaryCta}
                  onClick={() => navigate('/register')}
                >
                  Начать обучение
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Встроенные стили для анимации */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Объект со стилями
const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
  } as React.CSSProperties,
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  } as React.CSSProperties,
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  } as React.CSSProperties,
  
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#10b981',
    color: 'white',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '400px',
  } as React.CSSProperties,
  
  notificationIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  } as React.CSSProperties,
  
  notificationContent: {
    flex: 1,
  } as React.CSSProperties,
  
  notificationTitle: {
    fontWeight: 600,
    fontSize: '16px',
    margin: '0 0 4px 0',
  } as React.CSSProperties,
  
  notificationMessage: {
    fontSize: '14px',
    margin: 0,
    opacity: 0.9,
  } as React.CSSProperties,
  
  notificationClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    borderRadius: '4px',
  } as React.CSSProperties,
  
  header: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '1rem 0',
  } as React.CSSProperties,
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  } as React.CSSProperties,
  
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  
  logoIcon: {
    fontSize: '32px',
  } as React.CSSProperties,
  
  logoText: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  
  logoTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  } as React.CSSProperties,
  
  logoSubtitle: {
    fontSize: '12px',
    color: '#666',
  } as React.CSSProperties,
  
  nav: {
    display: 'flex',
    gap: '20px',
  } as React.CSSProperties,
  
  navButton: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  } as React.CSSProperties,
  
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  } as React.CSSProperties,
  
  welcomeText: {
    color: '#333',
    fontWeight: 500,
    fontSize: '14px',
    background: '#f0f7ff',
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #d0e3ff',
  } as React.CSSProperties,
  
  btnProfile: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  
  btnLogout: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  
  authButtons: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  } as React.CSSProperties,
  
  btnLogin: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  
  btnRegister: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  
  main: {
    padding: '80px 0',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    minHeight: 'calc(100vh - 70px)',
  } as React.CSSProperties,
  
  hero: {
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,
  
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '1rem',
    fontWeight: 700,
  } as React.CSSProperties,
  
  heroSubtitle: {
    fontSize: '1.5rem',
    marginBottom: '3rem',
    opacity: 0.9,
  } as React.CSSProperties,
  
  ctaButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  } as React.CSSProperties,
  
  primaryCta: {
    background: 'white',
    color: '#667eea',
    border: 'none',
    padding: '15px 40px',
    borderRadius: '8px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 600,
  } as React.CSSProperties,
  
  secondaryCta: {
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    padding: '15px 40px',
    borderRadius: '8px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontWeight: 600,
  } as React.CSSProperties,
};

export default Home;