// utils/plainApi.ts
import axios from 'axios';
import { API_BASE_URL } from './api'; 

const plainApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export default plainApi;
