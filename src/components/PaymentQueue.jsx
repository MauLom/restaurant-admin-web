import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

function PaymentQueue({ onSelectTable }) {
  const { t } = useLanguage();
  const [paymentQueue, setPaymentQueue] = useState([]);

  useEffect(() => {
    const fetchPaymentQueue = async () => {
      try {
        const response = await api.get('/orders?status=ready'); // Fetch orders ready for payment
        const orders = response.data.map(order => ({
          id: order._id,
          table: order.tableId.number,
          total: order.total,
          tip: 0 // Assuming the tip isn't included in the order data
        }));
        setPaymentQueue(orders);
      } catch (error) {
        console.error('Error fetching payment queue:', error);
      }
    };

    fetchPaymentQueue();
  }, []);

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
