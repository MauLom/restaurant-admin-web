import React, { useState, useEffect, useCallback } from 'react';
import {
  Flex, useToast, Button, VStack, Heading, Divider, Input, Box
} from '@chakra-ui/react';
import api from '../../../services/api';
import TableSelection from '../components/TableSelection';
import OpenTableModal from '../components/OpenTableModal';
import OrderForm from '../components/OrderForm';
import OrderCard from '../components/OrderCard';
import PaymentMethodSelector from '../components/PaymentMethodSelector';

function OrderPage() {
  const toast = useToast();

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
      setSections(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las secciones",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const fetchOrdersByTable = useCallback(async (tableId) => {
    try {
      const res = await api.get(`/orders?tableId=${tableId}`);
      setOrders(res.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    if (selectedTable && selectedTable.status === 'occupied') {
      fetchOrdersByTable(selectedTable._id);
    }
  }, [selectedTable, fetchOrdersByTable]);

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
      await api.post('/tableSession', {
        tableId: selectedTable._id,
        waiterId,
        numberOfGuests,
        comment
      });

      toast({
        title: "Mesa aperturada",
        description: `La mesa ${selectedTable.number} fue aperturada con éxito.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setOpenModal(false);

      const updatedTable = { ...selectedTable };
      delete updatedTable._pendingOpen;
      setSelectedTable(updatedTable);

      await fetchSections();
      await fetchOrdersByTable(updatedTable._id);
    } catch (error) {
      console.error("Error al aperturar mesa:", error);
      toast({
        title: "Error",
        description: "No se pudo aperturar la mesa",
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
        title: 'Métodos de pago faltantes',
        description: 'Agrega al menos un método de pago para continuar.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const invalidMethod = paymentMethodsAll.some(pm => !pm.method || !pm.amount || parseFloat(pm.amount) <= 0);
    if (invalidMethod) {
      toast({
        title: 'Métodos de pago inválidos',
        description: 'Verifica que todos los métodos tengan un tipo y un monto válido.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (Math.abs(totalEntered - expectedTotal) > 0.01) {
      toast({
        title: 'Montos no coinciden',
        description: `El total ingresado ($${totalEntered.toFixed(2)}) no coincide con el total esperado ($${expectedTotal.toFixed(2)}).`,
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
        title: 'Pago realizado',
        description: `Se pagaron todas las órdenes de la mesa ${selectedTable.number}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      await fetchOrdersByTable(selectedTable._id);
      await fetchSections();
      setPaymentMethodsAll([]);
      setTipAll(0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron pagar todas las órdenes.',
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
        title: 'Sesión cerrada',
        description: 'La sesión de la mesa fue cerrada correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleBackToTables();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión. Asegúrate que todas las órdenes estén pagadas.',
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
    fetchOrdersByTable(selectedTable._id);
  };

  return (
    <Flex height="100vh" direction="column" p={4} bg="#1a202c" color="white">
      {!selectedTable || selectedTable._pendingOpen ? (
        <TableSelection sections={sections} onTableClick={handleTableClick} />
      ) : creatingNewOrder ? (
        <OrderForm table={selectedTable} onBack={handleBackToTables} onSubmitSuccess={handleOrderCreated} />
      ) : (
        <VStack align="stretch" spacing={4}>
          <Heading size="lg" color="teal.200">Mesa {selectedTable.number}</Heading>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onPaid={() => fetchOrdersByTable(selectedTable._id)} />
          ))}
          <Box>
            <Input
              type="number"
              placeholder="Propina para todas las órdenes"
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
            expectedTotal={
              orders
                .filter(order => !order.paid)
                .reduce((total, order) => total + order.total, 0) + parseFloat(tipAll || 0)
            }
          />

          <Button
            bg="green.500"
            _hover={{ bg: 'green.600' }}
            onClick={handlePayAllOrders}
            isDisabled={!orders.some(o => o.status === 'ready' && !o.paid)}
          >
            💳 Pagar todas las órdenes
          </Button>

          <Button
            bg="purple.500"
            _hover={{ bg: 'purple.600' }}
            onClick={handleCloseSession}
            isDisabled={orders.some(order => !order.paid)}
          >
            🛑 Cerrar sesión de la mesa
          </Button>

          <Divider borderColor="gray.600" />
          <Button bg="teal.500" _hover={{ bg: 'teal.600' }} onClick={handleCreateNewOrder}>
            ➕ Agregar nueva orden
          </Button>
          <Button variant="ghost" onClick={handleBackToTables} color="gray.300" _hover={{ color: 'white' }}>
            🔙 Volver a mesas
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
