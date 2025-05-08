'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api'; // Import API instance

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Tên người dùng', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  { field: 'role', headerName: 'Vai trò', width: 180 },
  { field: 'action', headerName: 'Hành động', width: 180, renderCell: (params) => (
    <>
      <Button variant="contained" color="primary" onClick={() => handleEdit(params.row)}>
        Sửa
      </Button>
      <Button variant="contained" color="secondary" onClick={() => handleDelete(params.row.id)}>
        Xóa
      </Button>
    </>
  )}
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({});
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users'); // Lấy danh sách người dùng
        setUsers(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user: any) => {
    setCurrentUser(user);
    setOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`); // Xóa người dùng theo ID
      setUsers(users.filter((user) => user.id !== userId)); // Cập nhật lại danh sách
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      const response = currentUser.id
        ? await api.put(`/users/${currentUser.id}`, currentUser) // Cập nhật thông tin người dùng
        : await api.post('/users', currentUser); // Thêm người dùng mới

      setUsers(users.map((user) => (user.id === response.data.id ? response.data : user)));
      setOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu thông tin người dùng:', error);
    }
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={users} columns={columns} pageSize={5} />
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ padding: 3, backgroundColor: 'white', width: 400, margin: 'auto', marginTop: '20%' }}>
          <Typography variant="h6">{currentUser.id ? 'Sửa người dùng' : 'Thêm người dùng'}</Typography>
          <TextField
            label="Tên người dùng"
            fullWidth
            value={currentUser.name || ''}
            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Email"
            fullWidth
            value={currentUser.email || ''}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Vai trò"
            fullWidth
            value={currentUser.role || ''}
            onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </Box>
      </Modal>
    </Box>
  );
}
