// BookingScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';

const BookingScreen = ({ route, navigation }) => {
  const { showtimeId, movieTitle, moviePoster, dateTime, ticketPrice } = route.params;
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);



  useFocusEffect(
    useCallback(() => {
      fetchSeats(); // gọi khi màn hình được focus
  
      const interval = setInterval(() => {
        fetchSeats();
      }, 1000);
  
      return () => clearInterval(interval); // clear khi mất focus
    }, [])
  );

  const fetchSeats = async () => {
    try {
      const res = await api.get(`/showtimes/${showtimeId}`);
      const reserved = await api.get(`/bookings/reserved-seats/${showtimeId}`);

      const allSeats = res.data.seats.map((seat) => ({
        _id: seat.seatNumber,
        label: seat.seatNumber,
        status: reserved.data.reservedSeats.includes(seat.seatNumber)
          ? 'booked'
          : 'available',
      }));

      setSeats(allSeats);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tải danh sách ghế.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSeat = (seat) => {
    if (seat.status !== 'available') return;
    if (selectedSeats.includes(seat._id)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seat._id));
    } else {
      setSelectedSeats([...selectedSeats, seat._id]);
    }
  };

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ghế.');
      return;
    }

    navigation.navigate('PaymentScreen', {
      showtimeId,
      movieTitle,
      moviePoster,
      dateTime,
      ticketPrice,
      selectedSeats,
    });
  };

  const renderSeat = ({ item }) => {
    const isSelected = selectedSeats.includes(item._id);
    let backgroundColor = '#ccc';
    if (item.status === 'booked') backgroundColor = '#B6116B';
    else if (isSelected) backgroundColor = '#09FBD3';
    else backgroundColor = '#eee';

    return (
      <TouchableOpacity
        style={[styles.seat, { backgroundColor }]}
        onPress={() => toggleSeat(item)}
        disabled={item.status !== 'available'}
      >
        <Text style={styles.seatText}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const totalPrice = selectedSeats.length * ticketPrice;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{movieTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#B6116B" />
        ) : (
          <>
          
            <View style={styles.screenImageContainer}>
  <Image
    source={{ uri: 'https://pub-cd617de5e74b498ab4b882710c47f9b0.r2.dev/Screen-icon.png' }}
    style={styles.screenImage}
    resizeMode="contain"
  />
</View>

            <ScrollView horizontal contentContainerStyle={styles.seatWrapper}>
              <View style={styles.seatColumn}>
                <Text style={styles.sectionTitle}>Khu vực 1</Text>
                <FlatList
                  data={seats.filter((_, i) => i % 3 === 0)}
                  renderItem={renderSeat}
                  keyExtractor={(item) => item._id}
                  numColumns={5}
                />
              </View>
              <View style={styles.seatColumn}>
                <Text style={styles.sectionTitle}>Khu vực 2</Text>
                <FlatList
                  data={seats.filter((_, i) => i % 3 === 1)}
                  renderItem={renderSeat}
                  keyExtractor={(item) => item._id}
                  numColumns={5}
                />
              </View>
              <View style={styles.seatColumn}>
                <Text style={styles.sectionTitle}>Khu vực 3</Text>
                <FlatList
                  data={seats.filter((_, i) => i % 3 === 2)}
                  renderItem={renderSeat}
                  keyExtractor={(item) => item._id}
                  numColumns={5}
                />
              </View>
            </ScrollView>

            {/* Thông tin đặt vé phía dưới */}
            <View style={styles.bottomInfo}>
              <Text style={styles.infoText}>🕒 {new Date(dateTime).toLocaleString()}</Text>
              <Text style={styles.infoText}>🏢 Phòng 1 - Số Ghế: {selectedSeats.length}</Text>
              <Text style={styles.infoText}>
                💰 Tạm tính: {totalPrice.toLocaleString()}₫
              </Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={handleProceedToPayment}
              >
                <Text style={styles.bookButtonText}>Tiếp tục thanh toán</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#130B2B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#130B2B',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  seatWrapper: {
    paddingVertical: 16,
  },
  seatColumn: {
    marginHorizontal: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#09FBD3',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  seat: {
    width: 40,
    height: 40,
    borderRadius: 10,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatText: {
    color: '#000',
    fontWeight: 'bold',
  },
  bottomInfo: {
    backgroundColor: '#21232F',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '25%',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 2,
  },
  bookButton: {
    backgroundColor: '#B6116B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenImageContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  screenImage: {
    width: '80%',
    height: 30,
  },
  
});
