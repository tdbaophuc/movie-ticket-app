import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import api from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfile() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/me');
        const { _id, name, email, username } = response.data;
        setUserId(_id);
        setFormData({ name, email, username });
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!userId) return Alert.alert('Lỗi', 'Không xác định được người dùng');

    setUpdating(true);
    try {
      await api.put(`/user/${userId}`, formData);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
       
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#ccc" />
          </TouchableOpacity>

          <Text style={styles.title}>Chỉnh sửa thông tin</Text>
          <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              value={formData.name}
              onChangeText={val => handleChange('name', val)}
              placeholder="Nhập họ tên"
              placeholderTextColor="#aaa"
              style={styles.input}
            />
          </View>
         

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={val => handleChange('email', val)}
              placeholder="example@gmail.com"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <TextInput
              value={formData.username}
              onChangeText={val => handleChange('username', val)}
              placeholder="Tên đăng nhập"
              placeholderTextColor="#aaa"
              style={styles.input}
            />
          </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, updating && { opacity: 0.7 }]}
            activeOpacity={0.8}
            disabled={updating}
          >
            <Text style={styles.saveButtonText}>
              {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Text>
          </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#130B2B',
    paddingTop: 50,
  },
  scroll: {
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1B1E2C',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  backButton: {
    marginLeft: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E4E4E4',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#B0BEC5',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2E2F3E',
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2E1371',
  },
  saveButton: {
    backgroundColor: '#2E1371',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#2E1371',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
