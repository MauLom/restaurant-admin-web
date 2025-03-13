import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge, Button } from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api'; // Import the API service

function WaiterOrderList() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders'); // Fetch orders from the API
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId) => {
    try {
      const order = orders.find(order => order._id === orderId);
      const newStatus = order.status === 'preparing' ? 'ready' : 'delivered';

      await api.put(`/orders/${orderId}`, { status: newStatus }); // Update order status

      const updatedOrders = orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('yourOrders')}</Text>
      <VStack spacing={4} align="start">
        {orders.map(order => (
          <Box key={order._id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between">
              <Text>{t('table')} {order.tableId.number} - {order.status}</Text>
              <Badge colorScheme={order.status === 'ready' ? 'green' : 'yellow'}>
                {order.status}
              </Badge>
            </HStack>
            <VStack mt={4} align="start">
              {order.items.map((item, index) => (
                <HStack key={index} justify="space-between" width="100%">
                  <Text>{item.name}</Text>
                  <Text>{item.status}</Text>
                </HStack>
              ))}
            </VStack>
            <Button
              mt={4}
              colorScheme="blue"
              size="sm"
              onClick={() => handleUpdateStatus(order._id)}
              isDisabled={order.status === 'delivered'}
            >
              {t('updateStatus')}
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default WaiterOrderList;
