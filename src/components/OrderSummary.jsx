import React from 'react';
import { Box, VStack, HStack, Text, Button, Divider, IconButton } from '@chakra-ui/react';
import { FaTrashAlt } from 'react-icons/fa';

function OrderSummary({ orderItems, total, onRemoveItem, onSubmit }) {
  return (
    <Box p={4} bg="gray.800" color="white" borderRadius="md" width="full">
      <Text fontSize="lg" mb={4}>Order Summary</Text>
      <VStack spacing={4} mb={4}>
        {orderItems.map(item => (
          <HStack key={item.itemId} justifyContent="space-between" width="full">
            <Text>{item.name} (x{item.quantity})</Text>
            <HStack>
              <Text>${(item.price * item.quantity).toFixed(2)}</Text>
              <IconButton icon={<FaTrashAlt />} size="sm" onClick={() => onRemoveItem(item.itemId)} />
            </HStack>
          </HStack>
        ))}
      </VStack>
      <Divider mb={4} />
      <HStack justifyContent="space-between">
        <Text>Total</Text>
        <Text>${total.toFixed(2)}</Text>
      </HStack>
      <HStack mt={4} spacing={4}>
        <Button colorScheme="blue" onClick={onSubmit}>Submit Order</Button>
        <Button>Comments</Button>
      </HStack>
    </Box>
  );
}

export default OrderSummary;
