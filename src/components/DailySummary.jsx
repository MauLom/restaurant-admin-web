import React, { useState, useEffect } from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

function DailySummary() {
  const { t } = useLanguage();
  const [dailyData, setDailyData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    customersServed: 0
  });

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const response = await api.get('/analytics/daily-summary');
        setDailyData(response.data);
      } catch (error) {
        console.error('Error fetching daily summary:', error);
      }
    };

    fetchDailySummary();
  }, []);

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
