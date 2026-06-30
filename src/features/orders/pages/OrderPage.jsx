import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex, Button, VStack, Heading, Divider, Input, Box
} from '@chakra-ui/react';
import api from '../../../services/api';
import TableSelection from '../components/TableSelection';
import OpenTableModal from '../components/OpenTableModal';
import OrderForm from '../components/OrderForm';
import OrderCard from '../components/OrderCard';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

function OrderPage() {
  const toast = useCustomToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const [sections, setSections] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tipAll, setTipAll] = useState(null);
  const [paymentMethodsAll, setPaymentMethodsAll] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [creatingNewOrder, setCreatingNewOrder] = useState(false);

  const fetchSections = useCallback(async () => {
    try {
      const response = await api.get('/sections');
      // Validar que la respuesta contiene datos válidos
      if (response.data && Array.isArray(response.data)) {
        setSections(response.data);
      } else {
        setSections([]);
        console.warn('La respuesta de secciones no es un array válido:', response.data);
      }
    } catch (error) {
      setSections([]); // Mantener un array vacío en caso de error
      toast({
        title: t('errorTitle'),
        description: t('sectionsLoadError'),
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [toast, t]);

  const fetchOrdersByTableSessionId = useCallback(async (tableId, tableSessionId) => {
    try {
      const res = await api.get(`/orders?tableId=${tableId}&tableSessionId=${tableSessionId}`);
      setOrders(res.data);
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('ordersLoadError'),
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [toast, t]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    if (selectedTable && selectedTable.status === 'occupied') {
      fetchOrdersByTableSessionId(selectedTable._id, selectedTable.tableSessionId);
    }
  }, [selectedTable, fetchOrdersByTableSessionId]);

  const handleTableClick = (table) => {
    if (table.status !== "occupied") {
      setOpenModal(true);
      setSelectedTable({ ...table, _pendingOpen: true });
    } else {
      setSelectedTable(table);
    }
  };

  const handleConfirmTable = async (comment, numberOfGuests, waiterId) => {
    try {
      let tableSessionData = null;
      const res = await api.post('/tableSession', {
        tableId: selectedTable._id,
        waiterId,
        numberOfGuests,
        comment
      });
      tableSessionData = res.data;

      toast({
        title: t('tableOpened'),
        description: t('tableOpenedDesc').replace('{tableNumber}', selectedTable.number),
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setOpenModal(false);

      const updatedTable = { ...selectedTable, tableSessionId: tableSessionData._id, status: "occupied" };
      delete updatedTable._pendingOpen;
      setSelectedTable(updatedTable);

      await fetchSections();
      await fetchOrdersByTableSessionId(updatedTable._id, updatedTable.tableSessionId);
    } catch (error) {
      console.error("Error al aperturar mesa:", error);
      toast({
        title: t('errorTitle'),
        description: t('tableOpenError'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePayAllOrders = async () => {
    const unpaidOrders = orders.filter(order => !order.paid);
    const expectedTotal = unpaidOrders.reduce((sum, order) => sum + order.total, 0) + parseFloat(tipAll || 0);
    const totalEntered = paymentMethodsAll.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0);

    if (paymentMethodsAll.length === 0) {
      toast({
        title: t('noPaymentMethods'),
        description: t('noPaymentMethodsDesc'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const invalidMethod = paymentMethodsAll.some(pm => !pm.method || !pm.amount || parseFloat(pm.amount) <= 0);
    if (invalidMethod) {
      toast({
        title: t('invalidPaymentMethods'),
        description: t('invalidPaymentMethodsDesc'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (Math.abs(totalEntered - expectedTotal) > 0.01) {
      toast({
        title: t('amountsMismatch'),
        description: `${t('amountsMismatchDesc')} (${totalEntered.toFixed(2)} / ${expectedTotal.toFixed(2)}).`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.post(`/orders/payment/${selectedTable._id}`, {
        tip: parseFloat(tipAll),
        paymentMethods: paymentMethodsAll,
      });

      toast({
        title: t('paymentCompleted'),
        description: t('paymentCompletedDesc').replace('{tableNumber}', selectedTable.number),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchOrdersByTableSessionId(selectedTable._id, selectedTable.tableSessionId);
      await fetchSections();
      setPaymentMethodsAll([]);
      setTipAll(0);
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('paymentError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCloseSession = async () => {
    try {
      await api.put(`/tableSession/close-by-table/${selectedTable._id}`);
      toast({
        title: t('sessionClosed'),
        description: t('sessionClosedDesc'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleBackToTables();
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('sessionCloseError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBackToTables = async () => {
    setSelectedTable(null);
    setOrders([]);
    setCreatingNewOrder(false);
    await fetchSections();
  };

  const handleCreateNewOrder = () => {
    setCreatingNewOrder(true);
  };

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
              onPaid={() => fetchOrdersByTableSessionId(selectedTable._id, selectedTable.tableSessionId)}
            />
          ))}
          <Box>
            <Input
              type="number"
              placeholder={t('tipAllOrders')}
              value={tipAll}
              onChange={(e) => setTipAll(e.target.value)}
              size="sm"
              bg="gray.700"
              color="white"
              _placeholder={{ color: 'gray.400' }}
            />
          </Box>
          <PaymentMethodSelector
            paymentMethods={paymentMethodsAll}
            setPaymentMethods={setPaymentMethodsAll}
            expectedTotal={orders.filter(order => !order.paid).reduce((total, order) => total + order.total, 0) + parseFloat(tipAll || 0)}
          />
          <Button
            bg="green.500"
            _hover={{ bg: 'green.600' }}
            onClick={handlePayAllOrders}
            isDisabled={!orders.some(o => o.status === 'ready' && !o.paid)}
          >
            💳 {t('payAllOrders')}
          </Button>
          <Button
            bg="purple.500"
            _hover={{ bg: 'purple.600' }}
            onClick={handleCloseSession}
            isDisabled={orders.some(order => !order.paid)}
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
