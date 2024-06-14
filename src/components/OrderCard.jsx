import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Button, Table, Thead, Tbody, Tr, Th, Td, Stack, Badge,
  useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';

const OrderCard = ({ order, onProcess, onClick }) => {
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.quantity * (item.itemId.sellPrice || 0)), 0);
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
      default:
        return 'gray';
    }
  };

  const handleProcessOrder = () => {
    onProcess(order._id);
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
      onClick={() => onClick(order)}
    >
      <Stack direction="row" justifyContent="space-between">
        <Heading as="h3" size="md" mb={2}>Order #...{getShortOrderId(order._id)}</Heading>
        <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>
      </Stack>

      <Text>Items:</Text>
      <Box ml={2} maxH="150px" overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Qty</Th>
              <Th>Item</Th>
              <Th>Total</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.slice(0, 5).map((item, index) => (
              <Tr key={index}>
                <Td>{item.quantity}</Td>
                <Td>{item.itemId.name}</Td>
                <Td>${(item.quantity * (item.itemId.sellPrice || 0)).toFixed(2)}</Td>
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
      <Text fontWeight="bold" textAlign="right">Total Cost: ${total.toFixed(2)}</Text>
      <Flex mt={2}>
        <Button colorScheme="teal" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          Process Order
        </Button>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Process Order
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to process this order?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleProcessOrder} ml={3}>
                Process
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default OrderCard;
