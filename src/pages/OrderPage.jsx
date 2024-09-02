import React from 'react';
import { Box } from '@chakra-ui/react';
import OrderManagement from '../components/OrderManagement';

function OrderPage() {
  return (
    <Box p={4}>
      <OrderManagement />
    </Box>
  );
}

export default OrderPage;
