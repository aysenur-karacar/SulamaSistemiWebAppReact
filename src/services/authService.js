import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'https://sulamasistemiwebapi.online/api';

class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Token'ı localStorage'dan al
  getToken() {
    return localStorage.getItem('token');
  }

  // Token'ı localStorage'a kaydet
  setToken(token) {
    localStorage.setItem('token', token);
  }

  // Token'ı localStorage'dan sil
  removeToken() {
    localStorage.removeItem('token');
  }

  // Token'ın geçerli olup olmadığını kontrol et
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Token'ın süresi dolmuş mu kontrol et
      if (decoded.exp < currentTime) {
        this.removeToken();
        return false;
      }
      
      return true;
    } catch (error) {
      this.removeToken();
      return false;
    }
  }

  // Token'dan kullanıcı bilgilerini al
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return {
        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        exp: decoded.exp
      };
    } catch (error) {
      return null;
    }
  }

  // API isteği yap
  async makeRequest(endpoint, options = {}) {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    // Token varsa Authorization header'ına ekle
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // Silent error handling
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        return { success: true };
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        return { success: true, message: responseText };
      }
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcı kaydı - POST /api/Auth/register
  async register(userData) {
    const registerData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword
    };
    
    try {
      const response = await this.makeRequest('/Auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      
      // Eğer response'da token varsa, otomatik olarak login yap
      if (response.token) {
        this.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Kullanıcı girişi - POST /api/Auth/login
  async login(credentials) {
    const response = await this.makeRequest('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Login başarılıysa token'ı kaydet
    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  // Kullanıcı çıkışı
  logout() {
    this.removeToken();
  }

  // Kullanıcı profilini getir - GET /api/Auth/profile
  async getProfile() {
    return this.makeRequest('/Auth/profile');
  }

  // Kullanıcı bilgilerini güncelle
  async updateProfile(userData) {
    return this.makeRequest('/Auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Kullanıcının giriş yapmış olup olmadığını kontrol et
  isAuthenticated() {
    return !!this.getToken() && this.isTokenValid();
  }
}

// Singleton instance
const authService = new AuthService();
export default authService; 