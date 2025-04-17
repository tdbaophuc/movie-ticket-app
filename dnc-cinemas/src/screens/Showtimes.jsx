import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

const Showtimes = () => {
  const route = useRoute();
  const { movieId, movieTitle } = route.params;

  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const response = await api.get(`/showtimes/${movieId}`);
        setShowtimes(response.data);
      } catch (error) {
        console.error('Lỗi khi tải suất chiếu:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [movieId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suất chiếu của: {movieTitle}</Text>

      <ScrollView>
        {showtimes.map((showtime) => (
          <TouchableOpacity
            key={showtime._id}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
              // Điều hướng đến màn hình chọn ghế
              console.log('Đi đến đặt vé cho:', showtime._id);
            }}
          >
            <View style={styles.info}>
              <Text style={styles.cinema}>{showtime.room.name}</Text>
              <Text style={styles.datetime}>
                {new Date(showtime.startTime).toLocaleString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 16,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1c1c1c',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  info: {
    flex: 1,
  },
  cinema: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  datetime: {
    color: '#ccc',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#111',
  },
});

export default Showtimes;
