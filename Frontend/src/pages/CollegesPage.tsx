// src/pages/CollegesPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CollegesList from '../components/CollegesList';

const CollegesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="colleges-page">
      {/* Header */}
      <header className="colleges-header">
        <div className="container">
          <div className="header-content">
            <button 
              className="back-button"
              onClick={() => navigate('/')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2"/>
              </svg>
              На главную
            </button>
            
            <div className="header-title">
              <h1>База колледжей</h1>
              <p>Актуальная информация из государственного реестра</p>
            </div>
            
            <div className="header-actions">
              <button className="btn-filter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Фильтры
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input 
                type="text" 
                placeholder="Поиск колледжей по названию или адресу..."
                className="search-input"
              />
            </div>
            <button className="btn-search">
              Найти
            </button>
          </div>
          
          <div className="search-filters">
            <div className="filter-tags">
              <span className="filter-tag active">Все колледжи</span>
              <span className="filter-tag">Технические</span>
              <span className="filter-tag">Гуманитарные</span>
              <span className="filter-tag">Экономические</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="colleges-main">
        <CollegesList />
      </main>

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📊</div>
              <h3>Актуальные данные</h3>
              <p>Информация регулярно обновляется из официальных источников</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🔍</div>
              <h3>Подробная информация</h3>
              <p>Полные сведения о каждом образовательном учреждении</p>
            </div>
            
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h3>Помощь в выборе</h3>
              <p>Помогаем найти подходящий колледж по вашим критериям</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="colleges-footer">
        <div className="container">
          <div className="footer-content">
            <p>Нужна помощь в выборе? Звоните: +7 (XXX) XXX-XX-XX</p>
            <button className="btn-contact">
              Связаться с нами
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CollegesPage;