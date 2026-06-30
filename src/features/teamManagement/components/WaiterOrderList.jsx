import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge, Button } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../services/api'; // Import the API service

function WaiterOrderList() {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const { user } = useAuthContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders', { params: { waiterId: user._id } });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();

    let socketURL = process.env.REACT_APP_API_URL;
    if (socketURL.includes("/api")) socketURL = socketURL.replace("/api", "");
    const socket = io(socketURL);

    socket.emit('join-room', { role: 'waiter', userId: user._id });

    socket.on('update-order', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );

      if (updatedOrder.status === 'ready') {
        toast({
          title: t('orderReadyForDelivery'),
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user._id, t, toast]);

  const handleDeliverOrder = async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/deliver`);

      setOrders(prevOrders =>
        prevOrders.map(order => (order._id === orderId ? response.data : order))
      );
    } catch (error) {
      console.error('Error delivering order:', error);
      toast({
        title: t('errorTitle'),
        description: t('deliverOrderError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('yourOrders')}</Text>
      <VStack spacing={4} align="start">
        {orders.map(order => (
          <Box key={order._id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between">
              <Text>{t('table')} {order.tableId.number} - {t(order.status)}</Text>
              <Badge colorScheme={order.status === 'ready' ? 'green' : order.status === 'delivered' ? 'blue' : 'yellow'}>
                {t(order.status)}
              </Badge>
            </HStack>
            <VStack mt={4} align="start">
              {order.items.map((item, index) => (
                <HStack key={index} justify="space-between" width="100%">
                  <Text>{item.name}</Text>
                  <Text>{t(item.status)}</Text>
                </HStack>
              ))}
            </VStack>
            {order.status === 'ready' && (
              <Button
                mt={4}
                colorScheme="blue"
                size="sm"
                onClick={() => handleDeliverOrder(order._id)}
              >
                {t('deliverOrder')}
              </Button>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default WaiterOrderList;
