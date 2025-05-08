'use client';

import { AppBar, Toolbar, Typography } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          DNC Admin Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
