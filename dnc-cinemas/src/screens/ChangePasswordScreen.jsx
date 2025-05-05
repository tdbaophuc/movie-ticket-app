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
import { useAuth } from '../../contexts/AuthContext';  // Import useAuth để truy cập authToken & user info

export default function ChangePassword({route}) {
  const navigation = useNavigation();
  const { authToken, refeshtoken } = useAuth(); // Lấy token và thông tin người dùng
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

    if (!authToken || !{userId}) {
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
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" style={{ marginTop: 50 }} />
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
