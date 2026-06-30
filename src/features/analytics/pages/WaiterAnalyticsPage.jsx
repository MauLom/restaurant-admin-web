import React, { useState, useEffect } from 'react';
import {
  Box, Text, HStack, Input, VStack, Spinner, SimpleGrid, Heading
} from '@chakra-ui/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../../services/api';
import dayjs from 'dayjs';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

function WaiterAnalyticsPage() {
  const toast = useCustomToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const initialStartDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
  const initialEndDate = dayjs().format('YYYY-MM-DD');

  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/waiter-analytics?startDate=${startDate}&endDate=${endDate}`);
        setData(res.data);
      } catch (error) {
        console.error('Error fetching waiter analytics:', error);
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
    fetchData();
  }, [startDate, endDate, toast, t]);

  if (!currentTheme) return null;
  const c = currentTheme.colors;

  const formatCurrency = (amount) =>
    `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const kpiCards = [
    { label: t('ordersServedLabel'), value: data?.totalOrders ?? 0, accent: '#63C9B2', icon: '🧾' },
    { label: t('customersServedLabel'), value: data?.totalGuests ?? 0, accent: '#B794F4', icon: '👥' },
    { label: t('totalSalesLabel'), value: formatCurrency(data?.totalRevenue), accent: '#6B8DE3', icon: '💰' },
    { label: t('totalTipsLabel'), value: formatCurrency(data?.totalTips), accent: '#F6AD55', icon: '🤝' },
  ];

  const itemsChartData = (data?.popularItems || []).map((item) => ({
    name: item.name,
    orders: item.orders,
  }));

  const tooltipStyle = {
    background: c.surface,
    border: 'none',
    borderRadius: '8px',
    color: c.text,
  };

  return (
    <Box color={c.text} p={6} maxW="container.lg" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color={c.primary[500]}>📊 {t('yourAnalyticsTitle')}</Heading>

        <HStack spacing={4} wrap="wrap">
          <Box>
            <Text fontWeight="bold" mb={1}>{t('startDateLabel')}</Text>
            <Input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              bg={c.surface}
              color={c.text}
              borderColor={c.primary[500]}
            />
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>{t('endDateLabel')}</Text>
            <Input
              type="date"
              value={endDate}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setEndDate(e.target.value)}
              bg={c.surface}
              color={c.text}
              borderColor={c.primary[500]}
            />
          </Box>
        </HStack>

        {loading ? (
          <HStack justify="center" mt={10}>
            <Spinner size="xl" color={c.primary[500]} />
          </HStack>
        ) : (
          <VStack spacing={6} align="stretch">

            {/* KPI Cards */}
            <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4}>
              {kpiCards.map((card, idx) => (
                <Box
                  key={idx}
                  bg={c.surface}
                  borderRadius="xl"
                  p={5}
                  borderLeft="4px solid"
                  borderLeftColor={card.accent}
                  boxShadow="md"
                >
                  <Text fontSize="xl" mb={1}>{card.icon}</Text>
                  <Text fontSize="sm" opacity={0.6} mb={1}>{card.label}</Text>
                  <Text fontSize="2xl" fontWeight="bold">{card.value}</Text>
                </Box>
              ))}
            </SimpleGrid>

            {/* Productos más vendidos por el mesero */}
            <Box bg={c.surface} borderRadius="xl" p={5} boxShadow="md">
              <Text fontSize="lg" fontWeight="bold" mb={4} color={c.primary[500]}>
                🏆 {t('topProductsHeading')}
              </Text>
              {itemsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={itemsChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={`${c.text}20`} horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: c.text, fontSize: 12 }}
                      axisLine={{ stroke: `${c.text}40` }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fill: c.text, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: `${c.text}10` }} />
                    <Bar dataKey="orders" fill={c.primary[500]} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Text opacity={0.5}>{t('noPopularProducts')}</Text>
              )}
            </Box>

          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default WaiterAnalyticsPage;
