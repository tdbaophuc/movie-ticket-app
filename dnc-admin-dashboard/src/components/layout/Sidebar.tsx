'use client';

import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

const drawerWidth = 240;

const menuItems = [
  { label: 'Quản lý Phim', href: '/movies' },
  { label: 'Quản lý Suất chiếu', href: '/showtimes' },
  { label: 'Quản lý Phòng chiếu', href: '/rooms' },
  { label: 'Quản lý Vé đặt', href: '/bookings' },
  { label: 'Quản lý Người dùng', href: '/users' },
  { label: 'Thống kê', href: '/statistics' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1e293b',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
      
          
        },
      }}
    >
      <Toolbar sx={{ justifyContent: 'center', paddingY: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Image src="/icon-logo-DNC.png" alt="Logo" width={64} height={64}/>
          <Typography variant="h6" fontWeight="bold" noWrap>
            DNC Admin
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ flexGrow: 1 }}>
        <List>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: isActive ? '#fff' : '#cbd5e1',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? '#2563eb'
                      : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Toolbar sx={{ justifyContent: 'center', paddingY: 2, marginBottom: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LogoutButton />
        </Box>
      </Toolbar>    
      
    </Drawer>
  );
}
