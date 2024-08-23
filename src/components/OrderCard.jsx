import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Stack, Badge,
  useDisclosure, AlertDialog, AlertDialogBody, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';

const OrderCard = ({ order, onProcess, onUpdateStatus, onClick }) => {
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item?.quantity * (item?.itemId?.sellPrice || 0)), 0);
  };

  useEffect(() => {
    setTotal(order.totalPrice || calculateTotal(order.items));
    setItems(order.items);
  }, [order]);

  const getShortOrderId = (orderId) => {
    return orderId.slice(-3); // Get the last 3 characters of the order ID
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processed':
        return 'blue';
      case 'Paid':
        return 'green';
      case 'Delivered':
        return 'orange';
      case 'Awaiting Change':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const handleUpdateStatus = (newStatus) => {
    onUpdateStatus(order._id, newStatus);
    onClose();
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      w="full"
      maxW="sm"
      bg="white"
      cursor="pointer"
      onClick={() => onClick(order)}
    >
      <Stack direction="row" justifyContent="space-between">
        <Heading as="h3" size="md" mb={2} fontSize="lg">Orden #...{getShortOrderId(order._id)}</Heading>
        <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>
      </Stack>

      <Text>Items:</Text>
      <Box ml={2} maxH="150px" overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead className="table-header">
            <Tr>
              <Th>Cantidad</Th>
              <Th>Nombre</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.slice(0, 5).map((item, index) => (
              <Tr key={index} className="table-row">
                <Td>{item?.quantity}</Td>
                <Td>{item?.itemId?.name || 'Unknown'}</Td>
                <Td>${(item?.quantity * (item?.itemId?.sellPrice || 0)).toFixed(2)}</Td>
              </Tr>
            ))}
            {items.length > 5 && (
              <Tr>
                <Td colSpan={3} textAlign="center">and more...</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      <Text fontWeight="bold" textAlign="right">Costo total: ${total.toFixed(2)}</Text>

      {/* Conditional buttons based on the order status */}
      {order.status !== 'Paid' && (
        <Flex mt={2} justifyContent="space-between">
          {order.status === 'Pending' && (
            <Button colorScheme="blue" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateStatus('Delivered'); }}>
              Marca orden entregada
            </Button>
          )}
          {order.status === 'Delivered' && (
            <Button colorScheme="yellow" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdateStatus('Awaiting Change'); }}>
              Marca esperando cambios
            </Button>
          )}
          {order.status === 'Awaiting Change' && (
            <Button colorScheme="green" size="sm" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
              Marca orden pagada
            </Button>
          )}
        </Flex>
      )}

      {/* Dialog to confirm order payment */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Marca orden pagada
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Como se pagara la orden?
              <Flex direction="column" mt={4}>
                <Button mb={2} onClick={() => handleUpdateStatus('Paid')}>Pago en Transferencia</Button>
                <Button mb={2} onClick={() => handleUpdateStatus('Paid')}>Pago con Tarjeta</Button>
                <Button mb={2} onClick={() => handleUpdateStatus('Paid')}>Pago en Efectivo</Button>
                <Button mb={2} onClick={() => handleUpdateStatus('Paid')}>Cortesia</Button>
                <Button onClick={onClose}>Volver</Button>
              </Flex>
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default OrderCard;
