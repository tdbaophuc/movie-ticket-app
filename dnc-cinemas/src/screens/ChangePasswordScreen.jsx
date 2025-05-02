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
import { useAuth } from '../../contexts/AuthContext';  // Import useAuth để truy cập authToken

export default function ChangePassword() {
  const navigation = useNavigation();
  const { authToken } = useAuth();  // Lấy token từ AuthContext
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
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

    if (!authToken) {
      return Alert.alert('Lỗi', 'Bạn cần đăng nhập lại');
    }

    setLoading(true);

    try {
      // Gọi API đổi mật khẩu với Authorization header
      await api.put(
        '/user/change-password',
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,  // Truyền token trong header
          },
        }
      );
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      navigation.goBack();  // Quay lại màn hình trước đó
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
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" marginTop="50"  />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Đổi mật khẩu</Text>

        <Text style={styles.label}>Mật khẩu cũ</Text>
        <TextInput
          style={styles.input}
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

        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={loading || updating}
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
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E1371',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#09FBD3',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
});
