'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api';

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
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Tên phòng', width: 200 },
    { field: 'capacity', headerName: 'Sức chứa', width: 120 },
    { field: 'location', headerName: 'Vị trí', width: 150 },
    {
      field: 'actions',
      headerName: 'Hành động',
      width: 180,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => handleEdit(params.row)}
          >
            Sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Xoá
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
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpenAdd}>
        Thêm phòng
      </Button>
      <Box sx={{ height: 600 }}>
        <DataGrid rows={rooms} columns={columns} pageSize={7} />
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            padding: 3,
            backgroundColor: 'white',
            width: 400,
            position: 'absolute',
            top: '50%',
            right: 100,
            transform: 'translateY(-50%)',
            borderRadius: 2,
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
          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
