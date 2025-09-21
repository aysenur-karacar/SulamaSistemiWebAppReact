import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

export const useSensorData = (updateInterval = 2000) => {
  const [sensorData, setSensorData] = useState({
    motorStatus: 'Yükleniyor...',
    rainLevel: 'Yükleniyor...',
    temperature: 'Yükleniyor...',
    humidity: 'Yükleniyor...',
    isMotorRunning: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateSensorData = useCallback(async () => {
    try {
      setError(null);
      const data = await apiService.getAllSensorData();
      
      setSensorData({
        motorStatus: data.motorStatus ? "Açık" : "Kapalı",
        rainLevel: `${data.rainLevel}%`,
        temperature: `${data.temperature}°C`,
        humidity: `${data.humidity}%`,
        isMotorRunning: data.motorStatus,
      });
    } catch (err) {
      // JSON parse hatası ise geçici hata olarak kabul et
      if (err.message.includes('Unexpected end of JSON input') || 
          err.message.includes('JSON')) {
        console.warn('Geçici API hatası, tekrar deneniyor...');
        return; // Hatayı gösterme, sessizce geç
      }
      
      setError(err.message);
      console.error('Sensör verileri güncellenirken hata:', err);
      
      // Token geçersizse kullanıcıyı login'e yönlendir
      if (err.message.includes('Oturum süresi doldu')) {
        window.location.href = '/login';
      }
    }
  }, []);

  const toggleMotor = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await apiService.toggleMotor();
      
      // Kısa bir bekleme süresi ekle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await updateSensorData();
    } catch (err) {
      // JSON parse hatası ise geçici hata olarak kabul et
      if (err.message.includes('Unexpected end of JSON input') || 
          err.message.includes('JSON')) {
        console.warn('Motor kontrolü sırasında geçici hata, tekrar deneniyor...');
        // Hatayı gösterme, sadece verileri yenile
        setTimeout(() => updateSensorData(), 1000);
        return;
      }
      
      setError(err.message);
      console.error('Motor durumu değiştirilemedi:', err);
      
      // Token geçersizse kullanıcıyı login'e yönlendir
      if (err.message.includes('Oturum süresi doldu')) {
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, updateSensorData]);

  useEffect(() => {
    // İlk yükleme
    updateSensorData();
    
    // Periyodik güncelleme
    const interval = setInterval(updateSensorData, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateSensorData, updateInterval]);

  return {
    sensorData,
    isLoading,
    error,
    toggleMotor,
    refreshData: updateSensorData,
  };
}; 