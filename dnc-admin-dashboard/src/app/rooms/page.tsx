'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api';
import AddIcon from '@mui/icons-material/Add';

interface Room {
  id: string;
  name: string;
  capacity: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      const mapped = res.data.map((room: any) => ({
        id: room._id,
        name: room.name,
        capacity: room.capacity,
        location: room.location,
      }));
      setRooms(mapped);
    } catch (err) {
      console.error('Lỗi lấy danh sách phòng:', err);
    }
  };

  const handleOpenAdd = () => {
    setCurrentRoom({ name: '', capacity: 0 });
    setIsEdit(false);
    setOpen(true);
  };

  const handleEdit = (room: Room) => {
    setCurrentRoom(room);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá phòng này?')) {
      try {
        await api.delete(`/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.error('Lỗi xoá phòng:', err);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (isEdit && currentRoom.id) {
        await api.put(`/rooms/${currentRoom.id}`, currentRoom);
      } else {
        await api.post('/rooms', currentRoom);
      }
      fetchRooms();
      setOpen(false);
    } catch (err) {
      console.error('Lỗi lưu phòng:', err);
    }
  };

  const handleClose = () => setOpen(false);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 300 },
    { field: 'name', headerName: 'Tên phòng', width: 250 },
    { field: 'capacity', headerName: 'Sức chứa', width: 150 },
    { field: 'location', headerName: 'Vị trí', width: 200 },
    {
      field: 'actions',
      headerName: 'Hành động',
      width: 180,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
  color="info"
  size="small"
  sx={{
    mr: 1,
    borderRadius: 2,
    textTransform: 'none',
    boxShadow: 1,
    '&:hover': { backgroundColor: '#0288d1' }
  }}
            onClick={() => handleEdit(params.row)}
          >
            Cập nhật
          </Button>
          <Button
            variant="outlined"
  color="error"
  size="small"
  sx={{
    borderRadius: 2,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#ffebee' }
  }}
            onClick={() => handleDelete(params.row.id)}
          >
            Gỡ bỏ
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Quản lý phòng chiếu
      </Typography>
      <Button variant="contained"
  color="primary"
  startIcon={<AddIcon />}
  sx={{ mb: 2, borderRadius: 2, textTransform: 'none', boxShadow: 2 }} onClick={handleOpenAdd}>
        Thêm phòng
      </Button>
      <Box sx={{ height: 600 }}>
        <DataGrid rows={rooms} columns={columns} pageSize={7} sx={{
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
      
      
    }} />
      </Box>
      <Modal open={open} onClose={handleClose}>
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
            {isEdit ? 'Sửa phòng' : 'Thêm phòng'}
          </Typography>
          <TextField
            label="Tên phòng"
            fullWidth
            value={currentRoom.name || ''}
            onChange={(e) => setCurrentRoom({ ...currentRoom, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Sức chứa"
            type="number"
            fullWidth
            value={currentRoom.capacity || 0}
            onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: Number(e.target.value) })}
            sx={{ mb: 2 }}
          />
            <TextField
                label="Vị trí"
                fullWidth
                value={currentRoom.location || ''}
                onChange={(e) => setCurrentRoom({ ...currentRoom, location: e.target.value })}
                sx={{ mb: 2 }}
            />
          <Button variant="contained"
  fullWidth
  sx={{
    mt: 2,
    borderRadius: 2,
    textTransform: 'none',
    backgroundColor: '#1976d2',
    '&:hover': { backgroundColor: '#1565c0' }
  }} onClick={handleSave}>
            Lưu
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
