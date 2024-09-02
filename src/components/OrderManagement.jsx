import React, { useState } from 'react';
import { Box, VStack, HStack, Button, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const ordersData = [
  {
    id: 1,
    tableId: 2,
    items: [
      { name: "Steak", quantity: 1, status: "preparing" },
      { name: "Salad", quantity: 2, status: "ready" }
    ],
    status: "preparing",
    total: 45.00
  },
  {
    id: 2,
    tableId: 5,
    items: [
      { name: "Wine", quantity: 1, status: "ready" },
      { name: "Cheese Plate", quantity: 1, status: "preparing" }
    ],
    status: "preparing",
    total: 60.00
  }
];

function OrderManagement() {
  const [orders, setOrders] = useState(ordersData);
  const { t } = useLanguage();

  const handleMarkReady = (orderId) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: t('statusReady') } : order
    );
    setOrders(updatedOrders);
  };

  const handleSendToCashier = (orderId) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: t('statusSentToCashier') } : order
    );
    setOrders(updatedOrders);
  };

  return (
    <Box p={4}>
      <VStack spacing={6}>
        {orders.map(order => (
          <Box key={order.id} p={4} borderWidth="1px" borderRadius="lg">
            <Text fontSize="lg">{t('table')} {order.tableId} - {order.status}</Text>
            <VStack spacing={2} mt={2}>
              {order.items.map((item, index) => (
                <HStack key={index} justify="space-between" width="100%">
                  <Text>{item.name} (x{item.quantity})</Text>
                  <Text>{item.status}</Text>
                </HStack>
              ))}
            </VStack>
            <HStack spacing={4} mt={4}>
              <Button 
                colorScheme="green"
                onClick={() => handleMarkReady(order.id)}
                isDisabled={order.status !== t('statusPreparing')}
              >
                {t('markAsReady')}
              </Button>
              <Button 
                colorScheme="blue"
                onClick={() => handleSendToCashier(order.id)}
                isDisabled={order.status !== t('statusReady')}
              >
                {t('sendToCashier')}
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default OrderManagement;
