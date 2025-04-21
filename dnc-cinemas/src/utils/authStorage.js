// utils/authStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'refreshToken';

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
