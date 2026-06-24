import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import WaiterDailySummary from '../components/WaiterDailySummary';
import { useLanguage } from '../../../context/LanguageContext';

function WaiterAnalyticsPage() {
  const { t } = useLanguage();
  return (
    <Box p={6} maxW="container.md" mx="auto">
      <Heading size="lg" mb={4}>📊 {t('yourAnalyticsTitle')}</Heading>
      <WaiterDailySummary />
    </Box>
  );
}

export default WaiterAnalyticsPage;
