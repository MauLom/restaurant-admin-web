import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Tag,
  Button,
  useToast,
} from '@chakra-ui/react';
import api from '../../../services/api';

function OrderCard({ order, onPaid }) {
  const toast = useToast();

  const handlePayOrder = async () => {
    try {
      await api.post(`/orders/pay/${order._id}`, {
        tip: 0,
        paymentMethods: [{ method: 'cash', amount: order.total }]
      });

      toast({
        title: 'Orden pagada',
        description: `La orden fue pagada correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onPaid) onPaid(); // Notificar al padre que se pagó
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago de esta orden.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <HStack justify="space-between">
        <Text fontWeight="bold">Orden #{order._id.slice(-4)}</Text>
        <Tag colorScheme={order.status === 'ready' ? 'green' : 'orange'}>
          {order.status.toUpperCase()}
        </Tag>
      </HStack>

      <Text fontSize="sm" color="gray.500">Total: ${order.total.toFixed(2)}</Text>

      <VStack align="start" mt={2}>
        {order.items.map((item, idx) => (
          <Text key={idx}>• {item.quantity} x {item.name}</Text>
        ))}
      </VStack>

      {order.status === 'ready' && !order.paid && (
        <Button mt={4} colorScheme="blue" onClick={handlePayOrder}>
          💳 Pagar esta orden
        </Button>
      )}

      {order.paid && (
        <Tag mt={4} colorScheme="blue">Pagada</Tag>
      )}
    </Box>
  );
}

export default OrderCard;
