import { format } from 'date-fns';

const API_BASE_URL = 'https://sulamasistemiwebapi.online/api/Device';

class HistoryService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  // Token'ı localStorage'dan al
  getToken() {
    return localStorage.getItem('token');
  }
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = this.getToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Token varsa Authorization header'ına ekle
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers,
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      if (!text || text.trim() === '') {
        return [];
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('JSON parse error:', parseError, 'Response text:', text);
        return [];
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }
  // Sıcaklık ve nem geçmişi
  async getTemperatureHumidityHistory(params = {}) {
    const { from, to, limit, period, count } = params;
    let endpoint = '/temperature-humidity/history';

    if (period) {
      endpoint = `/temperature-humidity/period/${period}`;
    } else if (count) {
      endpoint = `/temperature-humidity/count/${count}`;
    } else {
      const queryParams = new URLSearchParams();
      if (from) queryParams.append('from', from);
      if (to) queryParams.append('to', to);
      if (limit) queryParams.append('limit', limit);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }

    return this.makeRequest(endpoint);
  }
  // Motor geçmişi
  async getMotorHistory(params = {}) {
    const { from, to, limit, period, count } = params;
    let endpoint = '/motor/history';

    if (period) {
      endpoint = `/motor/period/${period}`;
    } else if (count) {
      endpoint = `/motor/count/${count}`;
    } else {
      const queryParams = new URLSearchParams();
      if (from) queryParams.append('from', from);
      if (to) queryParams.append('to', to);
      if (limit) queryParams.append('limit', limit);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }

    return this.makeRequest(endpoint);
  }
  // Yağmur sensörü geçmişi
  async getRainHistory(params = {}) {
    const { from, to, limit, period, count } = params;
    let endpoint = '/rain/history';

    if (period) {
      endpoint = `/rain/period/${period}`;
    } else if (count) {
      endpoint = `/rain/count/${count}`;
    } else {
      const queryParams = new URLSearchParams();
      if (from) queryParams.append('from', from);
      if (to) queryParams.append('to', to);
      if (limit) queryParams.append('limit', limit);
      
      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`;
      }
    }

    return this.makeRequest(endpoint);
  }
  // Tarih formatını düzenle
  formatDate(dateString) {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return dateString;
    }
  }
  // Grafik için veri hazırlama
  prepareChartData(data, type) {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      const base = {
        time: this.formatDate(item.createdAt || item.lastStatusChange),
        timestamp: new Date(item.createdAt || item.lastStatusChange).getTime()
      };

      switch (type) {
        case 'temperature':
          return {
            ...base,
            temperature: item.temperature,
            humidity: item.humidity
          };
        case 'motor':
          return {
            ...base,
            isRunning: item.isRunning ? 1 : 0,
            status: item.isRunning ? 'Açık' : 'Kapalı',
            operatedBy: item.lastOperationBy || 'Sistem'
          };
        case 'rain':
          return {
            ...base,
            rainLevel: parseFloat(item.rainLevel) || 0
          };
        default:
          return base;
      }
    }).sort((a, b) => a.timestamp - b.timestamp);
  }
}

// Singleton instance
const historyService = new HistoryService();
export default historyService; 