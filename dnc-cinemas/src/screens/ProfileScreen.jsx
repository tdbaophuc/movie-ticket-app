import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { getRefreshToken } from '../utils/authStorage';
import { useAuth } from '../../contexts/AuthContext';

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

  const handleEdit = () => {
    navigation.navigate('EditProfile' );
  };
  const handleChangePassword = () => {
    navigation.navigate('ChangePasswordScreen',  { userId: userInfo?._id });
  };

  const imgprofile = 'https://pub-cd617de5e74b498ab4b882710c47f9b0.r2.dev/MyProfile.png';

  if (loading) return <ActivityIndicator size="large" color="#2E1371" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileSection}>
        <Image source={{ uri: imgprofile }} style={styles.avatar} />
        <Text style={styles.name}>{userInfo?.name || 'Người dùng'}</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Email: {userInfo?.email}</Text>
          <Text style={styles.infoText}>Tên đăng nhập: {userInfo?.username}</Text>
        </View>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChangePassword} style={styles.editButton}>
          <Text style={styles.editButtonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 24,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#2E1371',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E1371',
    marginBottom: 12,
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 4,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#09FBD3',
    borderRadius: 8,
    marginTop: 10,
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    alignSelf: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 50,

  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
