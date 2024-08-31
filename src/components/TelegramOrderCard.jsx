import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Stack } from '@chakra-ui/react';
import axios from 'axios';

const TelegramOrderCard = ({ order, onDelete }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [timeElapsed, setTimeElapsed] = useState('');

  useEffect(() => {
    const calculateTimeElapsed = () => {
      const now = new Date();
      const statusChangedAt = new Date(order.statusChangedAt);
      const diff = Math.floor((now - statusChangedAt) / 1000); // difference in seconds

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeElapsed(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeElapsed();
    const timer = setInterval(calculateTimeElapsed, 1000);

    return () => clearInterval(timer);
  }, [order.statusChangedAt]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      await axios.put(`${API_URL}/telegram-orders/${order._id}/status`, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Preparation':
        return 'yellow.100';
      case 'Ready for Delivery':
        return 'blue.100';
      case 'Delivered':
        return 'green.100';
      default:
        return 'gray.100';
    }
  };

  const displayName = order.createdByAlias || order.createdByTelegramId;

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} bg={getStatusColor(order.status)}>
      <Stack spacing={2}>
        <Text fontWeight="bold">Orden {order.tempOrderId}</Text> {/* Display the temporary order ID */}
        {(order.items || []).map((item, index) => (
          <Text key={index} fontWeight="bold">{item.quantity} x {item.item}</Text>
        ))}
        <Text>Status: {order.status}</Text>
        <Text>User: {displayName}</Text> {/* Display alias if available, otherwise Telegram ID */}
        <Text>Time in current status: {timeElapsed}</Text> {/* Display the elapsed time */}
        {order.status !== 'Delivered' && (
          <>
            <Button onClick={() => handleUpdateStatus('Ready for Delivery')} colorScheme="blue">Marcar como lista para entregar</Button>
            <Button onClick={() => handleUpdateStatus('Delivered')} colorScheme="green">Marcar como entregada</Button>
            <Button onClick={onDelete} colorScheme="red">Borrar Orden</Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default TelegramOrderCard;
