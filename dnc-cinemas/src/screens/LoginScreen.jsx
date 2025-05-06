import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true); 

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      Alert.alert('Lỗi', 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={['#130B2B', '#000']}
        style={styles.container}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.innerContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>DNC CINEMAS</Text>

          <TextInput
            placeholder="Tên đăng nhập"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Mật khẩu"
              placeholderTextColor="#aaa"
              secureTextEntry={isPasswordHidden}
              value={password}
              onChangeText={setPassword}
              style={[styles.input_password, { flex: 1, marginBottom: 0 }]}
            />
            <TouchableOpacity onPress={() => setIsPasswordHidden(!isPasswordHidden)} style={styles.eyeIcon}>
              <Ionicons
                name={isPasswordHidden ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.button,
              { transform: [{ scale: pressed ? 0.97 : 1 }] }
            ]}
          >
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </Pressable>

          <Text style={styles.note}>
            Bạn chưa có tài khoản?{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Register')}>
              Đăng ký ngay!
            </Text>
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flexGrow: 1,
    padding: 28,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#09FBD3',
    textAlign: 'center',
    marginBottom: 50,
    textShadowColor: '#09FBD3',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  input: {
    backgroundColor: '#21232F',
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 17,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#09FBD3',
  },
  input_password: {
    backgroundColor: '#21232F',
    color: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 17,
    marginBottom: 20,
   
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21232F',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#09FBD3',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  eyeIcon: {
    paddingHorizontal: 6,
  },
  button: {
    backgroundColor: '#130B2B',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#09FBD3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#09FBD3',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  note: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
  linkText: {
    color: '#E44D98',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
