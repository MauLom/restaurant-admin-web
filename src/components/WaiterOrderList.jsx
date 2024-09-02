import React from 'react';
import { Box, VStack, HStack, Text, Badge, Button } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const waiterOrders = [
  {
    id: 1,
    table: 'T2',
    items: [
      { name: 'Steak', status: 'preparing' },
      { name: 'Salad', status: 'ready' }
    ],
    status: 'preparing'
  },
  {
    id: 2,
    table: 'T5',
    items: [
      { name: 'Wine', status: 'ready' },
      { name: 'Cheese Plate', status: 'preparing' }
    ],
    status: 'preparing'
  }
];

function WaiterOrderList() {
  const { t } = useLanguage();

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('yourOrders')}</Text>
      <VStack spacing={4} align="start">
        {waiterOrders.map(order => (
          <Box key={order.id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between">
              <Text>{t('table')} {order.table} - {order.status}</Text>
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
            <Button mt={4} colorScheme="blue" size="sm">
              {t('updateStatus')}
            </Button>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default WaiterOrderList;
