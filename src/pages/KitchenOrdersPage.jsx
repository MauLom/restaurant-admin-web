import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import api from '../services/api';

function KitchenOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders?kitchen=true'); // Fetch kitchen orders (or bar orders based on user role)
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsReady = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'ready' });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: 'ready' } : order
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Kitchen/Bar Orders</Text>
      <VStack spacing={4}>
        {orders.map((order) => (
          <Box key={order._id} p={4} bg="gray.800" color="white" borderRadius="md" width="full">
            <Text fontSize="lg">Order #{order._id}</Text>
            <VStack spacing={2} mt={2}>
              {order.items.map((item, index) => (
                <HStack key={index} justifyContent="space-between" width="full">
                  <Text>{item.name} (x{item.quantity})</Text>
                  <Text>{item.status}</Text>
                </HStack>
              ))}
            </VStack>
            <HStack spacing={4} mt={4}>
              <Button
                colorScheme="green"
                onClick={() => handleMarkAsReady(order._id)}
                isDisabled={order.status === 'ready'}
              >
                Mark as Ready
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default KitchenOrdersPage;
