import api from './api';

export const apiRequest = async (url: string, method: string, data?: any) => {
  const res = await api({
    url,
    method,
    data,
  });

  return res.data;
};
