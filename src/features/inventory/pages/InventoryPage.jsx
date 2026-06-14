import React from 'react';
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import InventoryManagement from '../components/InventoryManagement';
import PurchaseOrders from '../components/PurchaseOrders';

function InventoryPage() {
  return (
    <Box p={4}>
      <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
        <TabList mb={4}>
          <Tab>Inventario</Tab>
          <Tab>Pedidos a proveedores</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}><InventoryManagement /></TabPanel>
          <TabPanel p={0}><PurchaseOrders /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default InventoryPage;
