import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

function PaymentDetail({ order, onPaymentComplete }) {
  const { t } = useLanguage();

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mt={4}>
      <Text fontSize="2xl" mb={4}>{t('paymentDetailsForTable')} {order.table}</Text>
      <VStack align="start" spacing={4}>
        <Text>{t('total')}: ${order.total.toFixed(2)}</Text>
        <Text>{t('tip')}: ${order.tip.toFixed(2)}</Text>
        <Text>{t('grandTotal')}: ${(order.total + order.tip).toFixed(2)}</Text>
        <Button colorScheme="blue" onClick={onPaymentComplete}>
          {t('confirmPayment')}
        </Button>
      </VStack>
    </Box>
  );
}

export default PaymentDetail;
