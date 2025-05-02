// utils/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'refreshToken';
const ACCESS_TOKEN_KEY = 'accessToken';

export const saveRefreshToken = async (token) => {
  try {
    await AsyncStorage.setItem(KEY, token);
  } catch (e) {
    console.log('Lỗi khi lưu refreshToken:', e);
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch (e) {
    console.log('Lỗi khi lấy refreshToken:', e);
    return null;
  }
};

export const removeRefreshToken = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.log('Lỗi khi xoá refreshToken:', e);
  }
};

// Save accessToken
export const saveAccessToken = async (token) => {
  try {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (e) {
    console.log('Lỗi khi lưu accessToken:', e);
  }
};

// Get accessToken
export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.log('Lỗi khi lấy accessToken:', e);
    return null;
  }
};

// Remove accessToken
export const removeAccessToken = async () => {
  try {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    console.log('Lỗi khi xoá accessToken:', e);
  }
};
