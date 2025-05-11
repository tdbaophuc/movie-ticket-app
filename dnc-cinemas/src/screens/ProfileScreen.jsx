import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { getRefreshToken } from '../utils/authStorage';
import { useAuth } from '../../contexts/AuthContext';
import * as Animatable from 'react-native-animatable';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('Không có refreshToken');

        const response = await api.get('/user/me');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  const handleEdit = () => navigation.navigate('EditProfile');
  const handleChangePassword = () =>
    navigation.navigate('ChangePasswordScreen', { userId: userInfo?._id });

  const imgprofile = 'https://pub-cd617de5e74b498ab4b882710c47f9b0.r2.dev/MyProfile.png';
  const bgImg = 'https://images.unsplash.com/photo-1606761568499-6c1cf492b1fa?auto=format&fit=crop&w=934&q=80';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FE53BB" />
      </View>
    );
  }

  return (
    <ImageBackground source={{ uri: bgImg }} style={styles.background}>
      <SafeAreaView style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
            <Image source={{ uri: imgprofile }} style={styles.avatar} />
            <Text style={styles.name}>{userInfo?.name || 'Người dùng'}</Text>
            <Text style={styles.username}>@{userInfo?.username}</Text>

            <View style={styles.infoBox}>
            
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoText}>{userInfo?.email}</Text>
            </View>

            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Text style={styles.buttonText}>Cập nhật thông tin</Text>
            </TouchableOpacity>

            <View style={styles.passwordRow}>
  <View style={styles.passwordBox}>
    <Text style={styles.infoLabel}>Mật khẩu:</Text>
    <Text style={styles.infoText}>{'********'}</Text>
  </View>
  <TouchableOpacity onPress={handleChangePassword} style={styles.changePassButton}>
    <Text style={styles.changePassText}>Đổi</Text>
  </TouchableOpacity>
</View>
          </Animatable.View>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(19,11,43,0.85)',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FE53BB',
    marginBottom: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 12,
    width: '100%',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#09FBD3',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#2E1371',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 8,
    width: '100%',
  },
  actionButtonAlt: {
    backgroundColor: '#2E1371',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#B6116B',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#FE53BB',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },

  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    marginTop: 20,
  },
  passwordBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 12,
  },
  changePassButton: {
    marginLeft: 10,
    backgroundColor: '#2E1371',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  changePassText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
});
