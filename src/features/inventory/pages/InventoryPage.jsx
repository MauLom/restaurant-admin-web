import React from 'react';
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import InventoryManagement from '../components/InventoryManagement';
import PurchaseOrders from '../components/PurchaseOrders';

function InventoryPage() {
  const { t } = useLanguage();
  return (
    <Box p={4}>
      <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
        <TabList mb={4}>
          <Tab>{t('inventoryTabLabel')}</Tab>
          <Tab>{t('purchaseOrdersTabLabel')}</Tab>
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
