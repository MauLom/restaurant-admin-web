import React from 'react';
import { Box, Text, Button, Stack } from '@chakra-ui/react';
import axios from 'axios';

const TelegramOrderCard = ({ order }) => {
  const API_URL = process.env.REACT_APP_API_URL;

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

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} bg={getStatusColor(order.status)}>
      <Stack spacing={2}>
        <Text fontWeight="bold">{order.quantity} x {order.item}</Text>
        <Text>Status: {order.status}</Text>
        <Text>User: {order.createdByTelegramId}</Text> {/* Display the Telegram ID of the user */}
        {order.status !== 'Delivered' && (
          <>
            <Button onClick={() => handleUpdateStatus('Ready for Delivery')} colorScheme="blue">Mark as Ready for Delivery</Button>
            <Button onClick={() => handleUpdateStatus('Delivered')} colorScheme="green">Mark as Delivered</Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default TelegramOrderCard;
