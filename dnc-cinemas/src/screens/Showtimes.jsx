import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../utils/api';
import { SharedElement } from 'react-navigation-shared-element';

const { width } = Dimensions.get('window');

const Showtimes = () => {
  const route = useRoute();
  const { movieId, movieTitle, moviePoster } = route.params;

  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const res = await api.get(`/showtimes/movie/${movieId}`);
        const data = res.data;
        setShowtimes(data);

        // Lấy danh sách các ngày duy nhất
        const dateSet = new Set(
          data.map((item) =>
            new Date(item.dateTime).toDateString()
          )
        );
        const dateArray = [...dateSet];
        setDates(dateArray);
        setSelectedDate(dateArray[0]);
      } catch (err) {
        console.error('Lỗi khi tải suất chiếu:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

  const filteredShowtimes = showtimes.filter(
    (s) =>
      new Date(s.dateTime).toDateString() === selectedDate
  );

  return (
    <ImageBackground
      source={{ uri: moviePoster }}
      blurRadius={8}
      style={styles.bg}
    >
        
      <View style={styles.overlay}>
        <SharedElement id={`movie.${movieId}.poster`}>
          <Text style={styles.title}>{movieTitle}</Text>
        </SharedElement>

        <Text style={styles.subtitle}>Chọn ngày chiếu</Text>
        <FlatList
          data={dates}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.dateItem,
                selectedDate === item && styles.dateItemActive,
              ]}
              onPress={() => setSelectedDate(item)}
            >
              <Text
                style={[
                  styles.dateText,
                  selectedDate === item && styles.dateTextActive,
                ]}
              >
                {item.split(' ').slice(0, 2).join(' ')}
              </Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.subtitle}>Chọn suất chiếu</Text>
        <FlatList
          data={filteredShowtimes}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.timeItem}
              onPress={() => {
                console.log('Chọn suất:', item._id);
                // Điều hướng đến chọn ghế
              }}
            >
              <Text style={styles.timeText}>
                {new Date(item.dateTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text style={styles.format}>{item.format} - {item.language}</Text>
              <Text style={styles.price}>{item.ticketPrice.toLocaleString()}₫</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </ImageBackground>
  );
};

Showtimes.sharedElements = (route) => {
  const { movieId } = route.params;
  return [`movie.${movieId}.poster`];
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  dateList: {
    marginTop: 8,
  },
  dateItem: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginRight: 8,
    height: width*0.1,
    width: width*0.2,
  },
  dateItemActive: {
    backgroundColor: '#E50914',
  },
  dateText: {
    color: '#ccc',
  },
  dateTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeList: {
    marginTop: 12,
  },
  timeItem: {
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    minWidth: width * 0.4,
    height: 100,
  },
  timeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  format: {
    color: '#aaa',
    marginTop: 4,
  },
  price: {
    color: '#E50914',
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default Showtimes;
