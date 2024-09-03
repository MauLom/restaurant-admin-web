import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

function PaymentDetail({ order, onPaymentComplete }) {
  const { t } = useLanguage();

  const handlePaymentComplete = async () => {
    try {
      // Update the order status to 'sent to cashier' or another appropriate status
      await api.put(`/orders/${order.id}`, { status: 'sent to cashier' });

      // Optionally, update the table status to 'available' after payment
      await api.put(`/tables/${order.tableId}/status`, { status: 'available' });

      onPaymentComplete(); // Trigger the payment complete callback
    } catch (error) {
      console.error('Error completing payment:', error);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mt={4}>
      <Text fontSize="2xl" mb={4}>{t('paymentDetailsForTable')} {order.table}</Text>
      <VStack align="start" spacing={4}>
        <Text>{t('total')}: ${order.total.toFixed(2)}</Text>
        <Text>{t('tip')}: ${order.tip.toFixed(2)}</Text>
        <Text>{t('grandTotal')}: ${(order.total + order.tip).toFixed(2)}</Text>
        <Button colorScheme="blue" onClick={handlePaymentComplete}>
          {t('confirmPayment')}
        </Button>
      </VStack>
    </Box>
  );
}

export default PaymentDetail;
