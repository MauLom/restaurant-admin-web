import React, { useState, useEffect } from 'react';
import { Flex, useToast, Button, VStack, Heading, Divider } from '@chakra-ui/react';
import api from '../../../services/api';
import TableSelection from '../components/TableSelection';
import OpenTableModal from '../components/OpenTableModal';
import OrderForm from '../components/OrderForm';
import OrderCard from '../components/OrderCard'; // Asegúrate de tener este componente

function OrderPage() {
  const toast = useToast();

  const [sections, setSections] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [creatingNewOrder, setCreatingNewOrder] = useState(false);

  const fetchSections = async () => {
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
  };

  const fetchOrdersByTable = async (tableId) => {
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
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedTable && selectedTable.status === 'occupied') {
      fetchOrdersByTable(selectedTable._id);
    }
  }, [selectedTable]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    if (table.status !== "occupied") {
      setOpenModal(true);
    }
  };

  const handleConfirmTable = async (comment, numberOfGuests, waiterId) => {
    try {
      await api.post('/orders', {
        tableId: selectedTable._id,
        waiterId,
        items: [],
        comment,
        numberOfGuests
      });

      toast({
        title: "Mesa aperturada",
        description: `La mesa ${selectedTable.number} fue aperturada con éxito.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      setOpenModal(false);
      fetchSections();
      fetchOrdersByTable(selectedTable._id);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aperturar la mesa",
        status: "error",
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
    <Flex height="100vh" direction="column" p={4}>
      {!selectedTable ? (
        <TableSelection sections={sections} onTableClick={handleTableClick} />
      ) : creatingNewOrder ? (
        <OrderForm table={selectedTable} onBack={handleBackToTables} onSubmitSuccess={handleOrderCreated} />
      ) : (
        <VStack align="stretch" spacing={4}>
          <Heading size="lg">Mesa {selectedTable.number}</Heading>
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onPaid={() => fetchOrdersByTable(selectedTable._id)} />
          ))}
          <Divider />
          <Button colorScheme="teal" onClick={handleCreateNewOrder}>
            ➕ Agregar nueva orden
          </Button>
          <Button variant="ghost" onClick={handleBackToTables}>
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
