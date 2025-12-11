// src/components/SessionDebug.tsx
import React, { useState, useEffect } from 'react';

const SessionDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const checkSession = async () => {
    addLog('🔍 Проверка сессии...');
    
    // Собираем информацию о браузере
    const info: any = {
      cookies: document.cookie,
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Проверяем аутентификацию
    try {
      addLog('📡 Отправляем запрос на проверку авторизации...');
      
      const response = await fetch('http://localhost:8001/api/v2/profile/profile/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      info.authStatus = response.status;
      info.authOk = response.ok;
      
      if (response.ok) {
        const data = await response.json();
        info.userData = data.data;
        addLog(`✅ Авторизован как: ${data.data?.username}`);
      } else {
        addLog(`❌ Не авторизован, статус: ${response.status}`);
      }
    } catch (error: any) {
      info.authError = error.message;
      addLog(`🚨 Ошибка проверки: ${error.message}`);
    }

    // Проверяем куки CSRF
    const csrfToken = document.cookie.split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    info.csrfToken = csrfToken || 'не найден';
    info.hasCsrf = !!csrfToken;

    // Проверяем сессионную куку
    const sessionId = document.cookie.split('; ')
      .find(row => row.startsWith('sessionid='))
      ?.split('=')[1];
    
    info.sessionId = sessionId ? `${sessionId.substring(0, 10)}...` : 'не найден';
    info.hasSession = !!sessionId;

    setDebugInfo(info);
    addLog('✅ Диагностика завершена');
  };

  const clearSession = () => {
    addLog('🧹 Очистка сессии...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Удаляем куки
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    addLog('✅ Все данные очищены');
    checkSession();
  };

  const simulatePageChange = () => {
    addLog('🔄 Имитация смены страницы...');
    checkSession();
  };

  useEffect(() => {
    checkSession();
    
    // Проверяем сессию при изменении URL
    const handleUrlChange = () => {
      addLog(`📍 URL изменился: ${window.location.pathname}`);
      setTimeout(checkSession, 100);
    };
    
    window.addEventListener('popstate', handleUrlChange);
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🔧 Дебаг сессии</h3>
      
      <div style={styles.buttonGroup}>
        <button onClick={checkSession} style={styles.button}>
          🔍 Проверить сессию
        </button>
        <button onClick={clearSession} style={styles.button}>
          🧹 Очистить сессию
        </button>
        <button onClick={simulatePageChange} style={styles.button}>
          🔄 Имитация перехода
        </button>
      </div>

      <div style={styles.infoSection}>
        <h4>📊 Информация:</h4>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <strong>CSRF токен:</strong> 
            <span style={{ color: debugInfo.hasCsrf ? 'green' : 'red' }}>
              {debugInfo.hasCsrf ? '✓ Есть' : '✗ Нет'}
            </span>
          </div>
          <div style={styles.infoItem}>
            <strong>Сессия:</strong> 
            <span style={{ color: debugInfo.hasSession ? 'green' : 'red' }}>
              {debugInfo.hasSession ? '✓ Есть' : '✗ Нет'}
            </span>
          </div>
          <div style={styles.infoItem}>
            <strong>Авторизация:</strong> 
            <span style={{ color: debugInfo.authOk ? 'green' : 'red' }}>
              {debugInfo.authOk ? '✓ Авторизован' : `✗ ${debugInfo.authStatus || 'Нет'}`}
            </span>
          </div>
          <div style={styles.infoItem}>
            <strong>Пользователь:</strong> 
            <span>{debugInfo.userData?.username || 'Неизвестен'}</span>
          </div>
          <div style={styles.infoItem}>
            <strong>Куки:</strong> 
            <span>{debugInfo.cookies || 'Нет'}</span>
          </div>
        </div>
      </div>

      <div style={styles.logSection}>
        <h4>📝 Логи:</h4>
        <div style={styles.logs}>
          {logs.map((log, index) => (
            <div key={index} style={styles.logItem}>{log}</div>
          ))}
        </div>
      </div>

      <div style={styles.helpSection}>
        <h4>💡 Возможные проблемы:</h4>
        <ul style={styles.helpList}>
          <li>Разные порты в запросах (8000 vs 8001)</li>
          <li>Куки не отправляются (проверьте credentials: 'include')</li>
          <li>CORS блокирует куки</li>
          <li>Сессия истекла на сервере</li>
          <li>Проблема с CSRF токеном</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    background: '#f5f5f5',
    borderRadius: '10px',
    margin: '20px 0',
    border: '1px solid #ddd',
  },
  title: {
    marginTop: '0',
    color: '#333',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  button: {
    padding: '10px 20px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  infoSection: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '10px',
  },
  infoItem: {
    padding: '8px',
    background: '#f8f9fa',
    borderRadius: '4px',
  },
  logSection: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  logs: {
    maxHeight: '200px',
    overflowY: 'auto' as const,
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: '10px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  logItem: {
    marginBottom: '4px',
    padding: '2px 0',
    borderBottom: '1px solid #333',
  },
  helpSection: {
    background: '#fff3cd',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ffeaa7',
  },
  helpList: {
    margin: '10px 0 0 0',
    paddingLeft: '20px',
    color: '#856404',
  },
};

export default SessionDebug;