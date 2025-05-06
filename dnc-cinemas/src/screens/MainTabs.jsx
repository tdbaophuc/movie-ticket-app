import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform, View, Dimensions } from 'react-native';
import { useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MenuProvider } from 'react-native-popup-menu';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';



import HomeStack from './HomeStack';
import MyTicketsScreen from './MyTicketsScreen';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

export default function MainTabs() {
  const navigation = useNavigation();

  return (
    <MenuProvider>
      <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: shouldHideTabBar(route) ? { display: 'none' } : styles.tabBar,
    tabBarBackground: () => (
      <LinearGradient
        colors={['#2E1371', '#FE53BB']}
        start={[0, 1]}
        end={[1.8, 0]}
        style={StyleSheet.absoluteFill}
      />
    ),
    tabBarIcon: ({ focused }) => {
      let iconName;

      if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
      else if (route.name === 'MyTicketsScreen') iconName = focused ? 'ticket' : 'ticket-outline';
      else if (route.name === 'ProfileStack') iconName = focused ? 'person' : 'person-outline';

      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {focused && (
            <Animatable.View
              animation="fadeInDown"
              duration={300}
              style={styles.floatingCircle}
            />
          )}
          <Animatable.View
            animation={focused ? 'bounceIn' : undefined}
            duration={500}
            style={{ zIndex: 1 }}
          >
            <Ionicons name={iconName} size={26} color={focused ? '#fff' : '#aaa'} />
          </Animatable.View>
        </View>
      );
    }
  })}
>

        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="MyTicketsScreen" component={MyTicketsScreen} />
        <Tab.Screen name="ProfileStack" component={ProfileStack} />
      </Tab.Navigator>
    </MenuProvider>
  );
}

function shouldHideTabBar(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  return [
    'Showtimes',
    'BookingScreen',
    'PaymentScreen',
    'EditProfile',
    'ChangePasswordScreen',
  ].includes(routeName);
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: '#2E1371',
    borderRadius: 30,
    height: Platform.OS === 'ios' ? 80 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    paddingTop: 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#FE53BB33',
  },
  
});
