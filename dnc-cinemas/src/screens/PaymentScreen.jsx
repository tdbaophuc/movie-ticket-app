import { useNavigation, useRoute } from '@react-navigation/native'; 
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../../contexts/AuthContext'; 

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedSeats, showtimeId } = route.params || {}; // sửa lại nhận params từ trang trước (danh sách ghế đã chọn + id suất chiếu)

  const { authToken, refreshAccessToken } = useAuth();

  const [bookingId, setBookingId] = useState(null);
  const [paying, setPaying] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 phút = 300 giây

  // Các trường nhập giả lập
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const timerRef = useRef(null);

  // Hàm hold vé khi vào trang
  useEffect(() => {
    const holdBooking = async () => {
      try {
        let token = authToken;
        if (!token) {
          token = await refreshAccessToken();
        }
        if (!token) {
          Alert.alert('Lỗi', 'Phiên đăng nhập hết hạn.');
          navigation.navigate('LoginScreen');
          return;
        }
        const res = await api.post('/bookings/hold', {
          showtimeId,
          seats: selectedSeats,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        setBookingId(res.data.booking._id); // lưu BookingId
      } catch (error) {
        console.error('Lỗi hold vé:', error.response?.data || error.message);
        Alert.alert('Lỗi', error.response?.data?.message || 'Không thể giữ vé.');
        navigation.goBack();
      }
    };

    holdBooking();
  }, []);

  // Đếm ngược thời gian
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleCancelBooking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Hàm tự động huỷ vé
  const handleCancelBooking = async () => {
    if (!bookingId) return;

    try {
      let token = authToken;
      if (!token) {
        token = await refreshAccessToken();
      }
      await api.delete(`/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      Alert.alert('Thông báo', 'Hết thời gian thanh toán, vé đã bị huỷ.');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi huỷ vé:', error.response?.data || error.message);
    }
  };

  // Huỷ vé nếu người dùng bấm nút quay lại
  const handleGoBack = () => {
    handleCancelBooking();
  };

  const handlePayment = async () => {
    // Validate thông tin trước
    if (!cardNumber.trim() || !cardHolder.trim() || !expiryDate.trim() || !cvv.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin thanh toán.');
      return;
    }
  
    try {
      setPaying(true);
  
      if (!bookingId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin vé để thanh toán.');
        return;
      }
  
      let token = authToken;
      if (!token) {
        token = await refreshAccessToken();
      }
  
      const res = await api.post(`/bookings/pay/${bookingId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      clearInterval(timerRef.current); // dừng đếm ngược sau khi thanh toán
  
      Alert.alert('Thành công', 'Thanh toán thành công!');

    // Gửi vé về email sau khi thanh toán thành công
    await api.get(`/bookings/successful/${bookingId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Alert.alert('Thông báo', 'Vé đã được gửi về email của bạn.');
      // navigation.navigate('MyTicketScreen');
      navigation.navigate('MyTicketsScreen');
  
    } catch (error) {
      console.error('Thanh toán lỗi:', error.response?.data || error.message);
      Alert.alert('Lỗi', error.response?.data?.message || 'Thanh toán thất bại.');
    } finally {
      setPaying(false);
    }
  };
  

  const formatCountdown = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Thanh toán vé</Text>

        {/* Đếm ngược */}
        <Text style={styles.countdown}>Thời gian còn lại: {formatCountdown(countdown)}</Text>

        {/* Các ô nhập thông tin thanh toán giả */}
        <TextInput
          style={styles.input}
          placeholder="Số thẻ"
          placeholderTextColor="#ccc"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Tên chủ thẻ"
          placeholderTextColor="#ccc"
          value={cardHolder}
          onChangeText={setCardHolder}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            placeholder="Ngày hết hạn (MM/YY)"
            placeholderTextColor="#ccc"
            value={expiryDate}
            onChangeText={setExpiryDate}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="CVV"
            placeholderTextColor="#ccc"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={paying}
        >
          <Text style={styles.payButtonText}>
            {paying ? 'Đang thanh toán...' : 'Thanh toán ngay'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  scrollContent: { paddingTop: 100, paddingHorizontal: 20, alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 10, color: '#fff', fontWeight: 'bold' },
  countdown: { fontSize: 18, color: '#f39c12', marginBottom: 20 },
  input: { 
    backgroundColor: '#222', 
    width: '100%', 
    padding: 15, 
    borderRadius: 10, 
    color: '#fff', 
    marginBottom: 15,
    fontSize: 16,
  },
  row: { flexDirection: 'row', width: '100%' },
  payButton: { backgroundColor: '#B6116B', padding: 15, borderRadius: 10, marginTop: 20, width: '100%', alignItems: 'center' },
  payButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default PaymentScreen;
