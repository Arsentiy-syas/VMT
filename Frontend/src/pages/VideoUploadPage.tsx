// src/pages/VideoUploadPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../config/api';

interface VideoData {
  title: string;
  description: string;
}

const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<VideoData>({
    title: '',
    description: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Получаем CSRF токен
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
      console.error('Ошибка получения CSRF:', error);
      return '';
    }
  };

  // Редирект если не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('⚠️ Не авторизован, перенаправляем на логин');
      navigate('/login', { state: { from: '/video-upload' } });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Обработчик файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Выберите видео файл (MP4, AVI, MOV)');
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        setError('Файл слишком большой (макс 100MB)');
        return;
      }
      
      setVideoFile(file);
      setError('');
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Обработчик формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Обработчик загрузки
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile) {
      setError('Выберите видео файл');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Введите название видео');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const csrfToken = getCsrfToken();
      console.log('CSRF токен:', csrfToken || 'Нет');
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('video_file', videoFile);
      
      const response = await fetch(getApiUrl('VIDEO_UPLOAD'), {
        method: 'POST',
        credentials: 'include', // ОЧЕНЬ ВАЖНО!
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: formDataToSend,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Видео загружено:', data);
        setSuccessMessage('Видео успешно загружено!');
        
        // Сброс формы
        setFormData({ title: '', description: '' });
        setVideoFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        const errorText = await response.text();
        setError(`Ошибка: ${response.status}. ${errorText.substring(0, 100)}`);
      }
    } catch (err: any) {
      console.error('🚨 Ошибка:', err);
      setError(`Ошибка соединения: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Очистка превью
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Загрузка
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  // Если не авторизован (редуктантно, но на всякий случай)
  if (!isAuthenticated) {
    return null; // Будет редирект в useEffect
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Шапка */}
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/profile')}
          >
            ← Назад
          </button>
          <h1>Загрузка видео</h1>
          <p>Порт сервера: 8000</p>
        </div>

        {/* Сообщения */}
        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        {/* Форма */}
        <form onSubmit={handleUpload} style={styles.form}>
          {/* Файл */}
          <div style={styles.fileSection}>
            <div 
              style={styles.fileDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              
              {videoFile ? (
                <div style={styles.fileSelected}>
                  <div>🎬 {videoFile.name}</div>
                  <div style={styles.fileSize}>
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div style={styles.filePlaceholder}>
                  <div>📤 Нажмите чтобы выбрать видео</div>
                  <div>MP4, AVI, MOV, до 100MB</div>
                </div>
              )}
            </div>
          </div>

          {/* Превью */}
          {previewUrl && (
            <div style={styles.previewSection}>
              <video
                ref={videoRef}
                src={previewUrl}
                controls
                style={styles.previewVideo}
              />
            </div>
          )}

          {/* Поля */}
          <div style={styles.fields}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Название видео *"
              disabled={isUploading}
              required
              style={styles.input}
            />
            
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Описание (необязательно)"
              disabled={isUploading}
              rows={4}
              style={styles.textarea}
            />
          </div>

          {/* Кнопки */}
          <div style={styles.buttons}>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={isUploading}
              style={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isUploading || !videoFile || !formData.title.trim()}
              style={styles.uploadButton}
            >
              {isUploading ? 'Загрузка...' : 'Загрузить видео'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Стили
const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  } as React.CSSProperties,
  
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    position: 'relative' as const,
  } as React.CSSProperties,
  
  backButton: {
    position: 'absolute' as const,
    left: '0',
    top: '0',
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '16px',
  } as React.CSSProperties,
  
  error: {
    background: '#fee',
    color: '#c00',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #fcc',
  } as React.CSSProperties,
  
  success: {
    background: '#dfd',
    color: '#080',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #bfb',
  } as React.CSSProperties,
  
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  } as React.CSSProperties,
  
  fileSection: {
    marginBottom: '20px',
  } as React.CSSProperties,
  
  fileDrop: {
    border: '2px dashed #ccc',
    borderRadius: '10px',
    padding: '40px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: '#f9f9f9',
  } as React.CSSProperties,
  
  fileSelected: {
    textAlign: 'center' as const,
  } as React.CSSProperties,
  
  fileSize: {
    color: '#666',
    fontSize: '14px',
    marginTop: '5px',
  } as React.CSSProperties,
  
  filePlaceholder: {
    color: '#666',
  } as React.CSSProperties,
  
  previewSection: {
    marginBottom: '20px',
  } as React.CSSProperties,
  
  previewVideo: {
    width: '100%',
    borderRadius: '5px',
  } as React.CSSProperties,
  
  fields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  } as React.CSSProperties,
  
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
  } as React.CSSProperties,
  
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  } as React.CSSProperties,
  
  cancelButton: {
    padding: '12px 24px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  } as React.CSSProperties,
  
  uploadButton: {
    padding: '12px 24px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  } as React.CSSProperties,
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  } as React.CSSProperties,
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  } as React.CSSProperties,
};

export default VideoUploadPage;