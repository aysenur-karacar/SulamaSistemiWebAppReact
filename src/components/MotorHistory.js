import React, { useState, useEffect } from 'react';
import historyService from '../services/historyService';
import './css/History.css';

const MotorHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    period: null,
    limit: 30
  });

  const periodOptions = [
    { value: null, label: 'Tüm Zamanlar' },
    { value: '1h', label: 'Son 1 Saat' },
    { value: '6h', label: 'Son 6 Saat' },
    { value: '12h', label: 'Son 12 Saat' },
    { value: '1d', label: 'Son 1 Gün' },
    { value: '3d', label: 'Son 3 Gün' },
    { value: '1w', label: 'Son 1 Hafta' },
    { value: '1m', label: 'Son 1 Ay' }
  ];

  const limitOptions = [
    { value: 10, label: 'Son 10 Kayıt' },
    { value: 20, label: 'Son 20 Kayıt' },
    { value: 30, label: 'Son 30 Kayıt' },
    { value: 50, label: 'Son 50 Kayıt' },
    { value: 100, label: 'Son 100 Kayıt' },
    { value: 200, label: 'Son 200 Kayıt' },
    { value: 500, label: 'Son 500 Kayıt' }
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let params = {};
      
      if (filters.limit && filters.limit <= 50) {
        // Son N kayıt için sadece count parametresi kullan
        params = { count: filters.limit };
      } else {
        // Periyot veya büyük limit için normal parametreler
        params = { ...filters };
      }
      
      const response = await historyService.getMotorHistory(params);
      const chartData = historyService.prepareChartData(response, 'motor');
      setData(chartData);
    } catch (err) {
      setError(err.message);
      console.error('Motor geçmişi alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Eğer kayıt sayısı değiştiyse ve 50 veya altındaysa, periyodu sıfırla
      if (key === 'limit' && value <= 50) {
        newFilters.period = null;
      }
      // Eğer periyot değiştiyse ve kayıt sayısı 50 veya altındaysa, kayıt sayısını sıfırla
      else if (key === 'period' && prev.limit <= 50) {
        newFilters.limit = 100; // Varsayılan büyük değer
      }
      
      return newFilters;
    });
  };



  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>🔧 Motor Kontrol Geçmişi</h2>
        <div className="history-filters">
          <div className="filter-group">
            <label>Zaman Aralığı:</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Kayıt Sayısı:</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            >
              {limitOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button onClick={fetchData} className="refresh-button">
            🔄 Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {data.length === 0 && !loading && !error && (
        <div className="no-data">
          <span className="no-data-icon">🔧</span>
          <p>Bu zaman aralığında motor kontrol verisi bulunamadı</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="chart-container">
          <div className="motor-timeline">
            <div className="timeline-container">
              {data.map((item, index) => (
                <div key={index} className={`timeline-item ${item.isRunning ? 'running' : 'stopped'}`}>
                  <div className="timeline-content">
                    <div className="timeline-time">{item.time}</div>
                    <span className={`status-badge ${item.isRunning ? 'running' : 'stopped'}`}>
                      {item.isRunning ? 'Açık' : 'Kapalı'}
                    </span>
                    <div className="timeline-operator">
                      <strong>{item.operatedBy}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="data-summary">
          <div className="summary-item">
            <span className="summary-label">Toplam İşlem:</span>
            <span className="summary-value">{data.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Açık Durumda:</span>
            <span className="summary-value">
              {data.filter(item => item.isRunning === 1).length} kez
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Kapalı Durumda:</span>
            <span className="summary-value">
              {data.filter(item => item.isRunning === 0).length} kez
            </span>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="motor-operator-summary">
          <h3>Operatör Özeti</h3>
          <div className="operator-stats">
            {(() => {
              const operatorStats = {};
              data.forEach(item => {
                const operator = item.operatedBy;
                if (!operatorStats[operator]) {
                  operatorStats[operator] = { total: 0, on: 0, off: 0 };
                }
                operatorStats[operator].total++;
                if (item.isRunning === 1) {
                  operatorStats[operator].on++;
                } else {
                  operatorStats[operator].off++;
                }
              });

              return Object.entries(operatorStats).map(([operator, stats]) => (
                <div key={operator} className="operator-card">
                  <div className="operator-header">
                    <span className="operator-icon">👤</span>
                    <span className="operator-name">{operator}</span>
                  </div>
                  <div className="operator-details">
                    <div className="operator-stat">
                      <span className="stat-label">Toplam İşlem:</span>
                      <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="operator-stat">
                      <span className="stat-label">Açma:</span>
                      <span className="stat-value on">{stats.on}</span>
                    </div>
                    <div className="operator-stat">
                      <span className="stat-label">Kapatma:</span>
                      <span className="stat-value off">{stats.off}</span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MotorHistory; 