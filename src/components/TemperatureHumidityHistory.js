import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import historyService from '../services/historyService';
import './css/History.css';

const TemperatureHumidityHistory = () => {
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
      
      const response = await historyService.getTemperatureHumidityHistory(params);
      const chartData = historyService.prepareChartData(response, 'temperature');
      setData(chartData);
    } catch (err) {
      setError(err.message);
      console.error('Sıcaklık/Nem geçmişi alınamadı:', err);
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{label}</p>
          <p className="tooltip-temperature">
            Sıcaklık: <span style={{ color: '#ff7300' }}>{payload[0].value}°C</span>
          </p>
          <p className="tooltip-humidity">
            Nem: <span style={{ color: '#0088fe' }}>{payload[1].value}%</span>
          </p>
        </div>
      );
    }
    return null;
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
        <h2>🌡️ Sıcaklık ve Nem Geçmişi</h2>
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
          <span className="no-data-icon">📊</span>
          <p>Bu zaman aralığında veri bulunamadı</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#ff7300"
                fill="#ff7300"
                fillOpacity={0.3}
                name="Sıcaklık (°C)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#0088fe"
                fill="#0088fe"
                fillOpacity={0.3}
                name="Nem (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.length > 0 && (
        <div className="data-summary">
          <div className="summary-item">
            <span className="summary-label">Ortalama Sıcaklık:</span>
            <span className="summary-value">
              {(data.reduce((sum, item) => sum + item.temperature, 0) / data.length).toFixed(1)}°C
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Ortalama Nem:</span>
            <span className="summary-value">
              {(data.reduce((sum, item) => sum + item.humidity, 0) / data.length).toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Toplam Kayıt:</span>
            <span className="summary-value">{data.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemperatureHumidityHistory; 