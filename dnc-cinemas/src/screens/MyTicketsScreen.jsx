import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert, Button } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../utils/api';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';


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
      const now = new Date();
const sortedTickets = res.data.bookings
  .map(ticket => ({
    ...ticket,
    isExpired: new Date(ticket.showtime?.dateTime) < now,
  }))
  .sort((a, b) => {
    if (a.isExpired && !b.isExpired) return 1;
    if (!a.isExpired && b.isExpired) return -1;
    return new Date(a.showtime.dateTime) - new Date(b.showtime.dateTime);
  });

setTickets(sortedTickets);

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

  const renderTicket = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
    >
      <TouchableOpacity 
  style={[
    styles.ticketCard, 
    selectedTicket?._id === item._id && !item.isExpired && styles.selectedTicketCard,
    item.isExpired && styles.expiredTicketCard,
  ]}
  onPress={() => {
    if (!item.isExpired) {
      setSelectedTicket(item);
    }
  }}
  activeOpacity={item.isExpired ? 1 : 0.85}
>

        <View style={styles.row}>
          {item.showtime?.movie?.poster && (
            <Image 
              source={{ uri: item.showtime.movie.poster }} 
              style={styles.moviePoster} 
              resizeMode="cover"
            />
          )}
          <View style={styles.ticketInfo}>
            <Text style={styles.cinemaName}>DNC Cinemas</Text>
            <Text style={styles.movieTitle}>{item.showtime?.movie?.title || 'Không có tiêu đề'}</Text>
            <Text style={styles.detail}>{new Date(item.showtime?.dateTime).toLocaleString()}</Text>
            <Text style={styles.detail}>Phòng: {item.showtime?.room?.name || 'Không rõ'}</Text>
            <Text style={styles.detail}>Ghế: {item.seats?.join(', ')}</Text>
          </View>
          {item.qrCode && (
            <Image 
              source={{ uri: item.qrCode }} 
              style={styles.qrCode}
              resizeMode="contain"
            />
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
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
      {selectedTicket && !selectedTicket.isExpired && (
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
  safe: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#130B2B',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0.08,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20,
    paddingTop: 20,
    textTransform: 'uppercase',

  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    marginTop: 10,
  },
  ticketCard: {
    backgroundColor: '#21232F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#FE53BB',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  cinemaName: {
    color: '#FE53BB',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedTicketCard: {
    borderColor: '#B6116B',
    borderWidth: 2,
    shadowColor: '#B6116B',
    transform: [{ scale: 1.02 }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  moviePoster: {
    width: 100,
    height: 140,
    borderRadius: 12,
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    color: '#09FBD3',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detail: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 4,
  },
  qrCode: {
    width: 70,
    height: 70,
    marginLeft: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#130B2B',
  },
  noTicketsText: {
    color: '#aaa',
    fontSize: 20,
    fontWeight: '500',
  },
  cancelButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
  },
  cancelButton: {
    backgroundColor: '#FE53BB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FE53BB',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 75,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  expiredTicketCard: {
    backgroundColor: '#3a3a3a',
    opacity: 0.6,
  },
  
});

export default MyTicketsScreen;
