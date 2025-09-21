import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde token kontrolü yap
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isTokenValid()) {
          // Token geçerliyse kullanıcı bilgilerini al
          const userData = authService.getUserFromToken();
          if (userData) {
            setUser(userData);
          } else {
            // Token'dan kullanıcı bilgisi alınamazsa profil bilgilerini çek
            try {
              const profile = await authService.getProfile();
              setUser({
                username: profile.username,
                email: profile.email,
                expiresAt: profile.expiresAt
              });
            } catch (profileError) {
              console.error('Profile fetch error:', profileError);
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Kullanıcı kaydı
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register(userData);
      
      // Eğer kayıt başarılı ve token varsa, kullanıcıyı otomatik login yap
      if (response.token) {
        setUser({
          username: response.username,
          email: response.email,
          expiresAt: response.expiresAt
        });
        console.log('User automatically logged in after registration');
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı girişi
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.token) {
        // Backend'den gelen kullanıcı bilgilerini kullan
        setUser({
          username: response.username,
          email: response.email,
          expiresAt: response.expiresAt
        });
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı çıkışı
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  // Kullanıcı profilini getir
  const getProfile = async () => {
    try {
      setError(null);
      const profile = await authService.getProfile();
      return profile;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Kullanıcı bilgilerini güncelle
  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.updateProfile(userData);
      
      // Kullanıcı bilgilerini güncelle
      if (response) {
        const updatedUser = authService.getUserFromToken();
        setUser(updatedUser);
      }
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcının giriş yapmış olup olmadığını kontrol et
  const isAuthenticated = () => {
    return authService.isTokenValid() && user !== null;
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 