import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import AppLoading from 'expo-app-loading';

import Movies from './src/screens/Movies';
import Theaters from './src/screens/Theaters';
import Ticket from './src/screens/Ticket';
import Showtimes from './src/screens/Showtimes';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Movies">
        
        <Stack.Screen name="Movies" component={Movies} />
        <Stack.Screen name="Theaters" component={Theaters} />
        <Stack.Screen name="Ticket" component={Ticket} />
        <Stack.Screen name="Showtimes" component={Showtimes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
  
}
