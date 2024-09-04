import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Input, Button, HStack } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

function DailySummary() {
  const { t } = useLanguage();
  const [dailyData, setDailyData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalTips: 0,
    businessRevenue: 0,
    customersServed: 0
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const response = await api.get(`/analytics/daily-summary?startDate=${startDate}&endDate=${endDate}`);
        setDailyData(response.data);
      } catch (error) {
        console.error('Error fetching daily summary:', error);
      }
    };

    fetchDailySummary();
  }, [startDate, endDate]);

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="2xl" mb={4}>{t('dailySummary')}</Text>
      <VStack align="start" spacing={4}>
        <HStack>
          <Input
            placeholder={t('startDate')}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            placeholder={t('endDate')}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={() => setEndDate(new Date().toISOString().split('T')[0])}>
            {t('reset')}
          </Button>
        </HStack>
        <Text>{t('totalOrders')}: {dailyData.totalOrders}</Text>
        <Text>{t('totalRevenue')}: ${dailyData.totalRevenue.toFixed(2)}</Text>
        <Text>{t('businessRevenue')}: ${dailyData.businessRevenue.toFixed(2)}</Text>
        <Text>{t('totalTips')}: ${dailyData.totalTips.toFixed(2)}</Text>
        <Text>{t('customersServed')}: {dailyData.customersServed}</Text>
      </VStack>
    </Box>
  );
}

export default DailySummary;
