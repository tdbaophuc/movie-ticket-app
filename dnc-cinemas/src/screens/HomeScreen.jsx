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
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';


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

      // Sắp xếp phim đang chiếu theo thời gian cập nhật mới nhất
const sortedNowShowing = nowShowing.sort(
  (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
);

setNowShowing(sortedNowShowing);

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
            <Icon
    name="search-outline"
    size={22}
    color="#999"
    style={{ position: 'absolute', right: 20, top: 12 }}
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
          {renderMovieRow('Nổi bật', topMovies)}
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
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#130B2B',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  searchInput: {
    backgroundColor: '#21232F',
    color: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 18,
    marginBottom: 15,
  },
  searchDropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#1E1B2E',
    borderRadius: 16,
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#302D4C',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: '#2A2642',
  },
  searchImage: {
    width: 45,
    height: 65,
    borderRadius: 10,
    marginRight: 12,
  },
  searchTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    flexShrink: 1,
  },
  noResults: {
    fontSize: 15,
    color: '#E44D98',
    textAlign: 'center',
    paddingVertical: 12,
  },
  
  movieSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  movieItem: {
    marginRight: 15,
  },
  moviePoster: {
    width: 140,
    height: 210,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    borderWidth: 2,
    borderColor: '#2E1371',
  },
});
