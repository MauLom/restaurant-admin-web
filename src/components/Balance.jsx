import React from 'react';
import { Box, Heading, Text, VStack, HStack } from '@chakra-ui/react';

const Balance = ({ orders }) => {
  const calculateTotalIncome = () => {
    return orders.reduce((total, order) => {
      return total + order.items.reduce((orderTotal, item) => {
        return orderTotal + (item.itemId.sellPrice * item.quantity);
      }, 0);
    }, 0);
  };

  const calculateRestockCost = () => {
    return orders.reduce((total, order) => {
      return total + order.items.reduce((orderTotal, item) => {
        return orderTotal + (item.itemId.costAmount * item.quantity);
      }, 0);
    }, 0);
  };

  const calculateProfit = () => {
    return calculateTotalIncome() - calculateRestockCost();
  };

  const calculatePaymentMethodTotal = (method) => {
    return orders
      .filter(order => order.paymentMethod === method)
      .reduce((total, order) => {
        return total + order.items.reduce((orderTotal, item) => {
          return orderTotal + (item.itemId.sellPrice * item.quantity);
        }, 0);
      }, 0);
  };

  const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Cortesia'];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Heading size="lg" mb={4} textAlign="center">Balance Detallado</Heading>
      <VStack spacing={4} align="stretch">
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="teal.100">
          <HStack justify="space-between">
            <Text fontWeight="bold">Ingreso Total:</Text>
            <Text>${calculateTotalIncome().toFixed(2)}</Text>
          </HStack>
        </Box>
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="orange.100">
          <HStack justify="space-between">
            <Text fontWeight="bold">Costo de Restock:</Text>
            <Text>${calculateRestockCost().toFixed(2)}</Text>
          </HStack>
        </Box>
        <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="green.100">
          <HStack justify="space-between">
            <Text fontWeight="bold">Profit:</Text>
            <Text>${calculateProfit().toFixed(2)}</Text>
          </HStack>
        </Box>
        {paymentMethods.map(method => (
          <Box key={method} p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="purple.100">
            <HStack justify="space-between">
              <Text fontWeight="bold">Total en {method}:</Text>
              <Text>${calculatePaymentMethodTotal(method).toFixed(2)}</Text>
            </HStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Balance;
