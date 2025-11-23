// src/components/CollegesList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface College {
  id: number;
  name: string;
  address: string;
}

const CollegesList: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColleges = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/collegelist/');
      const data = response.data.data || response.data;
      setColleges(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке данных из API');
      setLoading(false);
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  if (loading) return (
    <div className="loading-section">
      <div className="loading-spinner"></div>
      <h3>Загружаем базу колледжей</h3>
      <p>Это займет всего несколько секунд...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-section">
      <div className="error-icon">⚠️</div>
      <h3>Не удалось загрузить данные</h3>
      <p>{error}</p>
      <button onClick={fetchColleges} className="btn-retry">
        Попробовать снова
      </button>
    </div>
  );

  return (
    <section className="colleges-list-section">
      <div className="container">
        <div className="list-header">
          <h2>Найдено колледжей: {colleges.length}</h2>
          <div className="sort-options">
            <select className="sort-select">
              <option>По названию</option>
              <option>По дате добавления</option>
            </select>
          </div>
        </div>

        <div className="colleges-list">
          {colleges.length > 0 ? (
            colleges.map((college, index) => (
              <div key={college.id} className="college-item">
                <div className="college-number">{String(index + 1).padStart(2, '0')}</div>
                
                <div className="college-content">
                  <div className="college-header">
                    <h3 className="college-name">{college.name}</h3>
                    <span className="college-badge">Государственный</span>
                  </div>
                  
                  <div className="college-info">
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.7764 3 12 3C8.22355 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>{college.address}</span>
                    </div>
                    
                    <div className="info-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 13.3132 21.7413 14.6136 21.2388 15.8268C20.7362 17.0401 19.9997 18.1425 19.0711 19.0711C18.1425 19.9997 17.0401 20.7362 15.8268 21.2388C14.6136 21.7413 13.3132 22 12 22C9.34784 22 6.8043 20.9464 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Пн-Пт: 9:00-18:00</span>
                    </div>
                  </div>
                  
                  <div className="college-actions">
                    <button className="btn-details">
                      Подробнее
                    </button>
                    <button className="btn-contact">
                      Контакты
                    </button>
                  </div>
                </div>
                
                <div className="college-id">ID: {college.id}</div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏫</div>
              <h3>Колледжи не найдены</h3>
              <p>В базе данных пока нет информации о колледжах</p>
              <button onClick={fetchColleges} className="btn-retry">
                Обновить данные
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CollegesList;