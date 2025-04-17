import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  Image, TouchableOpacity, Pressable
} from 'react-native';
import api from '../utils/api';
import { useNavigation } from '@react-navigation/native';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get('/movies');
        setMovies(response.data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách phim:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('Showtimes', {
          movieId: item._id,
          movieTitle: item.title,
        })
      }
      android_ripple={{ color: '#ccc' }}
      style={styles.cardWrapper}
    >
      <View style={styles.card}>
        <Image source={{ uri: item.poster }} style={styles.poster} resizeMode="cover" />
        <View style={styles.details}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.genre}>{item.genre}</Text>
          <Text style={styles.info}>⏱ {item.duration} phút</Text>
          <Text style={styles.info}>📅 {item.releaseDate}</Text>
          <Text numberOfLines={3} style={styles.description}>{item.description}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  poster: {
    width: 120,
    height: 180,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  details: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#111',
    marginBottom: 4,
  },
  genre: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#e50914',
  },
  info: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
    marginTop: 6,
  },
});

export default Movies;
