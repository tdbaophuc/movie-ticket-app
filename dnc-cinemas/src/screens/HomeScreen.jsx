import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import api from '../utils/api';

const HomeScreen = ({ navigation }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [topMovies, setTopMovies] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchKeyword.trim() === '') {
        setSearchResults([]);
      } else {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchKeyword]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/movies/search?keyword=${encodeURIComponent(searchKeyword)}`);
      setSearchResults(res.data.movies);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies');
      const movies = res.data;

      const now = new Date();
      const nowShowing = [];
      const comingSoon = [];

      movies.forEach(movie => {
        const upcomingShowtimes = movie.showtimes.filter(time => new Date(time) >= now);
        const firstShowtime = movie.showtimes.length > 0
          ? new Date(Math.min(...movie.showtimes.map(t => new Date(t))))
          : null;

        if (firstShowtime) {
          if (firstShowtime <= now) {
            nowShowing.push(movie);
          } else {
            comingSoon.push(movie);
          }
        }
      });

      const topMovies = [...movies]
        .sort((a, b) => (b.bookedCount || 0) - (a.bookedCount || 0))
        .slice(0, 10);

      setNowShowing(nowShowing);
      setComingSoon(comingSoon);
      setTopMovies(topMovies);
    } catch (err) {
      console.error('Error fetching movies:', err);
    }
  };

  const renderMovieRow = (title, movies) => (
    <View style={styles.movieSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {movies.map(movie => (
          <TouchableOpacity
            key={movie._id}
            onPress={() => 
              navigation.navigate('Showtimes', {
                movieId: movie._id,
                movieTitle: movie.title,
                moviePoster: movie.poster,
                movieDescription: movie.description,
              })}
            style={styles.movieItem}
            activeOpacity={0.7}
          >
            <Image source={{ uri: movie.poster }} style={styles.moviePoster} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView style={styles.container}>
          <Text style={styles.logo}>DNC Cinemas</Text>
          <View style={styles.searchContainer}>
            <TextInput
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              placeholder="Tìm kiếm phim..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
            {searchKeyword.trim() !== '' && (
              <View style={styles.searchDropdown}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#E50914" />
                ) : searchResults.length > 0 ? (
                  searchResults.map(movie => (
                    <TouchableOpacity
                      key={movie._id}
                      onPress={() => {
                        navigation.navigate('Showtimes', { movieId: movie._id });
                        setSearchKeyword('');
                        setSearchResults([]);
                      }}
                      style={styles.searchItem}
                    >
                      <Image source={{ uri: movie.poster }} style={styles.searchImage} />
                      <Text style={styles.searchTitle}>{movie.title}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noResults}>Không tìm thấy phim nào</Text>
                )}
              </View>
            )}
          </View>

          {renderMovieRow('Đang chiếu', nowShowing)}
          {renderMovieRow('Sắp chiếu', comingSoon)}
          {renderMovieRow('Đặc biệt', topMovies)}
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#130B2B',
    color: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#130B2B',

  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',

  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#21232F',
    color: '#fff',
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
  },
  searchDropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchImage: {
    width: 44,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  searchTitle: {
    fontSize: 16,
    color: '#002D62',
    flexShrink: 1,
  },
  noResults: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },
  movieSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  movieItem: {
    marginRight: 12,
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
});
