'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Modal, TextField, Typography
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>({});

  useEffect(() => {
    
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/admin/bookings');
        const formatted = res.data.bookings.map((b: any, idx: number) => ({
          id: b._id,
          user: b.user?.name || 'Ẩn danh',
          userMail: b.user?.email || 'Ẩn danh',
          movie: b.showtime?.movie?.title || 'Không rõ',
          showtime: b.showtime?.dateTime || '',
          room: b.showtime?.room?.name || 'Không rõ',
          seats: b.seats.join(', '),
          status: b.status,
          raw: b, // để dùng khi sửa
        }));
        setBookings(formatted);
      } catch (err) {
        console.error('Lỗi lấy danh sách vé:', err);
      }
    };

    fetchBookings();
  }, []);

  const handleEdit = (row: any) => {
    setCurrentBooking(row.raw);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`bookings/admin/bookings/${id}`);
      setBookings(bookings.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Lỗi xóa vé:', err);
    }
  };

  const handleSave = async () => {
    try {
      const { _id, seats } = currentBooking;
      const res = await api.put(`bookings/admin/bookings/${_id}`, { seats });
      const updated = res.data.booking;
      const updatedRow = {
        ...bookings.find((b) => b.id === updated._id),
        seats: updated.seats.join(', '),
        raw: updated,
      };
      setBookings(bookings.map((b) => (b.id === updated._id ? updatedRow : b)));
      setOpen(false);
    } catch (err) {
      console.error('Lỗi lưu vé:', err);
    }
  };

  const handleClose = () => setOpen(false);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'user', headerName: 'Người dùng', width: 150 },
    { field: 'userMail', headerName: 'Email người dùng', width: 200 },
    { field: 'movie', headerName: 'Tên phim', width: 200 },
    { field: 'showtime', headerName: 'Suất chiếu', width: 200 },
    { field: 'room', headerName: 'Phòng chiếu', width: 100 },
    { field: 'seats', headerName: 'Ghế', width: 100 },
    { field: 'status', headerName: 'Trạng thái', width: 100 },
    {
      field: 'action',
      headerName: 'Hành động',
      width: 200,
      renderCell: (params) => (
        <>
          <Button variant="contained"
  color="info"
  size="small"
  sx={{
    mr: 1,
    borderRadius: 2,
    textTransform: 'none',
    boxShadow: 1,
    '&:hover': { backgroundColor: '#0288d1' }
  }} onClick={() => handleEdit(params.row)} variant="outlined" sx={{ mr: 1 }}>Cập nhật</Button>
          <Button variant="outlined"
  color="error"
  size="small"
  sx={{
    borderRadius: 2,
    textTransform: 'none',
    '&:hover': { backgroundColor: '#ffebee' }
  }} onClick={() => handleDelete(params.row.id)} color="error" variant="outlined">Huỷ vé</Button>
        </>
      )
    }
  ];

  return (
    <Box sx={{ height: 700, width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Quản lý vé</Typography>
      <DataGrid  rows={bookings} columns={columns} pageSize={5} sx={{
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
      
      
    }}  />
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ p: 3,
    bgcolor: 'background.paper',
    width: 450,
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 3,
    boxShadow: 24, }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Sửa vé</Typography>
          
          <TextField
            label="Ghế (cách nhau bởi dấu phẩy)"
            fullWidth
            value={currentBooking.seats?.join(', ') || ''}
            onChange={(e) =>
              setCurrentBooking({ ...currentBooking, seats: e.target.value.split(',').map((s) => s.trim()) })
            }
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>Lưu thay đổi</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingsPage;
