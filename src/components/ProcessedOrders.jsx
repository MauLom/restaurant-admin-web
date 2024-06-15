import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, useBreakpointValue, SimpleGrid, Stack, Text, Input
} from '@chakra-ui/react';

const ProcessedOrders = ({ processedOrders, onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    onDateChange(selectedDate);
  }, []);

  const handleDateChange = (e) =>{
    setSelectedDate(e.target.value);
    onDateChange(e.target.value);

  }
  const calculateOpenTime = (createdAt, statusChangedAt) => {
    const createdDate = new Date(createdAt);
    const changedDate = new Date(statusChangedAt);
    const diffMs = Math.abs(changedDate - createdDate); // Difference in milliseconds
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60)); // Difference in hours
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)); // Difference in minutes
    return `${diffHrs}h ${diffMins}m`;
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box mt={8}>
      <Heading size="md" mb={4}>Órdenes Procesadas</Heading>
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e)}
        mb={4}
      />
      {isMobile ? (
        <SimpleGrid columns={{ base: 1 }} spacing={4}>
          {processedOrders.map(order => (
            <Box key={order._id} p={4} borderWidth="1px" borderRadius="lg" overflow="hidden" boxShadow="lg">
              <Stack spacing={2}>
                <Text><strong>Order ID:</strong> {order._id}</Text>
                <Text><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</Text>
                <Text><strong>Created By:</strong> {order.createdBy.username}</Text>
                <Text><strong>Payment:</strong> {order.paymentMethod}</Text>
                <Text><strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}</Text>
                <Text><strong>Updated:</strong> {new Date(order.statusChangedAt).toLocaleString()}</Text>
                <Text><strong>Status:</strong> {order.status}</Text>
                <Text><strong>Open Time:</strong> {calculateOpenTime(order.createdAt, order.statusChangedAt)}</Text>
                <Text><strong>People:</strong> {order.numberOfPeople}</Text>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Table variant="simple" mx="auto" maxW="80%">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Total</Th>
              <Th>Created By</Th>
              <Th>Payment</Th>
              <Th>Created</Th>
              <Th>Updated</Th>
              <Th>Status</Th>
              <Th>Open Time</Th>
              <Th>People</Th>
            </Tr>
          </Thead>
          <Tbody>
            {processedOrders.map(order => (
              <Tr key={order._id}>
                <Td>{order._id}</Td>
                <Td>${order.totalPrice.toFixed(2)}</Td>
                <Td>{order.createdBy.username}</Td>
                <Td>{order.paymentMethod}</Td>
                <Td>{new Date(order.createdAt).toLocaleString()}</Td>
                <Td>{new Date(order.statusChangedAt).toLocaleString()}</Td>
                <Td>{order.status}</Td>
                <Td>{calculateOpenTime(order.createdAt, order.statusChangedAt)}</Td>
                <Td>{order.numberOfPeople}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ProcessedOrders;
