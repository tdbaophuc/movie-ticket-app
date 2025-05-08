'use client';

import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import Link from 'next/link';

const drawerWidth = 240;

const menuItems = [
  { label: 'Phim', href: '/movies' },
  { label: 'Suất chiếu', href: '/showtimes' },
  { label: 'Người dùng', href: '/users' },
  { label: 'Đơn đặt vé', href: '/bookings' },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton key={item.href} component={Link} href={item.href}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
