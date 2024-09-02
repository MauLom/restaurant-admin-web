import React from 'react';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const paymentQueue = [
  { id: 1, table: 'T2', total: 45.00, tip: 5.00 },
  { id: 2, table: 'T5', total: 60.00, tip: 10.00 }
];

function PaymentQueue({ onSelectTable }) {
  const { t } = useLanguage();

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('tablesReadyForPayment')}</Text>
      <VStack spacing={4} align="start">
        {paymentQueue.map(order => (
          <Box key={order.id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between">
              <Text>{t('table')} {order.table} - {t('total')}: ${order.total.toFixed(2)} - {t('tip')}: ${order.tip.toFixed(2)}</Text>
              <Button colorScheme="green" size="sm" onClick={() => onSelectTable(order)}>
                {t('processPayment')}
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default PaymentQueue;
