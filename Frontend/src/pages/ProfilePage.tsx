// src/pages/ProfilePage.tsx - ИСПРАВЛЕННЫЙ (использует user_videos из сериализатора)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  username: string;
  email: string;
  user_videos?: Video[]; // Видео из сериализатора (source='fileuploads_set')
}

interface Video {
  id: number;
  title: string;
  videos: string; // URL видео (поле videos в модели)
  description?: string;
  owner?: number;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  // Сервер Django
  const DJANGO_SERVER = 'http://localhost:8001';

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

  // Загрузка профиля и видео - ИСПРАВЛЕННАЯ ЛОГИКА
  const fetchProfile = async () => {
    console.log('📥 Загрузка профиля с видео из сериализатора...');
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${DJANGO_SERVER}/api/v2/profile/profile/`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
        },
      });

      console.log('📊 Статус профиля:', response.status);

      if (response.status === 200) {
        const data = await response.json();
        console.log('📦 Полные данные из API:', data);
        
        if (data && data.status === 'success' && data.data) {
          const user = data.data;
          setUserData(user);
          setIsAuthenticated(true);
          console.log('✅ Профиль загружен:', user.username);
          
          // ВАЖНО: Получаем видео из user_videos (из сериализатора)
          // В serialaizers.py: user_videos = VideoUpload(source='fileuploads_set', many=True, read_only=True)
          console.log('🔍 Проверяем user.user_videos:', user.user_videos);
          
          let userVideos: Video[] = [];
          
          // СПОСОБ 1: Прямо из user_videos (основной способ)
          if (user.user_videos && Array.isArray(user.user_videos)) {
            console.log('🎬 Видео найдены в user.user_videos:', user.user_videos);
            userVideos = user.user_videos;
          }
          // СПОСОБ 2: Ищем fileuploads_set (если сериализатор вернул другое имя)
          else if (user.fileuploads_set && Array.isArray(user.fileuploads_set)) {
            console.log('🎬 Видео найдены в user.fileuploads_set:', user.fileuploads_set);
            userVideos = user.fileuploads_set;
          }
          // СПОСОБ 3: Ищем в корне data
          else if (data.data.fileuploads_set && Array.isArray(data.data.fileuploads_set)) {
            console.log('🎬 Видео найдены в data.data.fileuploads_set:', data.data.fileuploads_set);
            userVideos = data.data.fileuploads_set;
          }
          // СПОСОБ 4: Ищем в корневом data под любым именем
          else {
            console.log('🔍 Ищем видео в структуре данных...');
            for (const key in data.data) {
              if (Array.isArray(data.data[key]) && data.data[key].length > 0) {
                const firstItem = data.data[key][0];
                if (firstItem && (firstItem.videos !== undefined || firstItem.title !== undefined)) {
                  console.log(`🎬 Найдены видео в data.data.${key}:`, data.data[key]);
                  userVideos = data.data[key];
                  break;
                }
              }
            }
          }
          
          // Если видео найдены, обновляем состояние
          if (userVideos.length > 0) {
            console.log(`✅ Найдено ${userVideos.length} видео из сериализатора:`, userVideos);
            setVideos(userVideos);
            
            // Устанавливаем первое видео как активное
            setActiveVideo(userVideos[0]);
            console.log('📹 Активное видео установлено:', userVideos[0]);
          } else {
            console.log('📭 Видео не найдены в ответе сериализатора');
            console.log('📊 Полная структура данных:', data);
            setVideos([]);
            setActiveVideo(null);
          }
        } else {
          setError('Неверная структура данных профиля');
          console.error('❌ Неожиданная структура данных:', data);
        }
      } else if (response.status === 401) {
        setError('Требуется авторизация');
        setIsAuthenticated(false);
        setUserData(null);
        
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        throw new Error(`Статус: ${response.status}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      console.error('❌ Ошибка загрузки профиля:', error);
      setError(`Ошибка: ${errorMsg}`);
      setIsAuthenticated(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка видео отдельным запросом (если нужно)
  const fetchUserVideos = async () => {
    try {
      setVideosLoading(true);
      console.log('🎬 Загрузка видео отдельным запросом...');
      
      // Прямой запрос к видео API
      const response = await fetch(`${DJANGO_SERVER}/api/v1/user-videos/`, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
        },
      });
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('📦 Видео из отдельного запроса:', data);
        
        if (data && Array.isArray(data)) {
          setVideos(data);
          if (data.length > 0 && !activeVideo) {
            setActiveVideo(data[0]);
          }
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки видео:', error);
      // Не очищаем видео, если они уже загружены с профилем
    } finally {
      setVideosLoading(false);
    }
  };

  // Выход
  const handleLogout = async () => {
    console.log('👋 Выход из профиля...');
    
    try {
      const csrfToken = getCsrfToken();
      
      const response = await fetch(`${DJANGO_SERVER}/api/v2/logout/`, {
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

  // Форматирование даты
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Дата неизвестна';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Обработчик воспроизведения видео
  const handlePlayVideo = (videoId: number) => {
    setPlayingVideoId(prevId => prevId === videoId ? null : videoId);
  };

  // Загрузка видео при монтировании
  useEffect(() => {
    fetchProfile();
  }, []);

  // Если видео не загрузились с профилем, пробуем загрузить отдельно
  useEffect(() => {
    if (!loading && isAuthenticated && videos.length === 0) {
      fetchUserVideos();
    }
  }, [loading, isAuthenticated, videos.length]);

  // Вспомогательная функция для получения полного URL видео
  const getVideoUrl = (videoPath: string) => {
    if (!videoPath) return '';
    if (videoPath.startsWith('http')) return videoPath;
    if (videoPath.startsWith('/media/')) return `${DJANGO_SERVER}${videoPath}`;
    return `${DJANGO_SERVER}/media/${videoPath}`;
  };

  // Функция для отладки структуры данных
  const debugDataStructure = () => {
    console.log('🐛 ===== ОТЛАДОЧНАЯ ИНФОРМАЦИЯ =====');
    console.log('📊 Полные данные профиля:', userData);
    console.log('🎬 Видео в состоянии:', videos);
    console.log('🎯 Активное видео:', activeVideo);
    console.log('🔑 Ключи в userData:', userData ? Object.keys(userData) : 'Нет данных');
    
    // Детальный анализ структуры
    if (userData) {
      console.log('🔍 Детальный анализ структуры:');
      for (const key in userData) {
        const value = userData[key as keyof UserData];
        console.log(`  ${key}:`, value);
        if (Array.isArray(value)) {
          console.log(`    📦 Это массив с ${value.length} элементами`);
          if (value.length > 0) {
            console.log(`    🎬 Первый элемент:`, value[0]);
            console.log(`    🔑 Ключи первого элемента:`, Object.keys(value[0]));
          }
        }
      }
    }
    console.log('================================');
  };

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

            {/* Статистика */}
            <div style={styles.statsSection}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🎬</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{videos.length}</div>
                  <div style={styles.statLabel}>Видео</div>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👤</div>
                <div style={styles.statContent}>
                  <div style={styles.statNumber}>{userData?.username ? 'Активен' : '—'}</div>
                  <div style={styles.statLabel}>Статус</div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div style={styles.actionButtons}>
              <button 
                style={styles.actionButton}
                onClick={() => navigate('/colleges')}
              >
                Колледжи
              </button>
              <button 
                style={styles.uploadButton}
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
              <button 
                style={styles.debugButton}
                onClick={debugDataStructure}
              >
                🐛 Debug структуры
              </button>
            </div>

            {/* Ошибка */}
            {error && (
              <div style={styles.errorAlert}>
                <div style={styles.errorIcon}>⚠️</div>
                <div style={styles.errorContent}>
                  <strong>Ошибка:</strong> {error}
                </div>
                <button 
                  style={styles.errorClose}
                  onClick={() => setError('')}
                >
                  ×
                </button>
              </div>
            )}

            {/* Информация о структуре данных */}
            <div style={styles.dataStructureInfo}>
              <h4>Информация о данных:</h4>
              <ul style={styles.dataStructureList}>
                <li>Поле в сериализаторе: <code>user_videos = VideoUpload(source='fileuploads_set', many=True)</code></li>
                <li>Ожидаемое поле в ответе: <code>user_videos</code></li>
                <li>Модель: <code>FileUploads</code></li>
                <li>Поле видео в модели: <code>videos</code> (FileField)</li>
                <li>Найдено видео: <strong>{videos.length}</strong></li>
              </ul>
            </div>

            {/* Раздел видео */}
            <div style={styles.videosSection}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>
                  Мои видео
                  {videos.length > 0 && (
                    <span style={styles.badge}>{videos.length}</span>
                  )}
                </h3>
                <div style={styles.viewControls}>
                  <button 
                    style={styles.viewButton}
                    onClick={() => navigate('/video-upload')}
                  >
                    + Добавить видео
                  </button>
                </div>
              </div>

              {videosLoading ? (
                <div style={styles.loadingVideos}>
                  <div style={styles.smallSpinner}></div>
                  <p>Загрузка видео...</p>
                </div>
              ) : videos.length === 0 ? (
                <div style={styles.noVideos}>
                  <div style={styles.noVideosIcon}>📹</div>
                  <h4 style={styles.noVideosTitle}>Пока нет видео</h4>
                  <p style={styles.noVideosText}>
                    {userData?.username}, загрузите своё первое видео!
                  </p>
                  <div style={styles.debugTips}>
                    <p><strong>Для отладки:</strong></p>
                    <ol style={styles.debugTipsList}>
                      <li>Нажмите кнопку "Debug структуры" выше</li>
                      <li>Проверьте консоль браузера (F12 → Console)</li>
                      <li>Посмотрите Network вкладку для ответа API</li>
                      <li>Убедитесь что видео загружены через VideoUploadPage</li>
                    </ol>
                  </div>
                  <button 
                    style={styles.uploadFirstButton}
                    onClick={() => navigate('/video-upload')}
                  >
                    🎬 Загрузить первое видео
                  </button>
                </div>
              ) : (
                <div style={styles.videosContent}>
                  {/* Основной плеер для выбранного видео */}
                  {activeVideo && (
                    <div style={styles.mainVideoPlayer}>
                      <div style={styles.playerHeader}>
                        <h3 style={styles.playerTitle}>
                          📺 {activeVideo.title || 'Видео без названия'}
                        </h3>
                        <button 
                          style={styles.closePlayerButton}
                          onClick={() => setActiveVideo(null)}
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div style={styles.videoContainer}>
                        <video
                          key={activeVideo.id}
                          controls
                          autoPlay
                          style={styles.mainVideo}
                          src={getVideoUrl(activeVideo.videos)}
                        >
                          Ваш браузер не поддерживает видео.
                          <a href={getVideoUrl(activeVideo.videos)}>Скачать видео</a>
                        </video>
                      </div>
                      
                      <div style={styles.videoDetails}>
                        <div style={styles.videoInfoFull}>
                          <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>ID:</span>
                            <span style={styles.infoValue}><code>{activeVideo.id}</code></span>
                          </div>
                          <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Название:</span>
                            <span style={styles.infoValue}>{activeVideo.title || 'Без названия'}</span>
                          </div>
                          {activeVideo.description && (
                            <div style={styles.infoRow}>
                              <span style={styles.infoLabel}>Описание:</span>
                              <span style={styles.infoValue}>{activeVideo.description}</span>
                            </div>
                          )}
                          <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Файл:</span>
                            <span style={styles.infoValue}>
                              <code style={styles.code}>{activeVideo.videos}</code>
                            </span>
                          </div>
                          <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Ссылка:</span>
                            <span style={styles.infoValue}>
                              <a 
                                href={getVideoUrl(activeVideo.videos)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={styles.link}
                              >
                                📎 Открыть файл
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Сетка видео */}
                  <div style={styles.videosGrid}>
                    {videos.map((video) => (
                      <div 
                        key={video.id} 
                        style={{
                          ...styles.videoCard,
                          ...(activeVideo?.id === video.id ? styles.activeVideoCard : {})
                        }}
                        onClick={() => setActiveVideo(video)}
                      >
                        <div style={styles.videoThumbnail}>
                          <div style={styles.videoPreviewContainer}>
                            {playingVideoId === video.id ? (
                              <video
                                controls
                                autoPlay
                                style={styles.videoPreview}
                                src={getVideoUrl(video.videos)}
                                onPause={() => setPlayingVideoId(null)}
                              />
                            ) : (
                              <>
                                <div style={styles.thumbnailPlaceholder}>
                                  <div 
                                    style={styles.playIcon} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayVideo(video.id);
                                    }}
                                  >
                                    ▶
                                  </div>
                                </div>
                                <div style={styles.videoInfoBadge}>
                                  ID: {video.id}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div style={styles.videoInfo}>
                          <h4 style={styles.videoTitle}>
                            {video.title || `Видео #${video.id}`}
                          </h4>
                          {video.description && (
                            <p style={styles.videoDescription}>
                              {video.description.length > 60 
                                ? `${video.description.substring(0, 60)}...` 
                                : video.description}
                            </p>
                          )}
                          <div style={styles.videoMeta}>
                            <span style={styles.videoPath}>
                              📁 {video.videos ? video.videos.substring(video.videos.lastIndexOf('/') + 1, 30) : 'файл'}
                            </span>
                          </div>
                        </div>
                        
                        <div style={styles.videoActions}>
                          <button 
                            style={styles.watchButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideo(video);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            📺 Смотреть
                          </button>
                          <button 
                            style={styles.downloadButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getVideoUrl(video.videos), '_blank');
                            }}
                          >
                            ⬇️ Скачать
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CSS анимации */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// Стили (упрощенные для фокуса на функционал)
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  } as React.CSSProperties,
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
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
    background: '#667eea',
  } as React.CSSProperties,
  
  card: {
    background: 'white',
    borderRadius: '10px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
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
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
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
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
  } as React.CSSProperties,
  
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  } as React.CSSProperties,
  
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#007bff',
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
    margin: '0 0 5px 0',
  } as React.CSSProperties,
  
  email: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  } as React.CSSProperties,
  
  statsSection: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  } as React.CSSProperties,
  
  statCard: {
    flex: 1,
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #dee2e6',
  } as React.CSSProperties,
  
  statIcon: {
    fontSize: '30px',
  } as React.CSSProperties,
  
  statContent: {
    flex: 1,
  } as React.CSSProperties,
  
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 5px 0',
  } as React.CSSProperties,
  
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
  } as React.CSSProperties,
  
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  
  actionButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
  } as React.CSSProperties,
  
  uploadButton: {
    background: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
  } as React.CSSProperties,
  
  refreshButton: {
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
  } as React.CSSProperties,
  
  debugButton: {
    background: '#6f42c1',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
  } as React.CSSProperties,
  
  errorAlert: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #f5c6cb',
  } as React.CSSProperties,
  
  errorIcon: {
    fontSize: '20px',
  } as React.CSSProperties,
  
  errorContent: {
    flex: 1,
    fontSize: '14px',
  } as React.CSSProperties,
  
  errorClose: {
    background: 'none',
    color: '#721c24',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  } as React.CSSProperties,
  
  dataStructureInfo: {
    background: '#e7f3ff',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #b8daff',
  } as React.CSSProperties,
  
  dataStructureList: {
    margin: '10px 0 0 20px',
    fontSize: '14px',
    color: '#004085',
  } as React.CSSProperties,
  
  videosSection: {
    marginTop: '20px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  
  badge: {
    background: '#007bff',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.9rem',
  } as React.CSSProperties,
  
  viewControls: {
    display: 'flex',
    gap: '10px',
  } as React.CSSProperties,
  
  viewButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  
  loadingVideos: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6',
  } as React.CSSProperties,
  
  noVideos: {
    textAlign: 'center' as const,
    padding: '60px 0',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6',
  } as React.CSSProperties,
  
  noVideosIcon: {
    fontSize: '60px',
    marginBottom: '20px',
    opacity: 0.5,
  } as React.CSSProperties,
  
  noVideosTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0',
  } as React.CSSProperties,
  
  noVideosText: {
    color: '#666',
    marginBottom: '20px',
  } as React.CSSProperties,
  
  debugTips: {
    background: '#fff3cd',
    padding: '15px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #ffeaa7',
    textAlign: 'left' as const,
  } as React.CSSProperties,
  
  debugTipsList: {
    margin: '10px 0 0 20px',
    fontSize: '14px',
    color: '#856404',
  } as React.CSSProperties,
  
  uploadFirstButton: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '16px',
  } as React.CSSProperties,
  
  videosContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '30px',
  } as React.CSSProperties,
  
  mainVideoPlayer: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    border: '1px solid #dee2e6',
  } as React.CSSProperties,
  
  playerHeader: {
    background: '#f8f9fa',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #dee2e6',
  } as React.CSSProperties,
  
  playerTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  } as React.CSSProperties,
  
  closePlayerButton: {
    background: 'none',
    border: 'none',
    color: '#6c757d',
    cursor: 'pointer',
    fontSize: '20px',
  } as React.CSSProperties,
  
  videoContainer: {
    position: 'relative' as const,
    paddingTop: '56.25%', // 16:9
    backgroundColor: '#000',
  } as React.CSSProperties,
  
  mainVideo: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  } as React.CSSProperties,
  
  videoDetails: {
    padding: '20px',
  } as React.CSSProperties,
  
  videoInfoFull: {
    background: '#f8f9fa',
    borderRadius: '6px',
    padding: '15px',
  } as React.CSSProperties,
  
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e9ecef',
  } as React.CSSProperties,
  
  infoLabel: {
    fontWeight: 600,
    color: '#495057',
    fontSize: '14px',
    minWidth: '100px',
  } as React.CSSProperties,
  
  infoValue: {
    color: '#212529',
    fontSize: '14px',
    flex: 1,
    textAlign: 'right' as const,
  } as React.CSSProperties,
  
  code: {
    background: '#e9ecef',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
  } as React.CSSProperties,
  
  link: {
    color: '#007bff',
    textDecoration: 'none',
  } as React.CSSProperties,
  
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  } as React.CSSProperties,
  
  videoCard: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s',
    cursor: 'pointer',
    border: '1px solid #dee2e6',
  } as React.CSSProperties,
  
  activeVideoCard: {
    border: '2px solid #007bff',
    boxShadow: '0 5px 15px rgba(0, 123, 255, 0.2)',
  } as React.CSSProperties,
  
  videoThumbnail: {
    position: 'relative' as const,
    paddingTop: '56.25%', // 16:9
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  } as React.CSSProperties,
  
  videoPreviewContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  } as React.CSSProperties,
  
  videoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    backgroundColor: '#000',
  } as React.CSSProperties,
  
  thumbnailPlaceholder: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#2d3748',
  } as React.CSSProperties,
  
  playIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#007bff',
    cursor: 'pointer',
  } as React.CSSProperties,
  
  videoInfoBadge: {
    position: 'absolute' as const,
    top: '10px',
    left: '10px',
    background: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
  } as React.CSSProperties,
  
  videoInfo: {
    padding: '15px',
  } as React.CSSProperties,
  
  videoTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
    lineHeight: 1.3,
  } as React.CSSProperties,
  
  videoDescription: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: 1.4,
    margin: '0 0 10px 0',
  } as React.CSSProperties,
  
  videoMeta: {
    fontSize: '0.8rem',
    color: '#888',
  } as React.CSSProperties,
  
  videoPath: {
    fontFamily: 'monospace',
    fontSize: '11px',
  } as React.CSSProperties,
  
  videoActions: {
    padding: '0 15px 15px',
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,
  
  watchButton: {
    flex: 1,
    background: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  } as React.CSSProperties,
  
  downloadButton: {
    flex: 1,
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  } as React.CSSProperties,
};

export default ProfilePage;