// /src/utils/refreshToken.ts
import api from './api';

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await api.post('/auth/refresh-token', { refreshToken });
    const { accessToken } = res.data;

    localStorage.setItem('accessToken', accessToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900`; // 15p

    return accessToken;
  } catch (err) {
    console.error('Lỗi refresh token:', err);
    return null;
  }
};
