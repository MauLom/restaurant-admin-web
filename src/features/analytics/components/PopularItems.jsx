import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

function PopularItems() {
  const { t } = useLanguage();
  const [popularItems, setPopularItems] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalTableSessions, setTotalTableSessions] = useState(0);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const response = await api.get('/analytics/popular-items');
        setPopularItems(response.data.items);
        setTotalOrders(response.data.totalOrders);
        setTotalTableSessions(response.data.totalTableSessions);
      } catch (error) {
        console.error('Error fetching popular items:', error);
      }
    };

    fetchPopularItems();
  }, []);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mt={8}>
      <Text fontSize="2xl" mb={4}>{t('popularItems')}</Text>
      <VStack align="start" spacing={4}>
        <Text>{t('totalOrders')}: {totalOrders}</Text>
        <Text>{t('totalTableSessions')}: {totalTableSessions}</Text>
        {popularItems.map((item, index) => (
          <HStack key={index} justify="space-between" width="full">
            <Text>{item.name}</Text>
            <Text>{item.orders} {t('orders')}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

export default PopularItems;
