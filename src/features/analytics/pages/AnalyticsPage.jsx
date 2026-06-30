import React, { useState, useEffect } from 'react';
import {
  Box, Text, HStack, Input, VStack, Spinner, SimpleGrid, Heading
} from '@chakra-ui/react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../../../services/api';
import dayjs from 'dayjs';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

const CHART_COLORS = ['#6B8DE3', '#63C9B2', '#F6AD55', '#FC8181', '#B794F4', '#68D391'];

function AnalyticsPage() {
  const toast = useCustomToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

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
  }, [startDate, endDate, toast, t]);

  if (!currentTheme) return null;
  const c = currentTheme.colors;

  const formatCurrency = (amount) =>
    `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const kpiCards = [
    { label: t('totalSalesLabel'), value: formatCurrency(salesData?.totalRevenue), accent: '#63C9B2', icon: '💰' },
    { label: t('totalTipsLabel'), value: formatCurrency(salesData?.totalTips), accent: '#F6AD55', icon: '🤝' },
    { label: t('totalGeneralLabel'), value: formatCurrency(salesData?.grandTotal), accent: '#6B8DE3', icon: '📊' },
    { label: t('customersServedLabel'), value: dailySummary?.totalGuests ?? 0, accent: '#B794F4', icon: '👥' },
  ];

  const paymentChartData = salesData?.paymentBreakdown
    ? Object.entries(salesData.paymentBreakdown).map(([method, amount]) => ({
        name: method.charAt(0).toUpperCase() + method.slice(1),
        value: amount,
      }))
    : [];

  const itemsChartData = popularItems.map((item) => ({
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
    <Box color={c.text} p={6} maxW="container.xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" color={c.primary[500]}>📊 {t('analyticsTitle')}</Heading>

        <HStack spacing={4} wrap="wrap">
          <Box>
            <Text fontWeight="bold" mb={1}>{t('startDateLabel')}</Text>
            <Input
              type="date"
              value={startDate}
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

            {/* Charts */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>

              {/* Payment methods donut */}
              <Box bg={c.surface} borderRadius="xl" p={5} boxShadow="md">
                <Text fontSize="lg" fontWeight="bold" mb={4} color={c.primary[500]}>
                  💳 {t('paymentMethodsHeading')}
                </Text>
                {paymentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentChartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => formatCurrency(val)}
                        contentStyle={tooltipStyle}
                      />
                      <Legend wrapperStyle={{ color: c.text, fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Text opacity={0.5}>{t('noPaymentData')}</Text>
                )}
              </Box>

              {/* Popular items horizontal bar */}
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
            </SimpleGrid>

            {/* Tips by waiter — styled list, no chart */}
            <Box bg={c.surface} borderRadius="xl" p={5} boxShadow="md">
              <Text fontSize="lg" fontWeight="bold" mb={4} color={c.primary[500]}>
                🍽️ {t('tipsByWaiterHeading')}
              </Text>
              {waiterTips.length > 0 ? (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                  {waiterTips.map((w, idx) => (
                    <HStack
                      key={idx}
                      bg={c.background}
                      borderRadius="lg"
                      p={3}
                      justify="space-between"
                    >
                      <HStack spacing={2}>
                        <Box
                          w={7}
                          h={7}
                          borderRadius="full"
                          bg={CHART_COLORS[idx % CHART_COLORS.length]}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          color="white"
                          flexShrink={0}
                        >
                          {idx + 1}
                        </Box>
                        <Text fontWeight="medium" fontSize="sm">{w.waiter}</Text>
                      </HStack>
                      <Text fontWeight="bold" color={CHART_COLORS[idx % CHART_COLORS.length]}>
                        {formatCurrency(w.tip)}
                      </Text>
                    </HStack>
                  ))}
                </SimpleGrid>
              ) : (
                <Text opacity={0.5}>{t('noTipsRecorded')}</Text>
              )}
            </Box>

          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default AnalyticsPage;
