import React from 'react';
import { Box } from '@chakra-ui/react';
import InventoryManagement from '../components/InventoryManagement';

function InventoryPage() {
  return (
    <Box p={4}>
      <InventoryManagement />
    </Box>
  );
}

export default InventoryPage;
