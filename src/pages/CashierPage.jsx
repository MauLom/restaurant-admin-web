import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import PaymentQueue from '../components/PaymentQueue';
import PaymentDetail from '../components/PaymentDetail';

function CashierPage() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSelectTable = (order) => {
    setSelectedOrder(order);
  };

  const handlePaymentComplete = () => {
    alert('Payment processed successfully!');
    setSelectedOrder(null);
  };

  return (
    <Box p={4}>
      <PaymentQueue onSelectTable={handleSelectTable} />
      {selectedOrder && <PaymentDetail order={selectedOrder} onPaymentComplete={handlePaymentComplete} />}
    </Box>
  );
}

export default CashierPage;
