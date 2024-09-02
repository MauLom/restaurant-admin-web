import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const popularItems = [
  { name: 'Steak', orders: 50 },
  { name: 'Wine', orders: 45 },
  { name: 'Salad', orders: 40 }
];

function PopularItems() {
  const { t } = useLanguage();

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
