'use client';

import { useEffect, useState } from 'react';
import { Box, Button, MenuItem, Select, Typography, Modal, TextField } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username:'', email: '', password:'', status: 'active', role: 'admin' });
  const currentAdminId = typeof window !== 'undefined' ? localStorage.getItem('adminId') : null;


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
      await api.put(`/user/${userId}`, { status: newStatus });
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
  { field: 'username', headerName: 'Tên đăng nhập', width: 150 },
  { field: 'name', headerName: 'Tên người dùng', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 200,
    renderCell: (params) => {
      const isSelf = params.row.id === currentAdminId;
      const statusValue = params.row.status;

      const statusIcon = {
        active: <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />,
        inactive: <RemoveCircleIcon sx={{ color: 'orange', mr: 1 }} />,
        banned: <BlockIcon sx={{ color: 'red', mr: 1 }} />,
      };

      return (
        <Select
          value={statusValue}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          fullWidth
          variant="standard"
          disabled={isSelf}
          sx={{
            fontWeight: 'bold',
            color:
              statusValue === 'active'
                ? 'green'
                : statusValue === 'inactive'
                ? 'orange'
                : 'red',
            '& .MuiSelect-icon': {
              color: '#888',
            },
          }}
        >
          <MenuItem value="active">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {statusIcon.active} Active
            </Box>
          </MenuItem>
          <MenuItem value="inactive">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {statusIcon.inactive} Inactive
            </Box>
          </MenuItem>
          <MenuItem value="banned">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {statusIcon.banned} Banned
            </Box>
          </MenuItem>
        </Select>
      );
    },
  },
];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Danh sách người dùng
      </Typography>
      <Button variant="contained"
  color="primary"
  startIcon={<AddIcon />}
  sx={{ mb: 2, borderRadius: 2, textTransform: 'none', boxShadow: 2 }} onClick={() => setOpen(true)}>
        Tạo tài khoản quản trị
      </Button>
      <Box sx={{ height: 600 }}>
      <DataGrid rows={users} columns={columns} pageSize={7} sx={{
      bgcolor: '#fff',
      borderRadius: 3,
      boxShadow: 4,
      overflowX: 'hidden',
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        fontSize: 16,
      },
      '& .MuiDataGrid-cell': {
        padding: 1,
        fontSize: 14,
      },
      '& .MuiDataGrid-row:hover': {
        backgroundColor: '#e3f2fd',
        cursor: 'pointer'
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 'bold',
      },
      '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      }
      
      
    }}/>
    </Box>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
           p: 3,
    bgcolor: 'background.paper',
    width: 450,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 3,
    boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tạo tài khoản quản trị
          </Typography>
            <TextField
            label="Tên người dùng"
            type="text"
            fullWidth
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ marginBottom: 2 }}
          />

          <TextField
            label="Tên đăng nhập"
            fullWidth
            value={newUser.username}
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
        

          <Button variant="contained"
  fullWidth
  sx={{
    mt: 2,
    borderRadius: 2,
    textTransform: 'none',
    backgroundColor: '#1976d2',
    '&:hover': { backgroundColor: '#1565c0' }
  }} onClick={handleCreateUser}>
            Tạo tài khoản
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
