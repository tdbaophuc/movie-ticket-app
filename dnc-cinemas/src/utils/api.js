import axios from 'axios';

export const API_BASE_URL = 'http://192.168.1.157:5000/api';  // Sử dụng địa chỉ IP của máy chủ

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,  // Thời gian timeout (5 giây)
});

export default api;
