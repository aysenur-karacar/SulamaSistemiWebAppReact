import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MotorControl from './MotorControl';
import SensorData from './SensorData';
import TemperatureHumidityHistory from './TemperatureHumidityHistory';
import RainHistory from './RainHistory';
import MotorHistory from './MotorHistory';
import { useSensorData } from '../hooks/useSensorData';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { sensorData, isLoading, error, toggleMotor } = useSensorData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // URL state'inden mesajı al
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
      // 5 saniye sonra mesajı kaldır
      setTimeout(() => setWelcomeMessage(''), 5000);
    }
  }, [location.state]);

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <MotorControl 
              isMotorRunning={sensorData.isMotorRunning}
              isLoading={isLoading}
              onToggleMotor={toggleMotor}
            />
            
            <SensorData 
              sensorData={sensorData}
              error={error}
            />
          </>
        );
      case 'temperature':
        return <TemperatureHumidityHistory />;
      case 'rain':
        return <RainHistory />;
      case 'motor':
        return <MotorHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header />
      
      <div className="main-content">
        {welcomeMessage && (
          <div className="welcome-message" style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: '10px 15px',
            margin: '10px 0',
            borderRadius: '5px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            {welcomeMessage}
          </div>
        )}
        
        <div className="user-info">
          <div className="user-details">
            <div className="user-info-left">
              <span>Hoş geldiniz, <strong>{user?.username}</strong></span>
              {user?.email && <span className="user-email">{user.email}</span>}
            </div>
            <button onClick={handleLogout} className="logout-button">
              Çıkış Yap
            </button>
          </div>
        </div>

        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'temperature' ? 'active' : ''}`}
            onClick={() => setActiveTab('temperature')}
          >
            🌡️ Sıcaklık/Nem
          </button>
          <button 
            className={`tab-button ${activeTab === 'rain' ? 'active' : ''}`}
            onClick={() => setActiveTab('rain')}
          >
            🌧️ Yağmur
          </button>
          <button 
            className={`tab-button ${activeTab === 'motor' ? 'active' : ''}`}
            onClick={() => setActiveTab('motor')}
          >
            🔧 Motor
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard; 