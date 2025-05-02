import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './HomeScreen';
import Showtimes from './Showtimes';
import BookingScreen from './BookingScreen';
import PaymentScreen from './PaymentScreen';
import MyTicketsScreen from './MyTicketsScreen';


const Stack = createStackNavigator();


export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Showtimes" component={Showtimes} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="MyTicketsScreen" component={MyTicketsScreen} />


    </Stack.Navigator>
  );
}