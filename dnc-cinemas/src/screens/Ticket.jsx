import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const Ticket = ({ route }) => {
  const { selectedSeats, title, img } = route.params;
  const nav = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Booking Confirmed</Text>
      <Text style={{ fontSize: 18, marginTop: 20 }}>Movie: {title}</Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>Seats: {selectedSeats.join(', ')}</Text>
      <TouchableOpacity
        onPress={() => nav.navigate('Movies')}
        style={{
          backgroundColor: 'green',
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>Back to Movies</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Ticket;
