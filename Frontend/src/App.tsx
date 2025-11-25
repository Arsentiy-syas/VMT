import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CollegesPage from './pages/CollegesPage';
import RegistrationPage from './pages/RegistrationPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/colleges" element={<CollegesPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          {/* Резервный маршрут для старых ссылок */}
          <Route path="/api/v1/collegelist" element={<CollegesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;