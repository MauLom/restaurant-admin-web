import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import WaiterDailySummary from '../components/WaiterDailySummary';

function WaiterAnalyticsPage() {
  return (
    <Box p={6} maxW="container.md" mx="auto">
      <Heading size="lg" mb={4}>📊 Tus Analíticas</Heading>
      <WaiterDailySummary />
    </Box>
  );
}

export default WaiterAnalyticsPage;
