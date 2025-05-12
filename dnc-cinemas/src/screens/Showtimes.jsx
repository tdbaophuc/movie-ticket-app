import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../utils/api';
import { SharedElement } from 'react-navigation-shared-element';
import { LinearGradient } from 'expo-linear-gradient'; 
import { Ionicons } from '@expo/vector-icons';



const { width } = Dimensions.get('window');

const Showtimes = ({ navigation }) => {
  const route = useRoute();
  const { movieId, movieTitle, moviePoster, movieDescription } = route.params;
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
  
        // Lấy toàn bộ ngày chiếu, cả quá khứ và tương lai
        const dateSet = new Set(
          data.map((item) =>
            new Date(item.dateTime).toDateString()
          )
        );
        const dateArray = [...dateSet].sort((a, b) => new Date(a) - new Date(b));
        setDates(dateArray);
        
        // Ưu tiên chọn ngày hiện tại nếu có
        const today = new Date().toDateString();
        setSelectedDate(dateArray.includes(today) ? today : dateArray[0]);
  
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
      style={styles.bg}
      blurRadius={8}
      
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', '#130B2B)']}
        style={styles.overlay}
      > 
         <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        {/* Tiêu đề phim */}
        <SharedElement id={`movie.${movieId}.poster`}>
          <Text style={styles.title}>{movieTitle}</Text>
        </SharedElement>

        {/* Nội dung phim cuộn được */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Thông tin phim</Text>
        <Text style={styles.infoText}>{movieDescription}</Text>
      </ScrollView>

      {/* View cố định ở dưới cùng: chọn ngày & giờ */}
      <View style={styles.bottomSection}>
        {/* Chọn ngày chiếu */}
        <Text style={styles.subtitle}>Chọn ngày chiếu</Text>
        {!loading && showtimes.length === 0 && (
         <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 20 }}>
          Hiện tại chưa có suất chiếu cho phim này
        </Text>
      )}
        <FlatList
          data={dates}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
          renderItem={({ item }) => {
            const isPastDate = new Date(item) < new Date(new Date().toDateString());

            return (
              <TouchableOpacity
                disabled={isPastDate}
                style={[
                  styles.dateItem,
                  selectedDate === item && styles.dateItemActive,
                  isPastDate && { backgroundColor: '#555' }
                ]}
                onPress={() => {
                  if (!isPastDate) setSelectedDate(item);
                }}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === item && styles.dateTextActive,
                    isPastDate && { color: '#999' }
                  ]}
                >
                  {new Date(item).toLocaleDateString('vi-VN', {
                  day: 'numeric',   
                  month: 'short',   
                  })}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Chọn suất chiếu */}
        <Text style={styles.subtitle}>Chọn suất chiếu</Text>
        <FlatList
          data={filteredShowtimes}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeList}
          renderItem={({ item }) => {
            const isPastTime = new Date(item.dateTime) < new Date();

            return (
              <TouchableOpacity
                disabled={isPastTime}
                style={[
                  styles.timeItem,
                  isPastTime && { backgroundColor: '#555' }
                ]}
                onPress={() => {
                  if (!isPastTime) {
                    navigation.navigate('BookingScreen', {
                      showtimeId: item._id,
                      movieTitle: movieTitle,
                      dateTime: item.dateTime,
                      ticketPrice: item.ticketPrice,
                    });
                  }
                }}
              >
                <Text style={[styles.timeText, isPastTime && { color: '#999' }]}>
                  {new Date(item.dateTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={[styles.format, isPastTime && { color: '#999' }]}>
                  {item.format} - {item.language}
                </Text>
                <Text style={[styles.price, isPastTime && { color: '#999' }]}>
                  {item.ticketPrice.toLocaleString()}₫
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      </LinearGradient>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Mờ từ trên xuống
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    alignItems: 'center',
    textAlign:'center',
    paddingTop: width*0.25,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  subtitle: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
    textAlign:'center',
  },
  infoText: {
    color: '#ccc',
    marginTop: 8,
    textAlign:'center',
  },
  dateList: {
    marginTop: 8,
    
  },
  dateItem: {
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginRight: 8,
    height: width * 0.1,
    width: width * 0.2,
  },
  dateItemActive: {
    backgroundColor: '#2E1371',
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
    color: '#09FBD3',
    marginTop: 4,
    fontWeight: 'bold',
  },
  bottomSection: {
    paddingBottom: width*0.25,
  },
});

export default Showtimes;
