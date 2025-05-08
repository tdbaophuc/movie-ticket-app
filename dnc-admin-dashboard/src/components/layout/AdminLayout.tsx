'use client';

import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import LogoutButton from '@/components/LogoutButton'; // 👉 import nút Logout đã tách
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Header />

        <LogoutButton />

        <Box sx={{ padding: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
