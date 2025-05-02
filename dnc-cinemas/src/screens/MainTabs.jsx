import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { useNavigation } from '@react-navigation/native';
import HomeStack from './HomeStack';
import MyTicketsScreen from './MyTicketsScreen';
import ProfileStack from './ProfileStack';


const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <MenuProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: shouldHideTabBar(route) ? { display: 'none' } : styles.tabBar,
          tabBarIcon: ({ color, focused }) => {
            let iconName;

            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'MyTicketsScreen') iconName = focused ? 'ticket' : 'ticket-outline';
            else if (route.name === 'ProfileStack') iconName = focused ? 'person' : 'person-outline';

            return <Ionicons name={iconName} size={24} color={color} />;
          },
          tabBarActiveTintColor: '#09FBD3',
          tabBarInactiveTintColor: '#888',
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="MyTicketsScreen" component={MyTicketsScreen} />
        <Tab.Screen name="ProfileStack" component={ProfileStack} />
      
      </Tab.Navigator>
    </MenuProvider>
  );
}

const DummyScreen = () => <View />;

import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

function shouldHideTabBar(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';

  if (routeName === 'Showtimes' || routeName === 'BookingScreen' || routeName === 'PaymentScreen' || routeName === 'EditProfile' || routeName === 'ChangePasswordScreen') {
    return true;
  }
  return false;
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: '#2E1371',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    height: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
});
