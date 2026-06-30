import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex, Button, VStack, Heading, Divider
} from '@chakra-ui/react';
import api from '../../../services/api';
import TableSelection from '../components/TableSelection';
import OpenTableModal from '../components/OpenTableModal';
import OrderForm from '../components/OrderForm';
import OrderCard from '../components/OrderCard';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

function OrderPage() {
  const toast = useCustomToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const [sections, setSections] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
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
            />
          ))}
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
