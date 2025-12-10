import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import api from '../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const { selectedSeats, showtimeId, totalPrice: paramPrice } = route.params || {};

  const { authToken, refreshAccessToken } = useAuth();

  const [bookingId, setBookingId] = useState(null);


  const [totalPrice, setTotalPrice] = useState(paramPrice || 0); 

  const [paying, setPaying] = useState(false);
  const [countdown, setCountdown] = useState(300);

  const timerRef = useRef(null);

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

        setBookingId(res.data.booking._id);
        setTotalPrice(res.data.booking.totalPrice || 0); 

      } catch (error) {
        console.error('Lỗi hold vé:', error.response?.data || error.message);
        Alert.alert('Lỗi', error.response?.data?.message || 'Không thể giữ vé.');
        navigation.goBack();
      }
    };

    holdBooking();
  }, []);

  // 2. Lắng nghe sự kiện khi MoMo trả về App
  useEffect(() => {
    const handleDeepLink = (event) => {
      console.log("Deep link url:", event.url);
      let data = Linking.parse(event.url);
      
      if (data.path === 'momo-result' || event.url.includes('momo-result')) {
        
        const params = data.queryParams || {};
        
        const code = params.resultCode || params.errorCode; 
        const message = params.message;
        
        if (code == '0' || code === 0) {
            handlePaymentSuccess();
        } else {
            Alert.alert("Thất bại", "Giao dịch lỗi: " + (message || "Không rõ nguyên nhân"));
        }
        // --------------------
      }
    };

    // Đăng ký sự kiện
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [bookingId]);

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
  }, [bookingId]);

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

  const handleGoBack = () => {
    handleCancelBooking();
  };

  const handlePaymentSuccess = async () => {
    try {
      setPaying(true);
      let token = authToken;
      if (!token) token = await refreshAccessToken();

      await api.post(`/bookings/pay/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await api.get(`/bookings/successful/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearInterval(timerRef.current);
      Alert.alert('Thành công', 'Thanh toán hoàn tất! Vé đã được gửi về email.');
      navigation.navigate('MyTicketsScreen');
    } catch (error) {
      console.error('Lỗi xác nhận vé:', error.response?.data || error.message);
      Alert.alert('Lỗi', error.response?.data?.message || 'Thanh toán thành công nhưng chưa lấy được vé. Vui lòng liên hệ hỗ trợ.');
    } finally {
      setPaying(false);
    }
  }

  const handleMomoPayment = async () => {
    try {
      setPaying(true);

      if (!bookingId) {
        Alert.alert('Lỗi', 'Chưa có thông tin vé.');
        return;
      }

      const redirectUrl = Linking.createURL('momo-result'); 
      console.log('Redirect URL gửi đi:', redirectUrl);

      const res = await api.post('/payment/momo', { 
        totalAmount: paramPrice,
        bookingId: bookingId,
        redirectUrl: redirectUrl
      });

      const { deeplink } = res.data;

      if (deeplink) {
        try {
            await Linking.openURL(deeplink);
        } catch (err) {
            console.error("Lỗi mở Deep Link:", err);
            Alert.alert("Lỗi", "Không thể mở ứng dụng MoMo. Hãy chắc chắn bạn đã cài App MoMo Developer.");
        }
      } else {
        Alert.alert("Lỗi", "Không lấy được link thanh toán.");
      }

    } catch (error) {
      console.error('Thanh toán lỗi:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán MoMo.');
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
        <Text style={styles.countdown}>Thời gian giữ vé: {formatCountdown(countdown)}</Text>

        {/* Hiển thị thông tin tổng tiền */}
        <View style={styles.infoContainer}>
            <Text style={styles.label}>Tổng tiền cần thanh toán:</Text>
            <Text style={styles.price}>{paramPrice.toLocaleString()} VND</Text>
        </View>

        {/* Nút thanh toán MoMo */}
        <TouchableOpacity
          style={styles.momoButton}
          onPress={handleMomoPayment}
          disabled={paying}
        >
            {/* Nếu bạn có ảnh logo MoMo thì bỏ vào đây, không thì dùng Text */}
            <Text style={styles.momoButtonText}>
                {paying ? 'Đang xử lý...' : 'THANH TOÁN BẰNG VÍ MOMO'}
            </Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
            Bạn sẽ được chuyển sang ứng dụng MoMo để xác nhận thanh toán.
        </Text>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scrollContent: { paddingTop: 100, paddingHorizontal: 20, alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 10, color: '#fff', fontWeight: 'bold' },
  countdown: { fontSize: 18, color: '#f39c12', marginBottom: 40 },
  
  infoContainer: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333'
  },
  label: { color: '#ccc', fontSize: 16, marginBottom: 10 },
  price: { color: '#fff', fontSize: 28, fontWeight: 'bold' },

  momoButton: { 
    backgroundColor: '#A50064', // Màu đặc trưng của MoMo
    paddingVertical: 18, 
    borderRadius: 12, 
    width: '100%', 
    alignItems: 'center',
    shadowColor: "#A50064",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6
  },
  momoButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase' },
  
  noteText: {
      color: '#666',
      textAlign: 'center',
      marginTop: 20,
      fontSize: 14,
      paddingHorizontal: 20
  }
});

export default PaymentScreen;