'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api'; // Import API instance

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'user', headerName: 'Người dùng', width: 200 },
  { field: 'movie', headerName: 'Tên phim', width: 180 },
  { field: 'showtime', headerName: 'Suất chiếu', width: 180 },
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>({});
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings'); // Lấy danh sách đơn đặt vé
        setBookings(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu đơn đặt vé:', error);
      }
    };

    fetchBookings();
  }, []);

  const handleEdit = (booking: any) => {
    setCurrentBooking(booking);
    setOpen(true);
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await api.delete(`/bookings/${bookingId}`); // Xóa đơn đặt vé theo ID
      setBookings(bookings.filter((booking) => booking.id !== bookingId)); // Cập nhật lại danh sách
    } catch (error) {
      console.error('Lỗi khi xóa đơn đặt vé:', error);
    }
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      const response = currentBooking.id
        ? await api.put(`/bookings/${currentBooking.id}`, currentBooking) // Cập nhật thông tin đơn đặt vé
        : await api.post('/bookings', currentBooking); // Thêm đơn đặt vé mới

      setBookings(bookings.map((booking) => (booking.id === response.data.id ? response.data : booking)));
      setOpen(false);
    } catch (error) {
      console.error('Lỗi khi lưu thông tin đơn đặt vé:', error);
    }
  };

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid rows={bookings} columns={columns} pageSize={5} />
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ padding: 3, backgroundColor: 'white', width: 400, margin: 'auto', marginTop: '20%' }}>
          <Typography variant="h6">{currentBooking.id ? 'Sửa đơn đặt vé' : 'Thêm đơn đặt vé'}</Typography>
          <TextField
            label="Người dùng"
            fullWidth
            value={currentBooking.user || ''}
            onChange={(e) => setCurrentBooking({ ...currentBooking, user: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Tên phim"
            fullWidth
            value={currentBooking.movie || ''}
            onChange={(e) => setCurrentBooking({ ...currentBooking, movie: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Suất chiếu"
            fullWidth
            value={currentBooking.showtime || ''}
            onChange={(e) => setCurrentBooking({ ...currentBooking, showtime: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </Box>
      </Modal>
    </Box>
  );
}
