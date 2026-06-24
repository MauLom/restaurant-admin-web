import React, { useState, useEffect } from 'react';
import {
  Box, Text, HStack, Input, VStack, Divider, Spinner, Stat, StatLabel, StatNumber, SimpleGrid, Heading
} from '@chakra-ui/react';
import api from '../../../services/api';
import dayjs from 'dayjs';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';

function AnalyticsPage() {
  const toast = useCustomToast();
  const { t } = useLanguage();

  const initialStartDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const initialEndDate = dayjs().format('YYYY-MM-DD');

  const [salesData, setSalesData] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [waiterTips, setWaiterTips] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const [salesRes, summaryRes, tipsRes, itemsRes] = await Promise.all([
          api.get(`/analytics/sales-summary?startDate=${startDate}&endDate=${endDate}`),
          api.get('/analytics/daily-summary'),
          api.get(`/analytics/waiter-tips?startDate=${startDate}&endDate=${endDate}`),
          api.get(`/analytics/popular-items?startDate=${startDate}&endDate=${endDate}`)
        ]);

        setSalesData(salesRes.data);
        setDailySummary(summaryRes.data);
        setWaiterTips(tipsRes.data);
        setPopularItems(itemsRes.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: t('errorTitle'),
          description: t('analyticLoadError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [startDate, endDate, toast]);

  const formatCurrency = (amount) => `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <Box color="white" p={6} maxW="container.xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color="teal.200">📊 {t('analyticsTitle')}</Heading>

        <HStack spacing={4} wrap="wrap">
          <Box>
            <Text fontWeight="bold">{t('startDateLabel')}</Text>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
          </Box>
          <Box>
            <Text fontWeight="bold">{t('endDateLabel')}</Text>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
          </Box>
        </HStack>

        {loading ? (
          <HStack justify="center" mt={10}><Spinner size="xl" color="teal.300" /></HStack>
        ) : (
          <VStack spacing={6}>
            <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={6}>
              <Stat bg="gray.700" p={4} borderRadius="lg">
                <StatLabel>{t('totalSalesLabel')}</StatLabel>
                <StatNumber>{formatCurrency(salesData?.totalRevenue)}</StatNumber>
              </Stat>
              <Stat bg="gray.700" p={4} borderRadius="lg">
                <StatLabel>{t('totalTipsLabel')}</StatLabel>
                <StatNumber>{formatCurrency(salesData?.totalTips)}</StatNumber>
              </Stat>
              <Stat bg="gray.700" p={4} borderRadius="lg">
                <StatLabel>{t('totalGeneralLabel')}</StatLabel>
                <StatNumber>{formatCurrency(salesData?.grandTotal)}</StatNumber>
              </Stat>
              <Stat bg="gray.700" p={4} borderRadius="lg">
                <StatLabel>{t('customersServedLabel')}</StatLabel>
                <StatNumber>{dailySummary?.totalGuests || 0}</StatNumber>
              </Stat>
            </SimpleGrid>

            {/* Métodos de pago */}
            <Divider borderColor="gray.600" />
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={2} color="teal.200">💳 {t('paymentMethodsHeading')}</Text>
              <VStack align="start" spacing={1}>
                {salesData?.paymentBreakdown ? (
                  Object.entries(salesData.paymentBreakdown).map(([method, amount], idx) => (
                    <Text key={idx}>{method.toUpperCase()}: {formatCurrency(amount)}</Text>
                  ))
                ) : (
                  <Text>{t('noPaymentData')}</Text>
                )}
              </VStack>
            </Box>

            <Divider borderColor="gray.600" />
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={2} color="teal.200">🍽️ {t('tipsByWaiterHeading')}</Text>
              <VStack align="start" spacing={1}>
                {waiterTips.length > 0 ? waiterTips.map((w, idx) => (
                  <Text key={idx}>{w.waiter}: {formatCurrency(w.tip)}</Text>
                )) : <Text>{t('noTipsRecorded')}</Text>}
              </VStack>
            </Box>

            <Divider borderColor="gray.600" />
            <Box>
              <Text fontSize="xl" fontWeight="bold" mb={2} color="teal.200">🏆 {t('topProductsHeading')}</Text>
              <VStack align="start" spacing={1}>
                {popularItems.length > 0 ? popularItems.map((item, idx) => (
                  <Text key={idx}>{item.name}: {item.orders} unidades</Text>
                )) : <Text>{t('noPopularProducts')}</Text>}
              </VStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default AnalyticsPage;
