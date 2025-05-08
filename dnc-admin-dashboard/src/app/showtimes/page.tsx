'use client';

import { Button, Box, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 50 },
  {
    field: 'poster',
    headerName: 'Poster',
    width: 120,
    renderCell: (params) => (
      <img src={params.value} alt="Poster" style={{ width: 100, height: 150, objectFit: 'cover' }} />
    ),
  },
  { field: 'movie', headerName: 'Tên phim', width: 200 },
  { field: 'date', headerName: 'Ngày chiếu', width: 100 },
  { field: 'time', headerName: 'Giờ chiếu', width: 100 },
  { field: 'room', headerName: 'Phòng chiếu', width: 100 },
  { field: 'ticketprice', headerName: 'Giá vé (VNĐ)', width: 100 },
  { field: 'format', headerName: 'Định dạng', width: 100 },
  { field: 'langguage', headerName: 'Ngôn ngữ', width: 100 },
  { field: 'note', headerName: 'Ghi chú', width: 120 },
  { field: 'status', headerName: 'Trạng thái', width: 120 },
  {
    field: 'action',
    headerName: 'Hành động',
    width: 180,
    renderCell: (params) => (
      <Box display="flex" gap={1}>
        <Button variant="contained" color="primary" onClick={() => handleEdit(params.row)}>
          Sửa
        </Button>
        <Button variant="outlined" color="error" onClick={() => handleDelete(params.row.id)}>
          Xoá
        </Button>
      </Box>
    ),
  },
];

let handleEdit = () => {}; // placeholder sẽ được gán bên dưới

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [currentShowtime, setCurrentShowtime] = useState<any>({});

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const response = await api.get('/showtimes');
        const now = new Date();

        const data = response.data.map((showtime: any) => {
          const dateTime = new Date(showtime.dateTime);
          const durationMinutes = showtime.movie.duration || 0;
          const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);

          let status = '';
          if (now > endTime) {
            status = 'Đã chiếu';
          } else if (now >= dateTime && now <= endTime) {
            status = 'Đang chiếu';
          } else {
            status = 'Sắp chiếu';
          }

          return {
            id: showtime._id,
            movie: showtime.movie.title,
            date: dateTime.toLocaleDateString(),
            time: dateTime.toLocaleTimeString(),
            ticketprice: showtime.ticketPrice,
            format: showtime.format,
            room: showtime.room,
            langguage: showtime.language,
            note: showtime.note,
            poster: showtime.movie.poster,
            status,
          };
        });

        setShowtimes(data);
      } catch (error) {
        console.error('Error fetching showtimes:', error);
      }
    };

    fetchShowtimes();
  }, []);

  handleEdit = (showtime: any) => {
    setCurrentShowtime(showtime);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    try {
      const payload = {
        movie: currentShowtime.movie,
        dateTime: new Date(`${currentShowtime.date}T${currentShowtime.time}`).toISOString(),
        room: currentShowtime.room,
        ticketPrice: currentShowtime.ticketprice,
        format: currentShowtime.format,
        language: currentShowtime.langguage,
        note: currentShowtime.note,
      };
  
      if (currentShowtime.id) {
        // cập nhật
        await api.put(`/showtimes/${currentShowtime.id}`, payload);
        setShowtimes(showtimes.map(s => s.id === currentShowtime.id ? currentShowtime : s));
      } else {
        // thêm mới
        const res = await api.post('/showtimes', payload);
        const newShowtime = res.data;
  
        const dateTime = new Date(newShowtime.dateTime);
        const now = new Date();
        const durationMinutes = newShowtime.movie?.duration || 0;
        const endTime = new Date(dateTime.getTime() + durationMinutes * 60000);
  
        let status = '';
        if (now > endTime) status = 'Đã chiếu';
        else if (now >= dateTime && now <= endTime) status = 'Đang chiếu';
        else status = 'Sắp chiếu';
  
        setShowtimes([...showtimes, {
          id: newShowtime._id,
          movie: newShowtime.movie?.title || currentShowtime.movie,
          date: dateTime.toLocaleDateString(),
          time: dateTime.toLocaleTimeString(),
          ticketprice: newShowtime.ticketPrice,
          format: newShowtime.format,
          room: newShowtime.room,
          langguage: newShowtime.language,
          note: newShowtime.note,
          poster: newShowtime.movie?.poster || '',
          status,
        }]);
      }
  
      setOpen(false);
    } catch (error) {
      console.error('Error saving showtime:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá suất chiếu này?')) return;
  
    try {
      await api.delete(`/showtimes/${id}`);
      setShowtimes(showtimes.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting showtime:', error);
    }
  };
  

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Quản lý phim
      </Typography>
      <Button variant="contained" color="success" sx={{ mb: 2 }} onClick={() => {
      setCurrentShowtime({});
      setOpen(true);
      }}> Thêm suất chiếu</Button>
    <Box sx={{ height: 700, width: '100%' }}>
      <DataGrid
        rows={showtimes}
        columns={columns}
        pageSize={5}
        rowHeight={150}
        getRowHeight={() => 'auto'}
      />
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ padding: 3,
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
    boxShadow: 24, }}>
          <Typography variant="h6">Sửa suất chiếu</Typography>
          <TextField
            label="Tên phim"
            fullWidth
            value={currentShowtime.movie}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, movie: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Ngày chiếu"
            type="date"
            fullWidth
            value={currentShowtime.date}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, date: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Giờ chiếu"
            type="time"
            fullWidth
            value={currentShowtime.time}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, time: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Phòng chiếu"
            fullWidth
            value={currentShowtime.room}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, room: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Giá vé (VNĐ)"
            type="number"
            fullWidth
            value={currentShowtime.ticketprice}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, ticketprice: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Định dạng"
            fullWidth
            value={currentShowtime.format}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, format: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Ngôn ngữ"
            fullWidth
            value={currentShowtime.langguage}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, langguage: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Ghi chú"
            fullWidth
            value={currentShowtime.note}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, note: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </Box>
      </Modal>
    </Box>
    </Box>
  );
}
