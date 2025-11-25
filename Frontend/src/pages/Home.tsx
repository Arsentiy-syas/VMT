// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');

  useEffect(() => {
    // Проверяем, была ли успешная регистрация
    const registrationSuccess = sessionStorage.getItem('registrationSuccess');
    const username = sessionStorage.getItem('registeredUsername');
    
    if (registrationSuccess === 'true' && username) {
      setShowSuccessNotification(true);
      setRegisteredUsername(username);
      
      // Очищаем sessionStorage
      sessionStorage.removeItem('registrationSuccess');
      sessionStorage.removeItem('registeredUsername');
      
      // Автоматически скрываем уведомление через 5 секунд
      const timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closeNotification = () => {
    setShowSuccessNotification(false);
  };

  // Стили для уведомления
  const notificationStyles = {
    notification: {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      background: '#10b981',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      maxWidth: '400px',
      animation: 'slideIn 0.3s ease-out'
    } as React.CSSProperties,
    
    notificationIcon: {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold'
    } as React.CSSProperties,
    
    notificationContent: {
      flex: 1
    } as React.CSSProperties,
    
    notificationTitle: {
      fontWeight: '600',
      fontSize: '16px',
      margin: '0 0 4px 0'
    } as React.CSSProperties,
    
    notificationMessage: {
      fontSize: '14px',
      margin: '0',
      opacity: 0.9
    } as React.CSSProperties,
    
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '4px',
      borderRadius: '4px',
      transition: 'background 0.2s ease'
    } as React.CSSProperties
  };

  return (
    <div className="home-page">
      {/* Уведомление об успешной регистрации */}
      {showSuccessNotification && (
        <div style={notificationStyles.notification}>
          <div style={notificationStyles.notificationIcon}>✓</div>
          <div style={notificationStyles.notificationContent}>
            <h4 style={notificationStyles.notificationTitle}>Регистрация успешна!</h4>
            <p style={notificationStyles.notificationMessage}>
              Добро пожаловать, {registeredUsername}! Вы успешно зарегистрированы.
            </p>
          </div>
          <button 
            style={notificationStyles.closeButton}
            onClick={closeNotification}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Остальной код Home.tsx остается без изменений */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🎓</div>
              <div className="logo-text">
                <span className="logo-title">Волховский</span>
                <span className="logo-subtitle">Многопрофильный техникум</span>
              </div>
            </div>
            
            <nav className="nav">
              <ul>
                <li><a href="#about" className="nav-link">О нас</a></li>
                <li><a href="#programs" className="nav-link">Программы</a></li>
                <li><a href="#news" className="nav-link">Новости</a></li>
                <li><a href="#contact" className="nav-link">Контакты</a></li>
                <li>
                  <button 
                    className="nav-button"
                    onClick={() => navigate('/colleges')}
                  >
                    Колледжи
                  </button>
                </li>
              </ul>
            </nav>

            <div className="header-actions">
              <button 
                className="btn-register"
                onClick={() => navigate('/register')}
              >
                <span>Регистрация</span>
              </button>
              <button className="btn-login">
                <span>Войти</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Остальной код Home.tsx... */}
      {/* Hero Section, Features Section, Programs Section, CTA Section, Footer */}
      
      {/* Добавьте анимацию для уведомления в конец файла */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;