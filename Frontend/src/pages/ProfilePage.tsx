// src/pages/ProfilePage.tsx - ИСПРАВЛЕННЫЙ
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  username: string;
  email: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  uploaded_at: string;
  views: number;
  likes: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{username: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Функция получения CSRF токена
  const getCsrfToken = (): string => {
    try {
      const cookies = document.cookie.split('; ');
      for (const cookie of cookies) {
        if (cookie.trim().startsWith('csrftoken=')) {
          return cookie.split('=')[1];
        }
      }
      return '';
    } catch (error) {
      console.error('Ошибка при получении CSRF токена:', error);
      return '';
    }
  };

  // Загрузка профиля
  const fetchProfile = async () => {
    console.log('📥 Загрузка профиля...');
    
    try {
      setLoading(true);
      
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
        console.log('📦 Данные профиля:', data);
        
        if (data && data.status === 'success' && data.data) {
          setUserData(data.data);
          setIsAuthenticated(true);
          console.log('✅ Профиль загружен:', data.data.username);
          
          // Загружаем видео пользователя
          await fetchUserVideos();
        } else {
          console.error('❌ Неожиданная структура данных:', data);
          throw new Error('Нет данных пользователя');
        }
      } else {
        throw new Error(`Статус: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      setIsAuthenticated(false);
      setUserData(null);
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка видео пользователя (заглушка для демонстрации)
  const fetchUserVideos = async () => {
    try {
      setVideosLoading(true);
      
      
      // Имитация задержки загрузки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('❌ Ошибка загрузки видео:', error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  // Выход
  const handleLogout = async () => {
    console.log('👋 Выход из профиля...');
    
    try {
      const csrfToken = getCsrfToken();
      
      const response = await fetch('http://localhost:8001/api/v2/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({}),
      });

      console.log('📊 Статус выхода:', response.status);
      
      localStorage.clear();
      sessionStorage.clear();
      
      setTimeout(() => {
        window.location.href = '/';
      }, 200);

    } catch (error) {
      console.error('Ошибка при выходе:', error);
      window.location.href = '/';
    }
  };

  // Удаление видео
  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это видео?')) return;
    
    try {
      const csrfToken = getCsrfToken();
      
      // В реальном приложении здесь будет запрос к API
      console.log('Удаление видео с ID:', videoId);
      
      // Удаляем видео из состояния
      const updatedVideos = videos.filter(video => video.id !== videoId);
      setVideos(updatedVideos);
      
      // Если удаляем активное видео, выбираем другое
      if (activeVideo?.id === videoId) {
        setActiveVideo(updatedVideos.length > 0 ? updatedVideos[0] : null);
      }
      
    } catch (error) {
      console.error('Ошибка удаления видео:', error);
      alert('Не удалось удалить видео');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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

            {/* Кнопки действий */}
            <div style={styles.actionButtons}>
              <button 
                style={styles.actionButton}
                onClick={() => navigate('/colleges')}
              >
                Смотреть колледжи
              </button>
              <button 
                style={styles.actionButton}
                onClick={() => navigate('/video-upload')}
              >
                📤 Загрузить видео
              </button>
              <button 
                style={styles.refreshButton}
                onClick={fetchProfile}
              >
                🔄 Обновить
              </button>
            </div>

            {/* Раздел видео */}
            <div style={styles.videosSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Мои видео</h3>
                <span style={styles.videoCount}>
                  {videos.length} видео
                </span>
              </div>

              {videosLoading ? (
                <div style={styles.loadingVideos}>
                  <div style={styles.smallSpinner}></div>
                  <p>Загрузка видео...</p>
                </div>
              ) : videos.length === 0 ? (
                <div style={styles.noVideos}>
                  <div style={styles.noVideosIcon}>🎬</div>
                  <p style={styles.noVideosText}>У вас еще нет загруженных видео</p>
                  <button 
                    style={styles.uploadFirstButton}
                    onClick={() => navigate('/video-upload')}
                  >
                    Загрузить первое видео
                  </button>
                </div>
              ) : (
                <div style={styles.videosContent}>
                  {/* Основное видео */}
                  {activeVideo && (
                    <div style={styles.mainVideoPlayer}>
                      <div style={styles.videoContainer}>
                        <video
                          controls
                          style={styles.videoPlayer}
                          src={activeVideo.video_url}
                          poster={activeVideo.thumbnail_url}
                        >
                          Ваш браузер не поддерживает видео.
                        </video>
                      </div>
                      <div style={styles.videoInfo}>
                        <h4 style={styles.videoTitle}>{activeVideo.title}</h4>
                        <p style={styles.videoDescription}>{activeVideo.description}</p>
                        <div style={styles.videoStats}>
                          <span style={styles.videoStat}>
                            👁️ {activeVideo.views} просмотров
                          </span>
                          <span style={styles.videoStat}>
                            ❤️ {activeVideo.likes} лайков
                          </span>
                          <span style={styles.videoStat}>
                            📅 {new Date(activeVideo.uploaded_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <div style={styles.videoActions}>
                          <button 
                            style={styles.deleteButton}
                            onClick={() => handleDeleteVideo(activeVideo.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Список видео */}
                  <div style={styles.videoList}>
                    <h4 style={styles.listTitle}>Все видео</h4>
                    <div style={styles.videoGrid}>
                      {videos.map(video => (
                        <div 
                          key={video.id} 
                          style={{
                            ...styles.videoItem,
                            ...(activeVideo?.id === video.id ? styles.activeVideoItem : {})
                          }}
                          onClick={() => setActiveVideo(video)}
                        >
                          <div style={styles.videoThumbnail}>
                            {video.thumbnail_url ? (
                              <img 
                                src={video.thumbnail_url} 
                                alt={video.title}
                                style={styles.thumbnailImage}
                              />
                            ) : (
                              <div style={styles.defaultThumbnail}>
                                🎬
                              </div>
                            )}
                            <div style={styles.videoDuration}>▶️</div>
                          </div>
                          <div style={styles.videoItemInfo}>
                            <h5 style={styles.videoItemTitle}>
                              {video.title.length > 30 
                                ? video.title.substring(0, 30) + '...' 
                                : video.title}
                            </h5>
                            <div style={styles.videoItemStats}>
                              <span>{video.views} просмотров</span>
                              <span>•</span>
                              <span>{new Date(video.uploaded_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
  } as React.CSSProperties,
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f5f5f5'
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
  
  smallSpinner: {
    width: '30px',
    height: '30px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
  } as React.CSSProperties,
  
  notAuthContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  } as React.CSSProperties,
  
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
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
  
  backButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px 16px',
  } as React.CSSProperties,
  
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  } as React.CSSProperties,
  
  logoutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
  } as React.CSSProperties,
  
  main: {
    padding: '40px 0',
  } as React.CSSProperties,
  
  profileCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e5e7eb',
  } as React.CSSProperties,
  
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
  } as React.CSSProperties,
  
  userDetails: {
    flex: 1,
  } as React.CSSProperties,
  
  username: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  } as React.CSSProperties,
  
  email: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  } as React.CSSProperties,
  
  actionButtons: {
    display: 'flex',
    gap: '12px',
    marginBottom: '40px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  
  actionButton: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  
  videosSection: {
    marginTop: '30px',
  } as React.CSSProperties,
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  } as React.CSSProperties,
  
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  } as React.CSSProperties,
  
  videoCount: {
    background: '#e9ecef',
    color: '#6c757d',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 500,
  } as React.CSSProperties,
  
  loadingVideos: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
  } as React.CSSProperties,
  
  noVideos: {
    textAlign: 'center' as const,
    padding: '60px 0',
  } as React.CSSProperties,
  
  noVideosIcon: {
    fontSize: '60px',
    marginBottom: '20px',
  } as React.CSSProperties,
  
  noVideosText: {
    color: '#666',
    marginBottom: '20px',
  } as React.CSSProperties,
  
  uploadFirstButton: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
  } as React.CSSProperties,
  
  videosContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  } as React.CSSProperties,
  
  mainVideoPlayer: {
    backgroundColor: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  } as React.CSSProperties,
  
  videoContainer: {
    position: 'relative' as const,
    paddingTop: '56.25%', // 16:9 aspect ratio
  } as React.CSSProperties,
  
  videoPlayer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  } as React.CSSProperties,
  
  videoInfo: {
    padding: '20px',
    backgroundColor: 'white',
  } as React.CSSProperties,
  
  videoTitle: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  } as React.CSSProperties,
  
  videoDescription: {
    color: '#666',
    margin: '0 0 15px 0',
    lineHeight: '1.5',
  } as React.CSSProperties,
  
  videoStats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '15px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  
  videoStat: {
    color: '#6b7280',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  } as React.CSSProperties,
  
  videoActions: {
    display: 'flex',
    gap: '10px',
  } as React.CSSProperties,
  
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  } as React.CSSProperties,
  
  videoList: {
    marginTop: '20px',
  } as React.CSSProperties,
  
  listTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 15px 0',
  } as React.CSSProperties,
  
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  } as React.CSSProperties,
  
  videoItem: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  
  activeVideoItem: {
    boxShadow: '0 0 0 2px #3b82f6',
  } as React.CSSProperties,
  
  videoThumbnail: {
    position: 'relative' as const,
    paddingTop: '56.25%', // 16:9
    backgroundColor: '#000',
  } as React.CSSProperties,
  
  thumbnailImage: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  } as React.CSSProperties,
  
  defaultThumbnail: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d3748',
    color: 'white',
    fontSize: '30px',
  } as React.CSSProperties,
  
  videoDuration: {
    position: 'absolute' as const,
    bottom: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '12px',
  } as React.CSSProperties,
  
  videoItemInfo: {
    padding: '10px',
  } as React.CSSProperties,
  
  videoItemTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 5px 0',
    lineHeight: '1.3',
  } as React.CSSProperties,
  
  videoItemStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#6b7280',
    fontSize: '12px',
  } as React.CSSProperties,
};

export default ProfilePage;