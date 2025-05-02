import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import MainTabs from '../src/screens/MainTabs';

// Màn hình Auth
import LoginScreen from '../src/screens/LoginScreen';
import Register from '../src/screens/Register';

// Màn hình chính sau khi login
import HomeScreen from '../src/screens/HomeScreen';
import Showtimes from '../src/screens/Showtimes';
import BookingScreen from '../src/screens/BookingScreen';
import MyTicketsScreen from '../src/screens/MyTicketsScreen';
import PaymentScreen from '../src/screens/PaymentScreen';
import ProfileScreen from '../src/screens/ProfileScreen';
import EditProfile from '../src/screens/EditProfile';
import ChangePasswordScreen from '../src/screens/ChangePasswordScreen';



const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Showtimes" component={Showtimes} />
    <Stack.Screen name="BookingScreen" component={BookingScreen}  />
    <Stack.Screen name="MyTicketScreen" component={MyTicketsScreen} />
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfile} />
    <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
    
  </Stack.Navigator>
);

// Màn hình Loading
import LoadingScreen from '../src/screens/LoadingScreen';

export default function AppNavigator() {
  const { authToken, loading } = useAuth();  // Dùng useAuth để lấy dữ liệu

  if (loading) {
    return <LoadingScreen />;  // Hiển thị loading khi đang tải dữ liệu từ AsyncStorage
  }  

  return authToken ? <MainTabs /> : <AuthStack />;  // Kiểm tra nếu có token thì vào MainStack, nếu không vào AuthStack
}
