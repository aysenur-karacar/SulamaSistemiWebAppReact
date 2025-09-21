import React from 'react';
import './css/MotorControl.css';

const MotorControl = ({ isMotorRunning, isLoading, onToggleMotor }) => {
  return (
    <div className="panel motor-control-panel">
      <h2>Motor Kontrol</h2>
      <div className="motor-control-content">
        <button 
          className={`motor-button ${isMotorRunning ? 'off' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={onToggleMotor}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Yükleniyor...
            </>
          ) : (
            isMotorRunning ? 'Motoru Kapat' : 'Motoru Aç'
          )}
        </button>
        
        <div className="motor-status-indicator">
          <div className={`status-dot ${isMotorRunning ? 'active' : 'inactive'}`}></div>
          <span className="status-text">
            Motor {isMotorRunning ? 'Çalışıyor' : 'Durdu'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MotorControl; 