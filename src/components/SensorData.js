import React from 'react';
import './css/SensorData.css';

const SensorData = ({ sensorData, error }) => {
  if (error) {
    return (
      <div className="sensor-data-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>Veriler yüklenirken hata oluştu: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sensor-data-container">
      <div className="sensor-grid">
        <div className="sensor-card">
          <div className="sensor-icon">🔧</div>
          <div className="sensor-info">
            <div className="sensor-label">Motor</div>
            <div className={`sensor-value ${sensorData.motorStatus === 'Açık' ? 'active' : 'inactive'}`}>
              {sensorData.motorStatus}
            </div>
          </div>
        </div>
        
        <div className="sensor-card">
          <div className="sensor-icon">🌧️</div>
          <div className="sensor-info">
            <div className="sensor-label">Yağmur</div>
            <div className="sensor-value">{sensorData.rainLevel}</div>
          </div>
        </div>
        
        <div className="sensor-card">
          <div className="sensor-icon">🌡️</div>
          <div className="sensor-info">
            <div className="sensor-label">Sıcaklık</div>
            <div className="sensor-value">{sensorData.temperature}</div>
          </div>
        </div>
        
        <div className="sensor-card">
          <div className="sensor-icon">💧</div>
          <div className="sensor-info">
            <div className="sensor-label">Nem</div>
            <div className="sensor-value">{sensorData.humidity}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorData; 