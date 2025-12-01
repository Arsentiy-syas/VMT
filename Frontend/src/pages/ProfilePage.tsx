// src/pages/ProfilePage.tsx - ФИНАЛЬНАЯ ВЕРСИЯ
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{username: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Загрузка профиля
  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('📥 Загрузка профиля...');
      
      const response = await fetch('http://localhost:8001/api/v2/profile/profile/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('📊 Статус профиля:', response.status);

      if (response.status === 200) {
        const data = await response.json();
        
        if (data && data.status === 'success' && data.data) {
          setUserData(data.data);
          setIsAuthenticated(true);
          console.log('✅ Профиль загружен:', data.data.username);
        } else {
          throw new Error('Нет данных пользователя');
        }
      } else {
        // Если не 200 - не авторизован
        throw new Error(`Статус: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      setIsAuthenticated(false);
      
      // Через 1 секунду на логин
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  // Выход - такой же как в Home.tsx
  const handleLogout = () => {
    console.log('👋 ВЫХОД из профиля...');
    
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
    fetch('http://localhost:8001/api/logout/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // Игнорируем ошибки
    });
    
    // 5. Сообщение
    alert('Вы успешно вышли!');
    
    // 6. Редирект на главную
    setTimeout(() => {
      window.location.replace('/');
    }, 100);
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={styles.notAuthContainer}>
        <div style={styles.card}>
          <h2>Требуется авторизация</h2>
          <p>Перенаправление на страницу входа...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Шапка */}
      <div style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerContent}>
            <button 
              style={styles.backButton}
              onClick={() => navigate('/')}
            >
              ← На главную
            </button>
            <h1 style={styles.title}>Профиль</h1>
            <button 
              style={styles.logoutButton}
              onClick={handleLogout}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.profileCard}>
            {/* Информация пользователя */}
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div style={styles.userDetails}>
                <h2 style={styles.username}>{userData?.username || 'Пользователь'}</h2>
                <p style={styles.email}>{userData?.email || 'Email не указан'}</p>
              </div>
            </div>

            {/* Кнопки */}
            <div style={styles.buttons}>
              <button 
                style={styles.button}
                onClick={() => navigate('/colleges')}
              >
                Смотреть колледжи
              </button>
              <button 
                style={styles.button}
                onClick={fetchProfile}
              >
                Обновить данные
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Стили
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f5f5f5'
  },
  
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  
  notAuthContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
  },
  
  header: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '1rem 0',
  },
  
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  },
  
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  backButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px 16px',
  },
  
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  
  logoutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  
  main: {
    padding: '40px 0',
  },
  
  profileCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e5e7eb',
  },
  
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  
  userDetails: {
    flex: 1,
  },
  
  username: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  
  email: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
  
  buttons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  
  button: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  },
};

export default ProfilePage;