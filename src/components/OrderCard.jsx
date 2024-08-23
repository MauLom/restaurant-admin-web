import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Stack, Badge
} from '@chakra-ui/react';

const OrderCard = ({ order, onUpdateStatus, onClick }) => {
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item?.quantity * (item?.itemId?.price || 0)), 0);  // Updated to use `price`
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
      case 'In Preparation':
        return 'orange';
      case 'Ready for Delivery':
        return 'blue';
      case 'Delivered':
        return 'green';
      case 'Updated':
        return 'yellow';
      default:
        return 'gray';
    }
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
      onClick={onClick}  // Ensure this is passed correctly from the parent
    >
      <Stack direction="row" justifyContent="space-between">
        <Heading as="h3" size="md" mb={2} fontSize="lg">Order #...{getShortOrderId(order._id)}</Heading>
        <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>
      </Stack>

      <Text>Items:</Text>
      <Box ml={2} maxH="150px" overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead className="table-header">
            <Tr>
              <Th>Cnt.</Th>
              <Th>Nombre</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item, index) => (
              <Tr key={index} bg={item.delivered ? 'red.100' : 'green.100'}>
                <Td>{item?.quantity}</Td>
                <Td>{item?.itemId?.name || 'Unknown'}</Td>
                <Td>${(item?.quantity * (item?.itemId?.price || 0)).toFixed(2)}</Td>  
              </Tr>
            ))}
          </Tbody>

        </Table>
      </Box>
      <Text fontWeight="bold" textAlign="right">Costo Total: ${total.toFixed(2)}</Text>

      {/* Conditional buttons based on the order status */}
      {order.status === 'In Preparation' && (
        <Flex mt={2} justifyContent="space-between">
          <Button colorScheme="blue" size="sm" onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'Ready for Delivery'); }}>
            Mover a lista para entregar
          </Button>
        </Flex>
      )}

      {order.status === 'Ready for Delivery' && (
        <Flex mt={2} justifyContent="space-between">
          <Button colorScheme="green" size="sm" onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'Delivered'); }}>
            Marcar como entregada
          </Button>
        </Flex>
      )}

      {order.status === 'Updated' && (
        <Flex mt={2} justifyContent="space-between">
          <Button colorScheme="yellow" size="sm" onClick={(e) => { e.stopPropagation(); onUpdateStatus(order._id, 'Ready for Delivery'); }}>
            Procesar nuevos items
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default OrderCard;
