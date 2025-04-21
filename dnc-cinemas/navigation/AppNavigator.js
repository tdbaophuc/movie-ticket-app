import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Màn hình Auth
import LoginScreen from '../src/screens/LoginScreen';
import Register from '../src/screens/Register';

// Màn hình chính sau khi login
import Movies from '../src/screens/Movies';
import Showtimes from '../src/screens/Showtimes';
import Theaters from '../src/screens/Theaters';
import Ticket from '../src/screens/Ticket';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Movies" component={Movies} />
    <Stack.Screen name="Showtimes" component={Showtimes} />
    <Stack.Screen name="Theaters" component={Theaters} />
    <Stack.Screen name="Ticket" component={Ticket} />
  </Stack.Navigator>
);

export default function AppNavigator() {
  const { authToken, loading } = useAuth();  // Dùng useAuth để lấy dữ liệu

  if (loading) return null;  // Nếu đang loading thì không render gì

  return authToken ? <MainStack /> : <AuthStack />;  // Kiểm tra nếu có token thì vào MainStack, nếu không vào AuthStack
}
