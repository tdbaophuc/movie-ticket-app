'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (typeof window === 'undefined') return;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      alert('Không tìm thấy token!');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/logout', { refreshToken });

      if (response.status === 200) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        document.cookie = 'accessToken=; path=/; max-age=0';
        document.cookie = 'refreshToken=; path=/; max-age=0';

        router.push('/login');
      }
    } catch (err) {
      alert('Đăng xuất thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={handleLogout}
      disabled={loading}
      sx={{ position: 'absolute', top: 20, right: 20 }}
    >
      {loading ? 'Đang đăng xuất...' : 'Đăng xuất'}
    </Button>
  );
}
