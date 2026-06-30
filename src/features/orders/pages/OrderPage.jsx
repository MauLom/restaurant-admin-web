import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex, Button, VStack, Heading, Divider, Box, Text,
} from '@chakra-ui/react';
import { io } from 'socket.io-client';
import api from '../../../services/api';
import TableSelection from '../components/TableSelection';
import OpenTableModal from '../components/OpenTableModal';
import OrderForm from '../components/OrderForm';
import OrderCard from '../components/OrderCard';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthContext } from '../../../context/AuthContext';

function OrderPage() {
  const toast = useCustomToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const { user } = useAuthContext();

  const [sections, setSections] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [creatingNewOrder, setCreatingNewOrder] = useState(false);
  // { [orderId]: Set<itemSubdocId> }
  const [selectedItems, setSelectedItems] = useState({});

  const fetchSections = useCallback(async () => {
    try {
      const response = await api.get('/sections');
      setSections(Array.isArray(response.data) ? response.data : []);
    } catch {
      setSections([]);
      toast({ title: t('errorTitle'), description: t('sectionsLoadError'), status: 'error', duration: 3000 });
    }
  }, [toast, t]);

  const fetchOrdersByTableSessionId = useCallback(async (tableId, tableSessionId) => {
    try {
      const res = await api.get(`/orders?tableId=${tableId}&tableSessionId=${tableSessionId}`);
      setOrders(res.data);
      setSelectedItems({});
    } catch {
      toast({ title: t('errorTitle'), description: t('ordersLoadError'), status: 'error', duration: 3000 });
    }
  }, [toast, t]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    if (!user?._id) return;
    let socketURL = process.env.REACT_APP_API_URL;
    if (socketURL.includes('/api')) socketURL = socketURL.replace('/api', '');
    const socket = io(socketURL);
    socket.emit('join-room', { role: 'waiter', userId: user._id });
    socket.on('update-order', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      if (updatedOrder.items.some(i => i.status === 'ready')) {
        toast({ title: t('orderReadyForDelivery'), status: 'info', duration: 4000, isClosable: true });
      }
    });
    return () => socket.disconnect();
  }, [user?._id]);

  useEffect(() => {
    if (selectedTable && selectedTable.status === 'occupied') {
      fetchOrdersByTableSessionId(selectedTable._id, selectedTable.tableSessionId);
    }
  }, [selectedTable, fetchOrdersByTableSessionId]);

  const handleTableClick = (table) => {
    if (table.status !== 'occupied') {
      setOpenModal(true);
      setSelectedTable({ ...table, _pendingOpen: true });
    } else {
      setSelectedTable(table);
    }
  };

  const handleConfirmTable = async (comment, numberOfGuests, waiterId) => {
    try {
      const res = await api.post('/tableSession', { tableId: selectedTable._id, waiterId, numberOfGuests, comment });
      toast({ title: t('tableOpened'), description: t('tableOpenedDesc').replace('{tableNumber}', selectedTable.number), status: 'success', duration: 2000 });
      setOpenModal(false);
      const updatedTable = { ...selectedTable, tableSessionId: res.data._id, status: 'occupied' };
      delete updatedTable._pendingOpen;
      setSelectedTable(updatedTable);
      await fetchSections();
      await fetchOrdersByTableSessionId(updatedTable._id, updatedTable.tableSessionId);
    } catch {
      toast({ title: t('errorTitle'), description: t('tableOpenError'), status: 'error', duration: 3000 });
    }
  };

  const handleToggleItem = (orderId, itemSubdocId) => {
    setSelectedItems(prev => {
      const set = new Set(prev[orderId] || []);
      if (set.has(itemSubdocId)) {
        set.delete(itemSubdocId);
      } else {
        set.add(itemSubdocId);
      }
      return { ...prev, [orderId]: set };
    });
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[updatedOrder._id];
      return next;
    });
  };

  const handleOrderDeleted = (orderId) => {
    setOrders(prev => prev.filter(o => o._id !== orderId));
    setSelectedItems(prev => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  };

  const totalSelectedCount = Object.values(selectedItems).reduce((acc, set) => acc + set.size, 0);

  const handleSendToPayment = async () => {
    const selections = Object.entries(selectedItems)
      .filter(([, ids]) => ids.size > 0)
      .map(([orderId, ids]) => ({ orderId, itemIds: [...ids] }));

    if (!selections.length) return;

    try {
      const res = await api.post('/orders/send-to-cashier', {
        tableId: selectedTable._id,
        tableSessionId: selectedTable.tableSessionId,
        selections,
      });

      if (res.data.sessionClosed) {
        toast({ title: t('sessionClosedSentToCashier'), status: 'success', duration: 4000 });
        handleBackToTables();
      } else {
        toast({ title: t('sendToPayment'), status: 'success', duration: 2000 });
        fetchOrdersByTableSessionId(selectedTable._id, selectedTable.tableSessionId);
      }
    } catch {
      toast({ title: t('errorTitle'), status: 'error', duration: 3000 });
    }
  };

  const handleCloseSession = async () => {
    try {
      await api.put(`/tableSession/close-by-table/${selectedTable._id}`);
      toast({ title: t('sessionClosed'), description: t('sessionClosedDesc'), status: 'success', duration: 3000 });
      handleBackToTables();
    } catch (error) {
      const msg = error.response?.data?.error || t('sessionCloseError');
      toast({ title: t('errorTitle'), description: msg, status: 'error', duration: 3000 });
    }
  };

  const handleBackToTables = async () => {
    setSelectedTable(null);
    setOrders([]);
    setCreatingNewOrder(false);
    setSelectedItems({});
    await fetchSections();
  };

  const handleCreateNewOrder = () => setCreatingNewOrder(true);

  const handleOrderCreated = () => {
    setCreatingNewOrder(false);
    fetchOrdersByTableSessionId(selectedTable._id, selectedTable.tableSessionId);
  };

  return (
    <Flex
      height="100vh"
      direction="column"
      p={4}
      bg={currentTheme.colors.interface?.content || currentTheme.colors.background}
      color={currentTheme.colors.text}
    >
      {!selectedTable || selectedTable._pendingOpen ? (
        <TableSelection sections={sections} onTableClick={handleTableClick} onRefreshSections={fetchSections} />
      ) : creatingNewOrder ? (
        <OrderForm table={selectedTable} onBack={handleBackToTables} onSubmitSuccess={handleOrderCreated} />
      ) : (
        <VStack align="stretch" spacing={4}>
          <Heading size="lg" color="teal.200">{t('tableHeading').replace('{tableNumber}', selectedTable.number)}</Heading>

          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              selectedItems={selectedItems[order._id] || new Set()}
              onToggleItem={handleToggleItem}
              onOrderUpdated={handleOrderUpdated}
              onOrderDeleted={handleOrderDeleted}
            />
          ))}

          {totalSelectedCount === 0 && (
            <Box p={3} bg="gray.700" borderRadius="md">
              <Text fontSize="sm" color="gray.400">
                ☝️ {t('adminPinRequired').includes('PIN') ? 'Selecciona ítems listos para enviar a caja' : 'Select ready items to send to cashier'}
              </Text>
            </Box>
          )}

          <Button
            bg="orange.500"
            _hover={{ bg: 'orange.600' }}
            onClick={handleSendToPayment}
            isDisabled={totalSelectedCount === 0}
          >
            📤 {t('sendToPayment')}
          </Button>

          <Button
            bg="purple.500"
            _hover={{ bg: 'purple.600' }}
            onClick={handleCloseSession}
            isDisabled={orders.some(order => !order.paid && !['sent to cashier', 'delivered'].includes(order.status))}
          >
            🛑 {t('closeTableSession')}
          </Button>

          <Divider borderColor="gray.600" />

          <Button bg="teal.500" _hover={{ bg: 'teal.600' }} onClick={handleCreateNewOrder}>
            ➕ {t('addNewOrder')}
          </Button>
          <Button variant="ghost" onClick={handleBackToTables} color="gray.300" _hover={{ color: 'white' }}>
            🔙 {t('backToTables')}
          </Button>
        </VStack>
      )}
      <OpenTableModal
        isOpen={openModal}
        table={selectedTable}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmTable}
      />
    </Flex>
  );
}

export default OrderPage;
