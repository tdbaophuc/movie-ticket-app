import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from './ProfileScreen';
import EditProfile from './EditProfile';
import ChangePasswordScreen from './ChangePasswordScreen';

const Stack = createStackNavigator();


export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}