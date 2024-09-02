import React from 'react';
import { Box } from '@chakra-ui/react';
import DailySummary from '../components/DailySummary';
import PopularItems from '../components/PopularItems';

function AnalyticsPage() {
  return (
    <Box p={4}>
      <DailySummary />
      <PopularItems />
    </Box>
  );
}

export default AnalyticsPage;
