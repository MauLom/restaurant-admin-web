// OrdersSummary.js
import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, HStack, Button, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from '@chakra-ui/react';
import api from '../services/api';

function OrdersSummary({ tableId, refreshTrigger, onOrderUpdated }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);
  const [reason, setReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      // Se asume que el endpoint GET /orders admite filtrar por tableId
      const response = await api.get(`/orders?tableId=${tableId}`);
      setOrders(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las órdenes de la mesa',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (tableId) {
      fetchOrders();
    }
  }, [tableId, refreshTrigger]);

  // Función para abrir el modal de edición/cancelación para un ítem
  const handleEditItem = (orderId, item) => {
    // Por ejemplo, si se quiere cancelar el ítem
    setSelectedOrderItem({ orderId, item });
    setReason('');
    setIsModalOpen(true);
  };

  // Función para enviar la actualización (por ejemplo, cancelar el ítem)
  const handleUpdateItemStatus = async () => {
    try {
      await api.put(`/orders/${selectedOrderItem.orderId}/items/${selectedOrderItem.item.itemId}`, {
        status: 'cancelled',
        reason,
      });
      toast({
        title: 'Ítem actualizado',
        description: 'Se actualizó el estado del ítem correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsModalOpen(false);
      setSelectedOrderItem(null);
      fetchOrders();
      // Llamar a un callback para que el padre sepa que se actualizó una orden
      onOrderUpdated && onOrderUpdated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el ítem',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack align="stretch" spacing={4} p={4} borderWidth="1px" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold">Órdenes de la Mesa</Text>
      {orders.length === 0 ? (
        <Text>No hay órdenes en curso.</Text>
      ) : (
        orders.map(order => (
          <Box key={order._id} p={2} borderWidth="1px" borderRadius="md">
            <Text fontWeight="semibold">Orden: {order._id}</Text>
            <Text>Status: {order.status}</Text>
            <Text>Total: ${order.total.toFixed(2)}</Text>
            {order.items.map(item => (
              <HStack key={item.itemId} justify="space-between" mt={2}>
                <Text>
                  {item.name} x {item.quantity} (${(item.price * item.quantity).toFixed(2)})
                </Text>
                {/* Solo permitir edición si el estado no es "delivered" ni "cancelled" */}
                {item.status !== 'delivered' && item.status !== 'cancelled' && (
                  <Button size="sm" colorScheme="yellow" onClick={() => handleEditItem(order._id, item)}>
                    Editar / Cancelar
                  </Button>
                )}
              </HStack>
            ))}
          </Box>
        ))
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar cambio en el ítem</ModalHeader>
          <ModalBody>
            <Textarea 
              placeholder="Especifique el motivo (ej: sin cacahuates)" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleUpdateItemStatus}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default OrdersSummary;
