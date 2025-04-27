import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import api from '../../../services/api';
import { useAuthContext } from '../../../context/AuthContext';
import { io } from 'socket.io-client';

function OrdersPreparationPage() {
  const [orders, setOrders] = useState([]);
  const [preparationAreas, setPreparationAreas] = useState(['kitchen', 'bar']);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders?kitchen=true');
        const filteredOrders = response.data.filter(order => order.status !== 'ready' && order.status !== 'paid');
        setOrders(filteredOrders);
      } catch (error) {
        console.error('Error al obtener órdenes:', error);
      }
    };

    fetchOrders();

    if (user.role !== 'admin') {
      if (user.role === 'bar') {
        setPreparationAreas(['bar']);
      } else if (user.role === 'kitchen') {
        setPreparationAreas(['kitchen']);
      }
    }

    let socketURL = process.env.REACT_APP_API_URL;
    if (socketURL.includes("/api")) socketURL = socketURL.replace("/api", "");
    const socket = io(socketURL);

    socket.on('new-order', (newOrder) => {
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    socket.on('update-order', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user.role]);

  const handleMarkItemAsReady = async (orderId, itemId) => {
    try {
      const response = await api.put(`/orders/${orderId}/items/${itemId}`, { status: 'ready' });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.itemId === itemId ? { ...item, status: 'ready' } : item
                ),
                status: response.data.status,
              }
            : order
        )
      );
    } catch (error) {
      console.error('Error al actualizar el estado del ítem:', error);
    }
  };

  const groupedOrders = preparationAreas.map((area) => ({
    area,
    orders: orders.filter((order) => order.items.some((item) => item.area === area)),
  }));

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Órdenes en Preparación</Text>

      <Tabs variant="soft-rounded" colorScheme="teal">
        <TabList>
          {groupedOrders.map((group) => (
            <Tab key={group.area}>
              {group.area === 'kitchen' ? 'Cocina' : group.area === 'bar' ? 'Barra' : group.area}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {groupedOrders.map((group) => (
            <TabPanel key={group.area}>
              <VStack spacing={4} align="stretch">
                {group.orders.map((order) => (
                  <Box key={order._id} p={4} bg="gray.800" color="white" borderRadius="md">
                    <Text fontSize="lg" mb={2}>Orden #{order._id.substring(order._id.length - 4)}</Text>

                    <VStack spacing={3} align="stretch">
                      {order.items
                        .filter((item) => item.area === group.area)
                        .map((item, index) => (
                          <Box key={index} p={3} borderWidth="1px" borderRadius="md" bg="gray.700">
                            <HStack justifyContent="space-between" mb={2}>
                              <Text fontWeight="bold">{item.name} (x{item.quantity})</Text>
                              <HStack>
                                <Text>{item.status === 'ready' ? 'Listo' : 'Preparando'}</Text>
                                <Button
                                  colorScheme="green"
                                  size="sm"
                                  onClick={() => handleMarkItemAsReady(order._id, item.itemId)}
                                  isDisabled={item.status === 'ready'}
                                >
                                  Marcar como Listo
                                </Button>
                              </HStack>
                            </HStack>

                            {item.description && (
                              <Text fontSize="sm" color="gray.300" mb={2}>
                                📝 {item.description}
                              </Text>
                            )}

                            {item.ingredients && item.ingredients.length > 0 && (
                              <VStack align="start" spacing={1}>
                                <Text fontSize="sm" fontWeight="bold">Ingredientes:</Text>
                                {item.ingredients.map((ing, idx) => (
                                  <Text fontSize="sm" key={idx}>
                                    • {ing.name || ing.inventoryItem?.name} — {ing.quantity} {ing.unit || ''}
                                  </Text>
                                ))}
                              </VStack>
                            )}
                          </Box>
                        ))}
                    </VStack>

                    {order.status === 'ready' && (
                      <Text fontSize="sm" color="green.500" mt={2}>¡Orden lista para entregar!</Text>
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
