const API_BASE_URL = 'https://sulamasistemiwebapi.online/api/Device';

class ApiService {
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
          // Unauthorized - token geçersiz
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Response body'sini kontrol et
      const text = await response.text();
      
      // Boş response kontrolü
      if (!text || text.trim() === '') {
        return { success: true, message: 'İşlem başarılı' };
      }

      // JSON parse etmeye çalış
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('JSON parse error:', parseError, 'Response text:', text);
        return { success: true, message: 'İşlem başarılı' };
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }
  // Motor durumunu al
  async getMotorStatus() {
    return this.makeRequest('/motor');
  }
  // Motor durumunu değiştir
  async toggleMotor(operatedBy = null) {
    try {
      const currentStatus = await this.getMotorStatus();
      const newStatus = !currentStatus.isRunning;
      
      // Token'dan kullanıcı adını al
      let username = 'web_user';
      try {
        const token = this.getToken();
        if (token) {
          const { jwtDecode } = await import('jwt-decode');
          const decoded = jwtDecode(token);
          username = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'web_user';
        }
      } catch (error) {
        console.error('Token decode error:', error);
      }
      
      const response = await this.makeRequest(`/motor?operatedBy=${encodeURIComponent(operatedBy || username)}`, {
        method: 'POST',
        body: JSON.stringify(newStatus),
      });
      
      return response;
    } catch (error) {
      console.error('Motor toggle error:', error);
      throw new Error('Motor durumu değiştirilemedi. Lütfen tekrar deneyin.');
    }
  }
  // Sıcaklık ve nem verilerini al
  async getTemperatureHumidity() {
    return this.makeRequest('/temperature-humidity');
  }
  // Yağmur sensörü verilerini al
  async getRainLevel() {
    return this.makeRequest('/rain');
  }
  // Tüm sensör verilerini tek seferde al
  async getAllSensorData() {
    try {
      const [tempHumData, motorData, rainData] = await Promise.all([
        this.getTemperatureHumidity(),
        this.getMotorStatus(),
        this.getRainLevel(),
      ]);

      return {
        temperature: tempHumData.temperature,
        humidity: tempHumData.humidity,
        motorStatus: motorData.isRunning,
        rainLevel: rainData.rainLevel,
      };
    } catch (error) {
      console.error('Failed to fetch all sensor data:', error);
      throw error;
    }
  }
}

// Singleton instance
const apiService = new ApiService();
export default apiService; 