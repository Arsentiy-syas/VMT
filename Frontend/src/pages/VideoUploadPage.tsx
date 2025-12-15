import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface VideoData {
  title: string;
  description?: string;
}

const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VideoData>({
    title: '',
    description: ''
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [csrfToken, setCsrfToken] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Сервер видео
  const VIDEO_SERVER = 'http://localhost:8000';

  // 1. Получаем CSRF токен при загрузке страницы
  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await fetch(`${VIDEO_SERVER}/api/v2/csrf/`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
          console.log('✅ CSRF токен получен');
        } else {
          console.warn('⚠️ CSRF токен не получен');
        }
      } catch (err) {
        console.error('❌ Ошибка получения CSRF:', err);
      }
    };

    getCsrfToken();
  }, []);

  // 2. Обработчик выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка типа файла
      const allowedExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setError(`Неверный формат файла. Разрешены: ${allowedExtensions.join(', ')}`);
        return;
      }
      
      // Проверка размера (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Файл слишком большой (максимум 100MB)');
        return;
      }
      
      setVideoFile(file);
      setError('');
      
      // Создаем превью
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Автоматически заполняем название из имени файла
      if (!formData.title.trim()) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Убираем расширение
        setFormData(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  // 3. Обработчик формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // 4. Основная функция загрузки видео
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!videoFile) {
      setError('Выберите видео файл');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Введите название видео');
      return;
    }
    
    if (formData.title.length < 2) {
      setError('Название должно быть не менее 2 символов');
      return;
    }
    
    if (formData.title.length > 100) {
      setError('Название должно быть не более 100 символов');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      console.log('🚀 Начинаем загрузку видео...');
      
      const formDataToSend = new FormData();
      
      // 1. Текстовые поля
      formDataToSend.append('title', formData.title.trim());
      
      // 2. Описание (если есть)
      if (formData.description?.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }
      
      // 3. Файл - ВАЖНО: используем ключ 'videos' как в модели Django
      formDataToSend.append('videos', videoFile);
      
      console.log('📤 Отправляемые данные:');
      console.log('- title:', formData.title);
      console.log('- description:', formData.description || '(нет)');
      console.log('- videos:', videoFile.name);
      console.log('- CSRF токен:', csrfToken ? 'Есть' : 'Нет');
      
      // Отправляем запрос через axios (как в примере)
      const response = await axios.post(
        `${VIDEO_SERVER}/api/v1/wathingvid/`,
        formDataToSend,
        {
          withCredentials: true, // Для передачи сессии
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrfToken,
          },
        }
      );
      
      console.log('✅ Видео успешно загружено:', response.data);
      setSuccessMessage(`Видео "${formData.title}" успешно загружено!`);
      
      // Сброс формы
      setFormData({ title: '', description: '' });
      setVideoFile(null);
      setPreviewUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Возвращаемся в профиль через 2 секунды
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (err: any) {
      console.error('🚨 Ошибка загрузки:', err);
      
      if (err.response) {
        // Сервер ответил с кодом ошибки
        const errorData = err.response.data;
        console.log('Данные ошибки:', errorData);
        
        if (err.response.status === 400) {
          // Обработка ошибок валидации Django
          let errorMessages: string[] = [];
          
          // Собираем все ошибки
          if (typeof errorData === 'object') {
            Object.entries(errorData).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach(msg => errorMessages.push(`${field}: ${msg}`));
              } else {
                errorMessages.push(`${field}: ${messages}`);
              }
            });
          } else if (typeof errorData === 'string') {
            errorMessages.push(errorData);
          }
          
          setError(errorMessages.length > 0 ? errorMessages.join('. ') : 'Ошибка валидации');
        } else if (err.response.status === 401) {
          setError('Требуется авторизация. Войдите на сервер видео.');
        } else if (err.response.status === 403) {
          setError('Доступ запрещен. Нет прав для загрузки видео.');
        } else if (err.response.status === 413) {
          setError('Файл слишком большой. Максимальный размер 100MB.');
        } else {
          setError(`Ошибка сервера: ${err.response.status}`);
        }
      } else if (err.request) {
        setError('Не удалось подключиться к серверу. Проверьте соединение.');
      } else {
        setError(`Ошибка: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 5. Вспомогательные функции
  const openVideoServer = () => {
    window.open(VIDEO_SERVER, '_blank');
  };

  const refreshCsrfToken = async () => {
    try {
      const response = await fetch(`${VIDEO_SERVER}/api/v2/csrf/`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
        console.log('✅ CSRF токен обновлен');
      }
    } catch (err) {
      console.error('❌ Ошибка обновления CSRF:', err);
    }
  };

  // 6. Очистка превью
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 7. Рендер компонента
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Шапка */}
        <div style={styles.header}>
          <button 
            style={styles.backButton}
            onClick={() => navigate('/profile')}
            disabled={isUploading}
          >
            ← Назад
          </button>
          <h1>📤 Загрузка видео</h1>
          <p style={styles.modelInfo}>Поле в модели: <code>videos</code></p>
        </div>

        {/* Панель управления */}
        <div style={styles.controls}>
          <button 
            onClick={openVideoServer}
            style={styles.controlBtn}
            disabled={isUploading}
            title="Открыть сервер видео в новой вкладке"
          >
            🔓 Открыть сервер
          </button>
          <button 
            onClick={refreshCsrfToken}
            style={styles.controlBtn}
            disabled={isUploading}
            title="Обновить CSRF токен"
          >
            🔄 Обновить CSRF
          </button>
        </div>

        {/* Сообщения об ошибках/успехе */}
        {error && (
          <div style={styles.error}>
            <div style={styles.errorContent}>
              <strong>⚠️ Ошибка:</strong> {error}
            </div>
          </div>
        )}
        
        {successMessage && (
          <div style={styles.success}>
            <div style={styles.successContent}>
              <strong>✅ Успешно!</strong> {successMessage}
            </div>
          </div>
        )}

        {/* Форма загрузки */}
        <form onSubmit={handleUpload} style={styles.form}>
          {/* Выбор файла */}
          <div style={styles.fileSection}>
            <div 
              style={{
                ...styles.fileDrop,
                borderColor: videoFile ? '#28a745' : '#ccc',
                opacity: isUploading ? 0.6 : 1,
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,video/*"
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              
              {videoFile ? (
                <div style={styles.fileSelected}>
                  <div style={styles.fileIcon}>🎬</div>
                  <div style={styles.fileDetails}>
                    <div style={styles.fileName}>{videoFile.name}</div>
                    <div style={styles.fileInfo}>
                      <span style={styles.fileSize}>
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <span style={styles.fileKey}>Ключ: videos</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.filePlaceholder}>
                  <div style={styles.uploadIcon}>📁</div>
                  <div style={styles.uploadText}>
                    <div>Нажмите для выбора видео</div>
                    <div style={styles.uploadHint}>Ключ FormData: <code>videos</code></div>
                  </div>
                  <div style={styles.supportedFormats}>
                    Поддерживаемые форматы: MP4, AVI, MOV, WMV, FLV, WebM, MKV
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Превью видео */}
          {previewUrl && (
            <div style={styles.previewSection}>
              <h3 style={styles.previewTitle}>Предпросмотр:</h3>
              <video
                src={previewUrl}
                controls
                style={styles.previewVideo}
                preload="metadata"
              />
            </div>
          )}

          {/* Поля ввода */}
          <div style={styles.inputSection}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>
                Название видео <span style={styles.required}>*</span>
                <span style={styles.charCount}>({formData.title.length}/100)</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Введите название видео"
                disabled={isUploading}
                required
                maxLength={100}
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Описание (необязательно)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Добавьте описание к видео..."
                disabled={isUploading}
                rows={3}
                style={styles.textarea}
              />
            </div>
          </div>

          {/* Кнопки отправки */}
          <div style={styles.actionButtons}>
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
              style={{
                ...styles.uploadButton,
                opacity: (isUploading || !videoFile || !formData.title.trim()) ? 0.6 : 1,
              }}
            >
              {isUploading ? '📤 Загрузка...' : '📤 Загрузить видео'}
            </button>
          </div>
        </form>

        {/* Информационная панель */}
        <div style={styles.infoPanel}>
          <h3 style={styles.infoTitle}>📝 Информация о загрузке:</h3>
          <ul style={styles.infoList}>
            <li><strong>Поле в модели Django:</strong> <code>videos</code></li>
            <li><strong>Максимальный размер:</strong> 100 MB</li>
            <li><strong>Поддерживаемые форматы:</strong> MP4, AVI, MOV, WMV, FLV, WebM, MKV</li>
            <li><strong>Длина названия:</strong> 2-100 символов</li>
            <li><strong>URL:</strong> <code>{VIDEO_SERVER}/api/v1/wathingvid/</code></li>
          </ul>
        </div>
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
    marginBottom: '20px',
    position: 'relative' as const,
  } as React.CSSProperties,
  
  modelInfo: {
    fontSize: '14px',
    color: '#666',
    marginTop: '5px',
    fontFamily: 'monospace',
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
    padding: '5px 0',
  } as React.CSSProperties,
  
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  } as React.CSSProperties,
  
  controlBtn: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  } as React.CSSProperties,
  
  error: {
    background: '#fee',
    color: '#c00',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #fcc',
  } as React.CSSProperties,
  
  errorContent: {
    fontSize: '14px',
  } as React.CSSProperties,
  
  success: {
    background: '#dfd',
    color: '#080',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    border: '1px solid #bfb',
  } as React.CSSProperties,
  
  successContent: {
    fontSize: '14px',
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
    border: '2px dashed',
    borderRadius: '10px',
    padding: '40px 20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: '#f9f9f9',
    transition: 'border-color 0.3s',
  } as React.CSSProperties,
  
  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  } as React.CSSProperties,
  
  fileIcon: {
    fontSize: '48px',
    color: '#28a745',
  } as React.CSSProperties,
  
  fileDetails: {
    textAlign: 'left' as const,
  } as React.CSSProperties,
  
  fileName: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginBottom: '5px',
    wordBreak: 'break-all' as const,
  } as React.CSSProperties,
  
  fileInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '14px',
    color: '#666',
  } as React.CSSProperties,
  
  fileSize: {
    background: '#e9ecef',
    padding: '2px 8px',
    borderRadius: '3px',
  } as React.CSSProperties,
  
  fileKey: {
    background: '#d1ecf1',
    color: '#0c5460',
    padding: '2px 8px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  
  filePlaceholder: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '15px',
  } as React.CSSProperties,
  
  uploadIcon: {
    fontSize: '48px',
    color: '#666',
  } as React.CSSProperties,
  
  uploadText: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  
  uploadHint: {
    fontSize: '14px',
    color: '#999',
    marginTop: '5px',
    fontFamily: 'monospace',
  } as React.CSSProperties,
  
  supportedFormats: {
    fontSize: '12px',
    color: '#888',
    textAlign: 'center' as const,
    lineHeight: '1.4',
  } as React.CSSProperties,
  
  previewSection: {
    marginBottom: '20px',
  } as React.CSSProperties,
  
  previewTitle: {
    fontSize: '16px',
    marginBottom: '10px',
    color: '#333',
  } as React.CSSProperties,
  
  previewVideo: {
    width: '100%',
    borderRadius: '8px',
    maxHeight: '400px',
    background: '#000',
  } as React.CSSProperties,
  
  inputSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  } as React.CSSProperties,
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  } as React.CSSProperties,
  
  inputLabel: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  
  required: {
    color: '#dc3545',
  } as React.CSSProperties,
  
  charCount: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: 'normal' as const,
  } as React.CSSProperties,
  
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    width: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    minHeight: '80px',
  } as React.CSSProperties,
  
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '30px',
  } as React.CSSProperties,
  
  cancelButton: {
    padding: '12px 24px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    minWidth: '100px',
  } as React.CSSProperties,
  
  uploadButton: {
    padding: '12px 24px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    minWidth: '150px',
    fontWeight: 'bold' as const,
  } as React.CSSProperties,
  
  infoPanel: {
    marginTop: '30px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  } as React.CSSProperties,
  
  infoTitle: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#333',
  } as React.CSSProperties,
  
  infoList: {
    marginLeft: '20px',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.8',
  } as React.CSSProperties,
};

export default VideoUploadPage;