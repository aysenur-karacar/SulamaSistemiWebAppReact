import React from 'react';
import './css/Header.css';

const Header = () => {
  const currentTime = new Date().toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>Sulama Sistemi Kontrol Paneli</h1>
          <p className="subtitle">Akıllı Sulama Sistemi</p>
        </div>
        <div className="header-right">
          <div className="time-display">
            <span className="time-icon">🕐</span>
            <span className="time-text">{currentTime}</span>
          </div>
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>Sistem Aktif</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 