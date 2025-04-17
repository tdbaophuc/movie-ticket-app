import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const Theaters = ({ route }) => {
  const { movieId, title, img } = route.params;
  const [showtimes, setShowtimes] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const nav = useNavigation();

  useEffect(() => {
    // Gọi API để lấy thông tin suất chiếu của phim
    axios.get(`${API_BASE_URL}/showtimes/${movieId}`)
      .then((response) => {
        setShowtimes(response.data); // Lưu thông tin suất chiếu vào state
      })
      .catch((error) => {
        console.error("Lỗi khi tải suất chiếu", error);
      });
  }, [movieId]);

  const handleSeatSelection = (seat) => {
    // Xử lý chọn ghế
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20, textAlign: 'center' }}>{title}</Text>
      <FlatList
        data={showtimes}
        renderItem={({ item }) => (
          <View style={{ margin: 10, borderBottomWidth: 1, borderBottomColor: 'lightgrey' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.time}</Text>
            <FlatList
              data={item.seats}
              numColumns={5}
              renderItem={({ item: seat }) => (
                <TouchableOpacity
                  onPress={() => handleSeatSelection(seat)}
                  style={{
                    height: 40,
                    width: 40,
                    backgroundColor: selectedSeats.includes(seat) ? 'green' : 'white',
                    borderColor: 'green',
                    borderWidth: 1,
                    margin: '3%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text>{seat}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
            />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <TouchableOpacity
        onPress={() => nav.navigate('Ticket', { selectedSeats, title, img })}
        style={{ backgroundColor: 'red', padding: 20, margin: 20, borderRadius: 10 }}
      >
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Theaters;
