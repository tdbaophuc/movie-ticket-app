'use client';

import { useEffect, useState } from 'react';
import { Box, Button, MenuItem, Select, Typography, Modal, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password:'', status: 'active', role: 'admin' });

  const fetchUsers = async () => {
    try {
      const response = await api.get('user/admin/users'); 
      const userData = response.data.users.map((user: any) => ({
        ...user,
        id: user._id,
      }));
      setUsers(userData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu người dùng:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/auth/register', newUser); 
      fetchUsers();
      setOpen(false);
    } catch (error) {
      console.error('Lỗi tạo người dùng:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 250 },
    { field: 'name', headerName: 'Tên người dùng', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 200,
      renderCell: (params) => (
        <Select
          value={params.row.status || 'active'}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          fullWidth
          variant="standard"
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
          <MenuItem value="banned">Banned</MenuItem>
        </Select>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Danh sách người dùng
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
        Tạo tài khoản
      </Button>

      <DataGrid rows={users} columns={columns} pageSize={5} />

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            padding: 3,
            backgroundColor: 'white',
            width: 400,
            maxHeight: '90vh',
            overflow: 'auto',
            paddingBottom: 5,
            position: 'absolute',
            top: '50%',
            right: 100,
            transform: 'translateY(-50%)',
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tạo tài khoản mới
          </Typography>

          <TextField
            label="Tên người dùng"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="name"
            type="text"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />

          <Button variant="contained" onClick={handleCreateUser}>
            Tạo tài khoản
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
