// app/login/page.tsx
'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import api from '@/utils/api'; 

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        username,
        password,
      });
  
      const { accessToken, refreshToken, role } = res.data;
  
      if (role !== 'admin') {
        setError('Chỉ tài khoản admin mới được truy cập dashboard.');
        return;
      }
  
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);  // Lưu refresh token
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
  
      router.push('/movies');
      document.cookie = `accessToken=${accessToken}; path=/; max-age=3600`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=3600`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };
  

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>Đăng nhập Admin</Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Tên đăng nhập"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" fullWidth onClick={handleLogin}>Đăng nhập</Button>
      </Box>
    </Container>
  );
}
