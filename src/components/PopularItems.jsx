import React, { useState, useEffect } from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

function PopularItems() {
  const { t } = useLanguage();
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        const response = await api.get('/analytics/popular-items');
        setPopularItems(response.data);
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
        {popularItems.map((item, index) => (
          <Text key={index}>{item.name} - {item.orders} {t('orders')}</Text>
        ))}
      </VStack>
    </Box>
  );
}

export default PopularItems;
