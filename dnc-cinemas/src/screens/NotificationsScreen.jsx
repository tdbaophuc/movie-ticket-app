import React, { useEffect, useState, useCallback } from 'react'; 
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, } from 'react-native';
import api from '../utils/api';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const typeColors = {
  info: '#09FBD3',     
  warning: '#FE53BB',  
  success: '#27AE5D',  
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.log('Lỗi lấy thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.log('Lỗi đánh dấu đã đọc:', err);
    }
  };

  useFocusEffect(
  useCallback(() => {
    fetchNotifications(); // gọi khi màn hình được focus

    const interval = setInterval(() => {
      fetchNotifications();
    }, 1000);

    return () => clearInterval(interval); // clear khi mất focus
  }, [])
);

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
    >
      <TouchableOpacity
        onPress={() => markAsRead(item._id)}
        style={[
          styles.notificationCard,
          item.isRead ? styles.read : styles.unread,
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.row}>
          <Icon
            name={item.icon || 'bell-outline'}
            size={28}
            color={typeColors[item.type] || '#fff'}
            style={styles.icon}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: typeColors[item.type] || '#09FBD3' }]}>
              {item.title}
            </Text>
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#B6116B" />
      </View>
    );
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noText}>Không có thông báo nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <Text style={styles.header}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#130B2B',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    paddingBottom: 10,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: '#21232F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#FE53BB',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: '#ccc',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  unread: {
    borderColor: '#FE53BB',
    borderWidth: 1.2,
  },
  read: {
    opacity: 0.6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#130B2B',
  },
  noText: {
    color: '#aaa',
    fontSize: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
});
