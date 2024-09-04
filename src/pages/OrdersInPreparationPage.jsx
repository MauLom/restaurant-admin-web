import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import api from '../services/api';

function OrdersPreparationPage() {
  const [orders, setOrders] = useState([]);
  const preparationAreas = ['kitchen', 'bar']; 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch all orders that are not fully ready
        const response = await api.get('/orders?kitchen=true'); // Fetch kitchen/bar orders
        const filteredOrders = response.data.filter(order => order.status !== 'ready');
        setOrders(filteredOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  // Function to update the status of a specific item within an order
  const handleMarkItemAsReady = async (orderId, itemId) => {
    try {
      // Call the backend to update the item's status to 'ready'
      const response = await api.put(`/orders/${orderId}/items/${itemId}`, { status: 'ready' });

      // Update the frontend with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.itemId === itemId ? { ...item, status: 'ready' } : item
                ),
                status: response.data.status, // Update the order status if it's fully ready
              }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  // Group orders by area
  const groupedOrders = preparationAreas.map((area) => ({
    area,
    orders: orders.filter((order) => order.items.some((item) => item.area === area)),
  }));

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Orders in Preparation</Text>
      <Tabs variant="soft-rounded" colorScheme="teal">
        <TabList>
          {groupedOrders.map((group) => (
            <Tab key={group.area}>{group.area.charAt(0).toUpperCase() + group.area.slice(1)}</Tab>
          ))}
        </TabList>

        <TabPanels>
          {groupedOrders.map((group) => (
            <TabPanel key={group.area}>
              <VStack spacing={4}>
                {group.orders.map((order) => (
                  <Box key={order._id} p={4} bg="gray.800" color="white" borderRadius="md" width="full">
                    <Text fontSize="lg">Order #{order._id}</Text>
                    <VStack spacing={2} mt={2}>
                      {order.items
                        .filter((item) => item.area === group.area) // Only show items from the current area
                        .map((item, index) => (
                          <HStack key={index} justifyContent="space-between" width="full">
                            <Text>{item.name} (x{item.quantity})</Text>
                            <HStack>
                              <Text>{item.status}</Text>
                              <Button
                                colorScheme="green"
                                onClick={() => handleMarkItemAsReady(order._id, item.itemId)}
                                isDisabled={item.status === 'ready'}
                              >
                                Mark as Ready
                              </Button>
                            </HStack>
                          </HStack>
                        ))}
                    </VStack>
                    {order.status === 'ready' && (
                      <Text fontSize="sm" color="green.500">Order is fully ready!</Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default OrdersPreparationPage;
