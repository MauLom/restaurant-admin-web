import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, VStack, HStack, Tag, Button, Input, Checkbox, Divider } from '@chakra-ui/react';
import api from '../../../services/api';
import PaymentMethodSelector from './PaymentMethodSelector';
import { useCustomToast } from '../../../hooks/useCustomToast';

function OrderCard({ order, onPaid }) {
  const toast = useCustomToast();
  const [tip, setTip] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateSubtotal = useCallback(() => {
    const selected = order.items.filter(item => selectedItems.includes(item.itemId));
    return selected.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [order.items, selectedItems]);

  const handlePaySelectedItems = async () => {
    try {
      const payload = {
        itemsToPay: selectedItems,
        paymentMethods,
        tip: parseFloat(tip) || 0,
      };
      await api.post(`/orders/partial-payment/${order._id}`, payload);

      toast({
        title: 'Pago parcial realizado',
        description: `Se pagaron ${selectedItems.length} ítems exitosamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (onPaid) onPaid();
    } catch (error) {
      console.error('Error al procesar el pago parcial:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar el pago parcial.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (selectedItems.length > 0) {
      const subtotal = calculateSubtotal();
      setPaymentMethods([{ method: '', amount: subtotal }]);
    } else {
      setPaymentMethods([]);
    }
  }, [selectedItems, calculateSubtotal]);

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <HStack justify="space-between">
        <Text fontWeight="bold">Orden #{order._id.slice(-4)}</Text>
        <Tag colorScheme={order.status === 'ready' ? 'green' : 'orange'}>
          {order.status === 'ready' ? 'Lista' : 'En preparación'}
        </Tag>
      </HStack>

      <Text fontSize="sm" color="gray.400">
        Total de la orden: ${order.total.toFixed(2)}
      </Text>

      <VStack align="start" mt={2} spacing={2}>
        {order.items.map((item, idx) => (
          <Box key={idx} p={2} bg={item.paid ? 'gray.700' : 'gray.800'} borderRadius="md" width="100%">
            <HStack justify="space-between">
              <Text fontWeight="semibold">{item.name}</Text>
              <Text fontSize="sm">{item.quantity} x ${item.price.toFixed(2)}</Text>
            </HStack>

            {!item.paid ? (
              <Checkbox
                size="sm"
                colorScheme="teal"
                isChecked={selectedItems.includes(item.itemId)}
                onChange={() => handleItemToggle(item.itemId)}
              >
                Seleccionar para cobrar
              </Checkbox>
            ) : (
              <Tag size="sm" colorScheme="blue" mt={1}>Pagado</Tag>
            )}
          </Box>
        ))}
      </VStack>

      {selectedItems.length > 0 && (
        <>
          <Divider my={3} />
          <Text fontWeight="bold">
            Subtotal: ${calculateSubtotal().toFixed(2)}
          </Text>

          <Input
            type="number"
            mt={3}
            placeholder="Propina opcional"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            size="sm"
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.400' }}
          />

          <PaymentMethodSelector
            paymentMethods={paymentMethods}
            setPaymentMethods={setPaymentMethods}
            expectedTotal={calculateSubtotal() + parseFloat(tip || 0)}
          />

          <Button
            colorScheme="green"
            onClick={handlePaySelectedItems}
            mt={2}
            isDisabled={paymentMethods.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0) !== (calculateSubtotal() + parseFloat(tip || 0))}
          >
            💳 Pagar ítems seleccionados
          </Button>
        </>
      )}
    </Box>
  );
}

export default OrderCard;
