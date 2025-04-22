import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../src/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveRefreshToken, getRefreshToken, removeRefreshToken } from '../src/utils/authStorage';

const ACCESS_TOKEN_KEY = 'accessToken';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token từ AsyncStorage khi app khởi động
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getRefreshToken();
        if (token) {
          await refreshAccessToken();
        }
      } catch (error) {
        console.error('Error loading token from storage:', error.message);
      } finally {
        setLoading(false); // Đảm bảo loading luôn tắt
      }
    };
    loadToken();
  }, []);
  

  // Đăng nhập
  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });

      const accessToken = res.data?.accessToken;
      const refreshToken = res.data?.refreshToken;

      if (!accessToken || !refreshToken) {
        console.error('⚠️ Thiếu token khi đăng nhập!');
        return false;
      }

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await saveRefreshToken(refreshToken);
      setAuthToken(accessToken);

      return true;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return false;
    }
  };

  // Đăng ký
  const register = async ({ name, email, username, password }) => {
    try {
      await api.post('/auth/register', { name, email, username, password });
      return true;
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      return false;
    }
  };

  // Đăng xuất
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await removeRefreshToken();
      setAuthToken(null);
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  // Làm mới accessToken
  const refreshAccessToken = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        logout();
        return;
      }

      const res = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken } = res.data;

      if (!accessToken) {
        console.error('⚠️ Không thể lấy access token mới!');
        logout();
        return;
      }

      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      setAuthToken(accessToken);
      return accessToken;
    } catch (err) {
      console.error('Refresh token error:', err.response?.data || err.message);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        login,
        logout,
        register,
        refreshAccessToken,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
