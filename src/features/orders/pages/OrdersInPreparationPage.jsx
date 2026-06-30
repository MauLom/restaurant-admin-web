import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, IconButton, Tooltip } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import api from '../../../services/api';
import { useAuthContext } from '../../../context/AuthContext';
import { io } from 'socket.io-client';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import AdminPinModal from '../components/AdminPinModal';

function OrdersPreparationPage() {
  const [orders, setOrders] = useState([]);
  const [preparationAreas, setPreparationAreas] = useState(['kitchen', 'bar']);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingDeleteOrderId, setPendingDeleteOrderId] = useState(null);
  const { user } = useAuthContext();
  const { t } = useLanguage();
  const toast = useCustomToast();

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
    const socket = io(socketURL, { transports: ['websocket'] });

    const kitchenAreas = user.role === 'admin'
      ? ['kitchen', 'bar']
      : (user.role === 'kitchen' || user.role === 'bar') ? [user.role] : [];

    kitchenAreas.forEach(area => {
      socket.emit('join-room', { role: area, userId: user._id });
    });

    if (user.role === 'waiter') {
      socket.emit('join-room', { role: 'waiter', userId: user._id });
    }

    socket.on('new-order', (newOrder) => {
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    socket.on('update-order', (updatedOrder) => {
      setOrders((prevOrders) => {
        if (updatedOrder.status === 'paid') {
          return prevOrders.filter((order) => order._id !== updatedOrder._id);
        }
        return prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        );
      });
    });

    socket.on('order-deleted', ({ orderId }) => {
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
    });

    return () => {
      socket.disconnect();
    };
  }, [user.role, user._id]);

  const handleDeleteOrderClick = (orderId) => {
    setPendingDeleteOrderId(orderId);
    setPinModalOpen(true);
  };

  const handlePinConfirm = async (adminToken) => {
    try {
      await api.delete(`/orders/${pendingDeleteOrderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setOrders((prev) => prev.filter((o) => o._id !== pendingDeleteOrderId));
      toast({ title: t('orderDeleted'), status: 'success', duration: 2000 });
    } catch (err) {
      const msg = err.response?.data?.error || t('errorTitle');
      toast({ title: msg, status: 'error', duration: 3000 });
    } finally {
      setPendingDeleteOrderId(null);
    }
  };

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
      <Text fontSize="2xl" mb={4}>{t('preparationOrdersTitle')}</Text>

      <Tabs variant="soft-rounded" colorScheme="teal">
        <TabList>
          {groupedOrders.map((group) => (
            <Tab key={group.area}>
              {group.area === 'kitchen' ? t('kitchenArea') : group.area === 'bar' ? t('barArea') : group.area}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {groupedOrders.map((group) => (
            <TabPanel key={group.area}>
              <VStack spacing={4} align="stretch">
                {group.orders.map((order) => (
                  <Box key={order._id} p={4} bg="#363636" color="white" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="lg">{t('orderNumberDisplay').replace('{number}', order._id.substring(order._id.length - 4))}</Text>
                      <Tooltip label={t('deleteOrder')}>
                        <IconButton
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          aria-label={t('deleteOrder')}
                          onClick={() => handleDeleteOrderClick(order._id)}
                        />
                      </Tooltip>
                    </HStack>

                    <VStack spacing={3} align="stretch">
                      {order.items
                        .filter((item) => item.area === group.area)
                        .map((item, index) => (
                          <Box key={index} p={3} borderWidth="1px" borderRadius="md" bg="gray.700">
                            <HStack justifyContent="space-between" mb={2}>
                              <Text fontWeight="bold">{item.name} (x{item.quantity})</Text>
                              <HStack>
                                <Text>{item.status === 'ready' ? t('statusReadyText') : t('statusPreparingText')}</Text>
                                <Button
                                  colorScheme="green"
                                  size="sm"
                                  onClick={() => handleMarkItemAsReady(order._id, item.itemId)}
                                  isDisabled={item.status === 'ready'}
                                >
                                  {t('markAsReadyBtn')}
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
                                <Text fontSize="sm" fontWeight="bold">{t('ingredientsLabel')}:</Text>
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
                      <Text fontSize="sm" color="green.500" mt={2}>{t('orderReadyForDelivery')}</Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      <AdminPinModal
        isOpen={pinModalOpen}
        onClose={() => { setPinModalOpen(false); setPendingDeleteOrderId(null); }}
        onConfirm={handlePinConfirm}
      />
    </Box>
  );
}

export default OrdersPreparationPage;
