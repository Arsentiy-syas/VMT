// src/pages/Home.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Navigation Header */}
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

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🎯 Будущее начинается здесь</span>
            </div>
            <h1 className="hero-title">
              Профессиональное 
              <span className="highlight"> образование</span> 
              — успешное будущее
            </h1>
            <p className="hero-description">
              Государственное бюджетное профессиональное образовательное учреждение. 
              Готовим специалистов для современных отраслей экономики с 1995 года
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => navigate('/colleges')}>
                <span>Список колледжей</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="btn-hero-secondary">
                <span>Подать заявку</span>
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Студентов</div>
              </div>
              <div className="stat">
                <div className="stat-number">95%</div>
                <div className="stat-label">Трудоустройство</div>
              </div>
              <div className="stat">
                <div className="stat-number">25+</div>
                <div className="stat-label">Преподавателей</div>
              </div>
              <div className="stat">
                <div className="stat-number">15+</div>
                <div className="stat-label">Программ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Почему выбирают нас</h2>
            <p>Современный подход к образованию с заботой о будущем каждого студента</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Трудоустройство</h3>
              <p>95% наших выпускников находят работу по специальности в течение 3 месяцев</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Практика</h3>
              <p>70% учебного времени — практические занятия на современном оборудовании</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Партнерства</h3>
              <p>Сотрудничаем с 50+ ведущими компаниями региона</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Подход</h3>
              <p>Индивидуальная траектория обучения для каждого студента</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="programs">
        <div className="container">
          <div className="section-header">
            <h2>Популярные направления</h2>
            <p>Актуальные специальности для успешного старта карьеры</p>
          </div>
          
          <div className="programs-grid">
            <div className="program-card">
              <div className="program-icon">💻</div>
              <h3>IT & Программирование</h3>
              <p>Разработка ПО, веб-технологии, кибербезопасность</p>
              <div className="program-meta">
                <span>3 года 10 мес</span>
                <span className="budget">25 бюджетных мест</span>
              </div>
            </div>
            
            <div className="program-card">
              <div className="program-icon">🌐</div>
              <h3>Сетевые технологии</h3>
              <p>Администрирование сетей, облачные технологии</p>
              <div className="program-meta">
                <span>3 года 10 мес</span>
                <span className="budget">20 бюджетных мест</span>
              </div>
            </div>
            
            <div className="program-card">
              <div className="program-icon">📊</div>
              <h3>Экономика</h3>
              <p>Бухгалтерия, финансы, бизнес-аналитика</p>
              <div className="program-meta">
                <span>2 года 10 мес</span>
                <span className="budget">30 бюджетных мест</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Готовы начать карьеру?</h2>
            <p>Присоединяйтесь к тысячам успешных выпускников</p>
            <div className="cta-actions">
              <button className="btn-cta-primary" onClick={() => navigate('/colleges')}>
                Посмотреть колледжи
              </button>
              <button className="btn-cta-secondary">
                Записаться на консультацию
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-icon">🎓</span>
                <span>Волховский техникум</span>
              </div>
              <p>Профессиональное образование для успешного будущего с 1995 года</p>
            </div>
            
            <div className="footer-section">
              <h4>Контакты</h4>
              <p>📞 +7 (XXX) XXX-XX-XX</p>
              <p>✉️ info@volkhov-tech.ru</p>
              <p>📍 г. Волхов, ул. Школьная, д. 15</p>
            </div>
            
            <div className="footer-section">
              <h4>Приемная комиссия</h4>
              <p>🕒 Пн-Пт: 9:00-18:00</p>
              <p>🕒 Сб: 10:00-15:00</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Волховский многопрофильный техникум. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;