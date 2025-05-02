import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';  
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import { AuthProvider } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  
  useEffect(() => {
    const prepare = async () => {
      await SplashScreen.preventAutoHideAsync();  // Ngừng tự động ẩn splash screen
    };
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();  // Ẩn splash screen khi font đã được tải
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;  
  }

  return (
    <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
    </AuthProvider>
  );
}
