import React, { useEffect, useState, useRef } from 'react';
import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import io from 'socket.io-client';
import TelegramOrderCard from '../components/TelegramOrderCard';

const TelegramOrders = ({ filterType }) => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const socketRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    socketRef.current = io(API_URL.replace("/api", ""));

    const fetchTelegramOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/telegram-orders?type=${filterType}`);
        sortOrders(response.data);
      } catch (error) {
        console.error('Error fetching telegram orders:', error);
      }
    };

    fetchTelegramOrders();

    socketRef.current.on('telegramOrderCreated', (order) => {
      if (order.type === filterType) {
        sortOrders([...pendingOrders, order]);
      }
    });

    socketRef.current.on('telegramOrderUpdated', (updatedOrder) => {
      if (updatedOrder.type === filterType) {
        const allOrders = [...pendingOrders, ...deliveredOrders].map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
        sortOrders(allOrders);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [API_URL, pendingOrders, deliveredOrders, filterType]);

  const sortOrders = (orders) => {
    const pending = orders.filter(order => order.status !== 'Delivered');
    const delivered = orders.filter(order => order.status === 'Delivered');
    setPendingOrders(pending);
    setDeliveredOrders(delivered);
  };

  const handleDeleteOrder = (orderId) => {
    setPendingOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
    setDeliveredOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>Telegram Orders ({filterType === 'kitchen' ? 'Cocina' : 'Bar'})</Heading>

      <Heading as="h2" size="lg" mt={8} mb={4}>Pending Orders</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {pendingOrders.map(order => (
          <TelegramOrderCard key={order._id} order={order} onDelete={handleDeleteOrder} />
        ))}
      </SimpleGrid>

      <Heading as="h2" size="lg" mt={8} mb={4}>Delivered Orders</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {deliveredOrders.map(order => (
          <TelegramOrderCard key={order._id} order={order} onDelete={handleDeleteOrder} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default TelegramOrders;
