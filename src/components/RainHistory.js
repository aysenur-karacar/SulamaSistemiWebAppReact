import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import historyService from '../services/historyService';
import './css/History.css';

const RainHistory = () => {
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
        params = { count: filters.limit };
      } else {
        params = { ...filters };
      }

      const response = await historyService.getRainHistory(params);
      const chartData = historyService.prepareChartData(response, 'rain');
      
      // Veri kontrolü ve düzeltme
      console.log('Ham yağmur verileri:', response);
      console.log('İşlenmiş yağmur verileri:', chartData);
      
      // Her veri noktasına benzersiz ID ekle
      const processedData = chartData.map((item, index) => ({
        ...item,
        id: index,
        rainLevel: parseFloat(item.rainLevel) || 0
      }));
      
      console.log('Son işlenmiş veriler:', processedData);
      setData(processedData);
    } catch (err) {
      setError(err.message);
      console.error('Yağmur geçmişi alınamadı:', err);
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

      if (key === 'limit' && value <= 50) {
        newFilters.period = null;
      } else if (key === 'period' && prev.limit <= 50) {
        newFilters.limit = 100;
      }

      return newFilters;
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const rainLevel = payload[0].value;
      const dataIndex = payload[0].payload.id;
      const timeLabel = data[dataIndex]?.time || label;
      
      let rainStatus = '';
      let statusColor = '';

      if (rainLevel > 70) {
        rainStatus = 'Şiddetli Yağmur';
        statusColor = '#dc3545';
      } else if (rainLevel > 50) {
        rainStatus = 'Orta Yağmur';
        statusColor = '#fd7e14';
      } else if (rainLevel > 20) {
        rainStatus = 'Hafif Yağmur';
        statusColor = '#ffc107';
      } else {
        rainStatus = 'Kuru';
        statusColor = '#28a745';
      }

      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{timeLabel}</p>
          <p className="tooltip-rain">
            Yağmur Seviyesi: <span style={{ color: '#0088fe' }}>{rainLevel}%</span>
          </p>
          <p className="tooltip-status">
            Durum: <span style={{ color: statusColor }}>{rainStatus}</span>
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
        <h2>🌧️ Yağmur Sensörü Geçmişi</h2>
        <div className="history-filters">
          <div className="filter-group">
            <label>Zaman Aralığı:</label>
            <select
              value={filters.period || ''}
              onChange={(e) => handleFilterChange('period', e.target.value === '' ? null : e.target.value)}
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value || ''}>
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
          <span className="no-data-icon">🌧️</span>
          <p>Bu zaman aralığında yağmur verisi bulunamadı</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="id"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tickFormatter={(value) => data[value]?.time || value}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="rainLevel"
                fill="#0088fe"
                name="Yağmur Seviyesi (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.length > 0 && (
        <div className="data-summary">
          <div className="summary-item">
            <span className="summary-label">Ortalama Yağmur Seviyesi:</span>
            <span className="summary-value">
              {(data.reduce((sum, item) => sum + item.rainLevel, 0) / data.length).toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Maksimum Yağmur:</span>
            <span className="summary-value">
              {Math.max(...data.map(item => item.rainLevel))}%
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Toplam Kayıt:</span>
            <span className="summary-value">{data.length}</span>
          </div>
        </div>
      )}

      {data.length > 0 && (
        <div className="rain-status-summary">
          <h3>Yağmur Durumu Özeti</h3>
          <div className="status-grid">
            <div className="status-card dry">
              <span className="status-icon">☀️</span>
              <span className="status-label">Kuru (0-20%)</span>
              <span className="status-count">
                {data.filter(item => item.rainLevel <= 20).length} kayıt
              </span>
            </div>
            <div className="status-card light">
              <span className="status-icon">🌦️</span>
              <span className="status-label">Hafif Yağmur (21-50%)</span>
              <span className="status-count">
                {data.filter(item => item.rainLevel > 20 && item.rainLevel <= 50).length} kayıt
              </span>
            </div>
            <div className="status-card moderate">
              <span className="status-icon">🌧️</span>
              <span className="status-label">Orta Yağmur (51-70%)</span>
              <span className="status-count">
                {data.filter(item => item.rainLevel > 50 && item.rainLevel <= 70).length} kayıt
              </span>
            </div>
            <div className="status-card heavy">
              <span className="status-icon">⛈️</span>
              <span className="status-label">Şiddetli Yağmur (71-100%)</span>
              <span className="status-count">
                {data.filter(item => item.rainLevel > 70).length} kayıt
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RainHistory; 