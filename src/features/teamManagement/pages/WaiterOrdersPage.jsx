import React from 'react';
import { Box } from '@chakra-ui/react';
import WaiterOrderList from '../components/WaiterOrderList';

function WaiterOrdersPage() {
  return (
    <Box p={4}>
      <WaiterOrderList />
    </Box>
  );
}

export default WaiterOrdersPage;
