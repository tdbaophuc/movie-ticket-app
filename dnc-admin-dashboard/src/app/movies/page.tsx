'use client';

import { useEffect, useState } from 'react';
import { Button, Box, Modal, TextField, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import api from '../../utils/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import viLocale from 'date-fns/locale/vi'; // để hiển thị tiếng Việt (nếu muốn)


interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  poster: string;
  description: string;
  showtimes: string[]; 

}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Partial<Movie>>({});
  const [isEdit, setIsEdit] = useState(false);
  const [newShowtime, setNewShowtime] = useState<Date | null>(null);


  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies');
      const mapped = res.data.map((movie: any) => ({
        id: movie._id,
        title: movie.title,
        genre: movie.genre,
        duration: movie.duration,
        poster: movie.poster,
        description: movie.description,
        showtimes: movie.showtimes, 
        
      }));
      setMovies(mapped);
    } catch (err) {
      console.error('Lỗi lấy danh sách phim:', err);
    }
  };

  const handleEdit = (movie: Movie) => {
    setCurrentMovie(movie);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xoá phim này?')) {
      try {
        await api.delete(`/movies/${id}`);
        fetchMovies();
      } catch (err) {
        console.error('Lỗi xoá phim:', err);
      }
    }
  };

  const handleOpenAdd = () => {
    setCurrentMovie({ title: '', genre: '', description:'', shpowtimes:[], duration: 0, poster: '' });
    setIsEdit(false);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEdit && currentMovie.id) {
        await api.put(`/movies/${currentMovie.id}`, currentMovie);
      } else {
        await api.post('/movies', currentMovie);
      }
      fetchMovies();
      setOpen(false);
    } catch (err) {
      console.error('Lỗi lưu phim:', err);
    }
  };

  const handleClose = () => setOpen(false);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Tên phim', width: 200 },
    { field: 'genre', headerName: 'Thể loại', width: 100 },
    { field: 'description', headerName: 'Mô tả', width: 300 },
    { field: 'duration', headerName: 'Thời gian (phút)', width: 150 },
    {
      field: 'showtimes',
      headerName: 'Lịch chiếu',
      width: 170,
      renderCell: (params) => (
        <Box>
          {(params.value || []).slice(0, 3).map((time: string, idx: number) => (
            <Typography key={idx} variant="body2">
              {new Date(time).toLocaleString()}
            </Typography>
          ))}
          {params.value.length > 3 && <Typography variant="body2">...</Typography>}
        </Box>
      ),
    },
    
    {
      field: 'poster',
      headerName: 'Poster',
      width: 150,
      
      renderCell: (params) => (
        <img src={params.value} alt="Poster" style={{ width: 100, height: 150, objectFit: 'cover' }} />
      ),
    },
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
        Quản lý phim
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpenAdd}>
        Thêm phim
      </Button>
      <Box sx={{ height: 600 }}>
        <DataGrid rows={movies} columns={columns} pageSize={7} rowHeight={150} getRowHeight={() => 'auto'}/>
      </Box>
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
    boxShadow: 24,}}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {isEdit ? 'Sửa phim' : 'Thêm phim'}
          </Typography>
          <TextField
            label="Tên phim"
            fullWidth
            value={currentMovie.title || ''}
            onChange={(e) => setCurrentMovie({ ...currentMovie, title: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Thể loại"
            fullWidth
            value={currentMovie.genre || ''}
            onChange={(e) => setCurrentMovie({ ...currentMovie, genre: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            minRows={5}
            value={currentMovie.description || ''}
            onChange={(e) => setCurrentMovie({ ...currentMovie, description: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Thời gian"
            type="number"
            fullWidth
            value={currentMovie.duration || 0}
            onChange={(e) => setCurrentMovie({ ...currentMovie, duration: Number(e.target.value) })}
            sx={{ marginBottom: 2 }}
          />
           <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
          <DateTimePicker
            label="Chọn lịch chiếu"
            value={newShowtime}
            onChange={(newValue) => setNewShowtime(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <Button
            variant="outlined"
            sx={{ mt: 1, mb: 2 }}
            onClick={() => {
              if (newShowtime && !isNaN(newShowtime.getTime())) {
                setCurrentMovie({
                  ...currentMovie,
                  showtimes: [...(currentMovie.showtimes || []), newShowtime.toISOString()],
                });
                setNewShowtime(null);
              }
            }}
          >
            Thêm lịch chiếu
          </Button>
        </LocalizationProvider>

        {/* Hiển thị danh sách lịch chiếu đã thêm */}
        {(currentMovie.showtimes || []).map((time, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {new Date(time).toLocaleString()}
            </Typography>
            <Button
              size="small"
              color="error"
              onClick={() => {
                const updated = [...(currentMovie.showtimes || [])];
                updated.splice(idx, 1);
                setCurrentMovie({ ...currentMovie, showtimes: updated });
              }}
            >
              Xoá
            </Button>
          </Box>
        ))}
          <TextField
  label="Poster URL"
  fullWidth
  value={currentMovie.poster || ''}
  onChange={(e) => setCurrentMovie({ ...currentMovie, poster: e.target.value })}
  sx={{ marginBottom: 2 }}
/>

          <Button variant="contained" onClick={handleSave}>
            Lưu
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
