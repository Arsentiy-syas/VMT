import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span>🎓 Волховский многопрофильный техникум</span>
            </div>
            <nav className="nav">
              <ul>
                <li><a href="#about">О техникуме</a></li>
                <li><a href="#specialties">Специальности</a></li>
                <li><a href="#news">Новости</a></li>
                <li><a href="#contact">Контакты</a></li>
              </ul>
            </nav>
            <div className="header-actions">
              <button className="btn btn-outline" onClick={() => window.location.href = '/login'}>
                Вход
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Профессиональное образование - успешное будущее</h1>
            <p className="hero-description">
              Государственное бюджетное профессиональное образовательное учреждение. 
              Готовим специалистов для современных отраслей экономики
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => window.location.href = '/specialties'}>
                Выбрать специальность
              </button>
              <button className="btn btn-secondary" onClick={() => window.location.href = '/about'}>
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about section">
        <div className="container">
          <h2 className="section-title">О нашем техникуме</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                Наш техникум - это современное образовательное учреждение, которое готовит 
                высококвалифицированных специалистов для различных отраслей экономики. 
                Мы сочетаем традиции качественного образования с инновационными подходами к обучению.
              </p>
              
              <div className="features">
                <div className="feature">
                  <h3>🎯 Практико-ориентированное обучение</h3>
                  <p>70% учебного времени посвящено практическим занятиям</p>
                </div>
                <div className="feature">
                  <h3>🤝 Партнерства с предприятиями</h3>
                  <p>Сотрудничаем с ведущими компаниями региона</p>
                </div>
                <div className="feature">
                  <h3>💼 Гарантированное трудоустройство</h3>
                  <p>95% выпускников трудоустраиваются по специальности</p>
                </div>
              </div>

              <div className="stats">
                <div className="stat-item">
                  <h3>500+</h3>
                  <p>Студентов</p>
                </div>
                <div className="stat-item">
                  <h3>15+</h3>
                  <p>Специальностей</p>
                </div>
                <div className="stat-item">
                  <h3>95%</h3>
                  <p>Трудоустройство</p>
                </div>
                <div className="stat-item">
                  <h3>25+</h3>
                  <p>Преподавателей</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="specialties section">
        <div className="container">
          <h2 className="section-title">Наши специальности</h2>
          <div className="specialties-grid">
            <div className="specialty-card">
              <h3>💻 Информационные системы и программирование</h3>
              <p>Подготовка специалистов в области IT и разработки ПО. Изучение современных языков программирования и технологий.</p>
              <div className="specialty-meta">
                <span className="duration">3 года 10 месяцев</span>
                <span className="budget-places">25 бюджетных мест</span>
              </div>
              <button className="btn btn-outline" onClick={() => window.location.href = '/specialties/it'}>
                Подробнее
              </button>
            </div>

            <div className="specialty-card">
              <h3>🔧 Компьютерные системы и комплексы</h3>
              <p>Обслуживание и ремонт компьютерной техники, настройка оборудования и периферийных устройств.</p>
              <div className="specialty-meta">
                <span className="duration">2 года 10 месяцев</span>
                <span className="budget-places">20 бюджетных мест</span>
              </div>
              <button className="btn btn-outline" onClick={() => window.location.href = '/specialties/computers'}>
                Подробнее
              </button>
            </div>

            <div className="specialty-card">
              <h3>🌐 Сетевое и системное администрирование</h3>
              <p>Настройка и обслуживание компьютерных сетей, обеспечение информационной безопасности.</p>
              <div className="specialty-meta">
                <span className="duration">3 года 10 месяцев</span>
                <span className="budget-places">20 бюджетных мест</span>
              </div>
              <button className="btn btn-outline" onClick={() => window.location.href = '/specialties/networks'}>
                Подробнее
              </button>
            </div>

            <div className="specialty-card">
              <h3>📊 Экономика и бухгалтерский учет</h3>
              <p>Подготовка бухгалтеров и экономистов для предприятий различных форм собственности.</p>
              <div className="specialty-meta">
                <span className="duration">2 года 10 месяцев</span>
                <span className="budget-places">30 бюджетных мест</span>
              </div>
              <button className="btn btn-outline" onClick={() => window.location.href = '/specialties/economics'}>
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="news section">
        <div className="container">
          <h2 className="section-title">Последние новости</h2>
          <div className="news-grid">
            <article className="news-card">
              <div className="news-image">
                <div className="image-placeholder">📰</div>
              </div>
              <div className="news-content">
                <span className="news-date">15 декабря 2024</span>
                <h3>День открытых дверей</h3>
                <p>Приглашаем абитуриентов и родителей на день открытых дверей. Знакомство с преподавателями, экскурсия по аудиториям.</p>
                <button className="read-more" onClick={() => window.location.href = '/news/open-doors-2024'}>
                  Читать далее →
                </button>
              </div>
            </article>

            <article className="news-card">
              <div className="news-image">
                <div className="image-placeholder">🔬</div>
              </div>
              <div className="news-content">
                <span className="news-date">10 декабря 2024</span>
                <h3>Новые лаборатории</h3>
                <p>Открытие современных компьютерных лабораторий, оснащенных последними моделями техники для практических занятий.</p>
                <button className="read-more" onClick={() => window.location.href = '/news/new-labs'}>
                  Читать далее →
                </button>
              </div>
            </article>

            <article className="news-card">
              <div className="news-image">
                <div className="image-placeholder">🏆</div>
              </div>
              <div className="news-content">
                <span className="news-date">5 декабря 2024</span>
                <h3>Спартакиада</h3>
                <p>Студенты техникума заняли призовые места в городской спартакиаде среди профессиональных образовательных учреждений.</p>
                <button className="read-more" onClick={() => window.location.href = '/news/sport-achievements'}>
                  Читать далее →
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🎓 Техникум</h3>
              <p>Профессиональное образование для успешного будущего. Готовим специалистов с 1995 года.</p>
              <div className="social-links">
                <button onClick={() => window.location.href = 'https://vk.com'}>VK</button>
                <button onClick={() => window.location.href = 'https://telegram.org'}>TG</button>
                <button onClick={() => window.location.href = 'https://youtube.com'}>YT</button>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Контакты</h4>
              <p>📞 +7 (XXX) XXX-XX-XX</p>
              <p>✉️ info@technikum.ru</p>
              <p>📍 г. Город, ул. Центральная, д. 123</p>
            </div>
            
            <div className="footer-section">
              <h4>Приемная комиссия</h4>
              <p>🕒 Пн-Пт: 9:00-18:00</p>
              <p>🕒 Сб: 10:00-15:00</p>
              <p>📞 +7 (XXX) XXX-XX-XX</p>
            </div>
            
            <div className="footer-section">
              <h4>Быстрые ссылки</h4>
              <ul>
                <li><button onClick={() => window.location.href = '/about'}>О техникуме</button></li>
                <li><button onClick={() => window.location.href = '/specialties'}>Специальности</button></li>
                <li><button onClick={() => window.location.href = '/news'}>Новости</button></li>
                <li><button onClick={() => window.location.href = '/contacts'}>Контакты</button></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Техникум. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;