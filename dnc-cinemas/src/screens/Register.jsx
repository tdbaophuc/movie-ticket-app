import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons'; 

const Register = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
    const [isPasswordHidden, setIsPasswordHidden] = useState(true); 

  const handleRegister = async () => {
    if (!name || !email || !username || !password)
      return Alert.alert('Vui lòng nhập đầy đủ thông tin');

    const success = await register({ name, email, username, password });
    if (success) {
      Alert.alert('Đăng ký thành công');
      navigation.navigate('Login');
    } else {
      Alert.alert('Đăng ký thất bại');
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
          <Text style={styles.logo}>ĐĂNG KÝ</Text>

          <TextInput
            style={styles.input}
            placeholder="Tên đầy đủ"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#aaa"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
            onPress={handleRegister}
            style={({ pressed }) => [
              styles.button,
              { transform: [{ scale: pressed ? 0.97 : 1 }] }
            ]}
          >
            <Text style={styles.buttonText}>Đăng ký</Text>
          </Pressable>

          <Text style={styles.note}>
            Đã có tài khoản?{' '}
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
              Đăng nhập
            </Text>
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default Register;

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
    marginBottom: 40,
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
});
