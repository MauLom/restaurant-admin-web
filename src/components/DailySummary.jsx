import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const dailyData = {
  totalOrders: 120,
  totalRevenue: 3000,
  customersServed: 100
};

function DailySummary() {
  const { t } = useLanguage();

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="2xl" mb={4}>{t('dailySummary')}</Text>
      <VStack align="start" spacing={4}>
        <Text>{t('totalOrders')}: {dailyData.totalOrders}</Text>
        <Text>{t('totalRevenue')}: ${dailyData.totalRevenue.toFixed(2)}</Text>
        <Text>{t('customersServed')}: {dailyData.customersServed}</Text>
      </VStack>
    </Box>
  );
}

export default DailySummary;
