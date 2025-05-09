'use client';

import { Button, Box, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

interface Showtime {
  id: string;
  movie: string;
  dateTime: string;
  ticketprice: number;
  format: string;
  room: string;
  language: string;
  note: string;
  status: string;
  poster: string;
  movieTitle: string;
  roomName: string;
  roomCapacity: number;
}



let handleEdit = () => {}; 

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [open, setOpen] = useState(false);
  const [currentShowtime, setCurrentShowtime] = useState<any>({});
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [movieList, setMovieList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomList, setRoomList] = useState<any[]>([]);
  const [availableSeatsMap, setAvailableSeatsMap] = useState<{ [key: string]: number }>({});

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'poster',
      headerName: 'Poster',
      width: 80,
      renderCell: (params) => (
        <img src={params.value} alt="Poster" style={{ width: 75, height: 130, objectFit: 'cover' }} />
      ),
    },
    { field: 'movie', headerName: 'Tên phim', width: 150 },
    { field: 'dateTime', headerName: 'Ngày và giờ chiếu', width: 150 },
    { field: 'room', headerName: 'Phòng chiếu', width: 100 },
    { field: 'roomCapacity', headerName: 'Tổng ghế', width: 80 },
    {
      field: 'availableSeats',
      headerName: 'Ghế còn lại',
      width: 100,
      renderCell: (params) => availableSeatsMap[params.row.id] ?? 'Đang tải...',
    },
    
    { field: 'ticketprice', headerName: 'Giá vé (VNĐ)', width: 100 },
    { field: 'format', headerName: 'Định dạng', width: 100 },
    { field: 'language', headerName: 'Ngôn ngữ', width: 100 },
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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies');
        setMovieList(res.data);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();

    const fetchRooms = async () => {
      try {
        const res = await api.get('/rooms');
        setRoomList(res.data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    
    
    fetchRooms();
    fetchShowtimes();
  }, []);
  const fetchAvailableSeats = async (showtimes: Showtime[]) => {
    try {
      const seatData: { [key: string]: number } = {};
  
      await Promise.all(
        showtimes.map(async (showtime) => {
          const res = await api.get(`/bookings/reserved-seats/${showtime.id}`);
          const reservedCount = res.data.reservedSeats.length;
          seatData[showtime.id] = showtime.roomCapacity - reservedCount;
        })
      );
  
      setAvailableSeatsMap(seatData);
    } catch (err) {
      console.error('Lỗi khi lấy ghế đã đặt:', err);
    }
  };
  
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
          movieTitle: showtime.movie.title,
          dateTime: dateTime.toISOString().slice(0, 16), // Định dạng YYYY-MM-DDTHH:mm
          ticketprice: showtime.ticketPrice,
          format: showtime.format,
          room: showtime.room.name,
          roomName: showtime.room.name,
          language: showtime.language,
          note: showtime.note,
          poster: showtime.movie.poster,
          roomCapacity: showtime.room.capacity,
          status,
        };
      });

      setShowtimes(data);
      await fetchAvailableSeats(data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  };

  handleEdit = (showtime: any) => {
    const dateTime = new Date(showtime.dateTime);
    setCurrentShowtime({
      ...showtime,
      movie: movieList.find(m => m.title === showtime.movie)?._id || showtime.movie,
      movieTitle: showtime.movie,
      room: roomList.find(r => r.name === showtime.room)?._id || showtime.room,
      roomName: showtime.room,
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (!currentShowtime.dateTime) {
      alert('Vui lòng nhập đầy đủ ngày và giờ chiếu.');
      return;
    }

    try {
      const payload = {
        movie: currentShowtime.movie,
        dateTime: new Date(currentShowtime.dateTime).toISOString(),
        room: currentShowtime.room,
        ticketPrice: currentShowtime.ticketprice,
        format: currentShowtime.format,
        language: currentShowtime.language,
        note: currentShowtime.note,
      };

      if (currentShowtime.id) {
        await api.put(`/showtimes/${currentShowtime.id}`, payload);
        await fetchShowtimes();
      } else {
        const res = await api.post('/showtimes', payload);
        await fetchShowtimes();
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
        Quản lý suất chiếu
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
          <Box sx={{ mb: 2 }}>
  <Typography variant="body1" sx={{ mb: 1 }}>Phim đã chọn:</Typography>
  <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
    {currentShowtime.movieTitle || 'Chưa chọn'}
  </Typography>
  <Button variant="outlined" onClick={() => setMovieModalOpen(true)}>Chọn phim</Button>
</Box>

<TextField
              label="Ngày và giờ chiếu"
              type="datetime-local"
              fullWidth
              value={currentShowtime.dateTime || ''} // Sử dụng trường datetime duy nhất
              onChange={(e) => setCurrentShowtime({
                ...currentShowtime,
                dateTime: e.target.value // Cập nhật datetime khi người dùng thay đổi
              })}
              sx={{ marginBottom: 2 }}
            />

          <Box sx={{ mb: 2 }}>
  <Typography variant="body1" sx={{ mb: 1 }}>Phòng chiếu đã chọn:</Typography>
  <Typography variant="subtitle1" color="secondary" sx={{ mb: 1 }}>
    {currentShowtime.roomName || 'Chưa chọn'}
  </Typography>
  <Button variant="outlined" onClick={() => setRoomModalOpen(true)}>Chọn phòng</Button>
</Box>

          <TextField
            label="Giá vé (VNĐ)"
            type="number"
            fullWidth
            value={currentShowtime.ticketprice|| ''}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, ticketprice: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Định dạng"
            fullWidth
            value={currentShowtime.format|| ''}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, format: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Ngôn ngữ"
            fullWidth
            value={currentShowtime.language|| ''}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, language: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Ghi chú"
            fullWidth
            value={currentShowtime.note|| ''}
            onChange={(e) => setCurrentShowtime({ ...currentShowtime, note: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </Box>
      </Modal>
      <Modal open={movieModalOpen} onClose={() => setMovieModalOpen(false)}>
  <Box sx={{
    padding: 3,
    backgroundColor: 'white',
    width: 600,
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 2,
    boxShadow: 24,
  }}>
    <Typography variant="h6" sx={{ mb: 2 }}>Chọn phim</Typography>
    <TextField
      label="Tìm kiếm phim"
      fullWidth
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{ mb: 2 }}
    />
    {movieList
      .filter(movie => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(movie => (
        <Box key={movie._id} sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }}
          onClick={() => {
            setCurrentShowtime({
              ...currentShowtime,
              movie: movie._id,
              movieTitle: movie.title,
            });
            setMovieModalOpen(false);
          }}
        >
          <img src={movie.poster} alt="poster" style={{ width: 80, height: 100, objectFit: 'cover', marginRight: 16 }} />
          <Typography>{movie.title}</Typography>
        </Box>
      ))}
  </Box>
</Modal>

<Modal open={roomModalOpen} onClose={() => setRoomModalOpen(false)}>
<Box sx={{
    padding: 3,
    backgroundColor: 'white',
    width: 600,
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 2,
    boxShadow: 24,
  }}>
    <Typography variant="h6" sx={{ mb: 2 }}>Chọn phòng chiếu</Typography>
    <TextField
      label="Tìm kiếm phòng chiếu"
      fullWidth
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{ mb: 2 }}
    />
    {roomList
      .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(room => (
        <Box key={room._id} sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }}
          onClick={() => {
            setCurrentShowtime({
              ...currentShowtime,
              room:room._id,
              roomName: room.name,
            });
            setRoomModalOpen(false);
          }}
        >
          <Typography>{room.name}</Typography>
        </Box>
      ))}
  </Box>
</Modal>




    </Box>
    </Box>
  );
}
