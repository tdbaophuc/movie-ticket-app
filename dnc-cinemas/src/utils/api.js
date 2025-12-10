import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRefreshToken, removeRefreshToken } from '../utils/authStorage';

export const API_BASE_URL = 'http://192.168.1.85:5000/api'; 

const ACCESS_TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Gắn accessToken vào header mỗi request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('Không có refreshToken');

        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = res.data;

        if (!accessToken) throw new Error('Không nhận được accessToken mới');

        // Lưu accessToken mới vào AsyncStorage
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // Gắn lại token mới vào request gốc
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.log('Không thể refresh token:', refreshError.message);
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
        await removeRefreshToken();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
