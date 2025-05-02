import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert, Button } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

const MyTicketsScreen = () => {
  const { authToken, refreshAccessToken } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      let token = authToken;
      if (!token) {
        token = await refreshAccessToken();
      }
      const res = await api.get('/bookings/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTickets(res.data.bookings);
    } catch (error) {
      console.error('Lỗi tải vé:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (ticketId) => {
    try {
      let token = authToken;
      if (!token) {
        token = await refreshAccessToken();
      }

      await api.delete(`/bookings/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Thành công', 'Vé đã được huỷ.');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Lỗi huỷ vé:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể huỷ vé. Vui lòng thử lại.');
    }
  };

  const handleCancelPress = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn huỷ vé này không?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Huỷ vé', style: 'destructive', onPress: () => cancelTicket(selectedTicket._id) },
      ]
    );
  };

  const renderTicket = ({ item }) => (
    
    <TouchableOpacity 
      style={[
        styles.ticketCard, 
        selectedTicket?._id === item._id && styles.selectedTicketCard
      ]}
      onPress={() => setSelectedTicket(item)}
    >
      
      <View style={styles.row}>
        {/* Poster phim bên trái */}
        {item.showtime?.movie?.poster && (
          <Image 
            source={{ uri: item.showtime.movie.poster }} 
            style={styles.moviePoster} 
            resizeMode="cover"
          />
        )}

        {/* Thông tin vé và mã QR bên phải */}
        <View style={styles.ticketInfo}>
          <Text style={styles.detail}>DNC Cinemas</Text>
          <Text style={styles.movieTitle}>{item.showtime?.movie?.title || 'Không có tiêu đề'}</Text>
          <Text style={styles.detail}>Suất chiếu: {item.showtime ? new Date(item.showtime.dateTime).toLocaleString() : 'Không có suất chiếu'}</Text>
          <Text style={styles.detail}>Phòng: {item.showtime?.room?.name || 'Không có thông tin phòng'}</Text>
          <Text style={styles.detail}>Ghế: {item.seats?.join(', ') || 'Không có ghế'}</Text>

          
        </View>
        {/* QR code bên dưới */}
        {item.qrCode && (
            <Image 
              source={{ uri: item.qrCode }} 
              style={styles.qrCode}
              resizeMode="contain"
            />
          )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#B6116B" />
      </View>
    );
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noTicketsText}>Bạn chưa có vé nào.</Text>
      </View>
    );
  }

  return (
    
    <View style={styles.safe}>
      <Text style={styles.logo}>My Tickets</Text>      
      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={renderTicket}
        contentContainerStyle={styles.listContent}
      />

      {/* Nút huỷ vé nếu có vé được chọn */}
      {selectedTicket && (
        <View style={styles.cancelButtonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
            <Text style={styles.cancelButtonText}>Huỷ vé</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safe:{
    flex:1,
    paddingTop:20,
    backgroundColor: '#130B2B',
    color: '#fff',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20,
    paddingTop: 20,

  },
  myTicket: {
    fontSize: 23,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  listContent: { padding: 20, backgroundColor: '#130B2B' },
  ticketCard: { 
    backgroundColor: '#130B2B', 
    borderRadius: 10, 
    padding: 10, 
    marginBottom: 20, 
    shadowColor: '#fff', 
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  selectedTicketCard: {
    borderColor: '#B6116B',
    borderWidth: 2,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  moviePoster: {
    width: 100,
    height: 140,
    borderRadius: 10,
    marginRight: 10,
  },
  ticketInfo: { flex: 1 },
  movieTitle: { color: '#B6116B', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  detail: { color: '#ccc', fontSize: 14, marginBottom: 3 },
  noTicketsText: { color: '#aaa', fontSize: 18 },
  qrCode: { width: 80, height: 80, marginTop: 35, marginRight:10  },
  cancelButtonContainer: {
    padding: 15,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  cancelButton: {
    backgroundColor: '#B6116B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom:80,
    height: 50,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyTicketsScreen;
