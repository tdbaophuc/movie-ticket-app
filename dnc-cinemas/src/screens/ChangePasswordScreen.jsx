import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import api from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth để truy cập authToken & user info

export default function ChangePassword({ route }) {
  const navigation = useNavigation();
  const { authToken } = useAuth(); // Lấy token và thông tin người dùng
  const { userId } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = formData;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    }

    if (newPassword !== confirmNewPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    if (!authToken || !userId) {
      return Alert.alert('Lỗi', 'Không xác định được người dùng. Vui lòng đăng nhập lại');
    }

    setLoading(true);

    try {
      await api.put(
        `/user/change-password/${userId}`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Đổi mật khẩu</Text>

        <View style={styles.card}>
        <Text style={styles.label}>Mật khẩu cũ</Text>
        <TextInput
          style={styles.input_f}
          secureTextEntry
          value={formData.oldPassword}
          onChangeText={(text) => handleChange('oldPassword', text)}
          placeholder="Nhập mật khẩu cũ"
        />
      
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={formData.newPassword}
          onChangeText={(text) => handleChange('newPassword', text)}
          placeholder="Nhập mật khẩu mới"
        />

        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={formData.confirmNewPassword}
          onChangeText={(text) => handleChange('confirmNewPassword', text)}
          placeholder="Xác nhận mật khẩu mới"
        />
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
          )}
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
  backButton: {
    marginLeft: 20,

  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#B0BEC5',
    fontWeight: '600',
  },
  input: {
    height: 50,
    backgroundColor: '#2E2F3E',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#2E1371',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  input_f: {
    height: 50,
    backgroundColor: '#2E2F3E',
    borderRadius: 12,
    color: '#fff',
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#2E1371',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    marginBottom: 35,
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
