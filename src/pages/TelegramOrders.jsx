import React, { useEffect, useState, useRef } from 'react';
import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import io from 'socket.io-client';
import TelegramOrderCard from '../components/TelegramOrderCard';

const TelegramOrders = () => {
  const [telegramOrders, setTelegramOrders] = useState([]);
  const socketRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    socketRef.current = io(API_URL.replace("/api", ""));

    const fetchTelegramOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/telegram-orders`);
        setTelegramOrders(response.data);
      } catch (error) {
        console.error('Error fetching telegram orders:', error);
      }
    };

    fetchTelegramOrders();

    socketRef.current.on('telegramOrderCreated', (order) => {
      setTelegramOrders((prevOrders) => [...prevOrders, order]);
    });

    socketRef.current.on('telegramOrderUpdated', (updatedOrder) => {
      setTelegramOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [API_URL]);

  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>Telegram Orders</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {telegramOrders.map(order => (
          <TelegramOrderCard key={order._id} order={order} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default TelegramOrders;
