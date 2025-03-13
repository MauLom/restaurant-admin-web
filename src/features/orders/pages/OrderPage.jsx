import React, { useState, useEffect } from 'react';
import { Flex, useToast } from '@chakra-ui/react';
import api from '../../../services/api';
import TableSelection from '../components/TableSelection';
import OpenTableModal from '../components/OpenTableModal';
import OrderForm from '../components/OrderForm';

function OrderPage() {
  // const { user } = useContext(UserContext);
  const toast = useToast();

  const [sections, setSections] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openModal, setOpenModal] = useState(false);

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

  useEffect(() => {
    fetchSections();
  }, []);

  const handleTableClick = (table) => {
    if (table.status === "occupied") {
      setSelectedTable(table);
    } else {
      setSelectedTable(table);
      setOpenModal(true);
    }
  };

  const handleConfirmTable = async () => {
    try {
      await api.put(`/tables/${selectedTable._id}`, { status: 'occupied', number: selectedTable.number });
      toast({
        title: "Mesa abierta",
        description: `La mesa ${selectedTable.number} se actualizó a ocupada.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setOpenModal(false);
      await fetchSections();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la mesa",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBackToTables = async () => {
    setSelectedTable(null);
    await fetchSections();
  };

  return (
    <Flex height="100vh" direction="column" p={4}>
      { !selectedTable ? (
        <TableSelection sections={sections} onTableClick={handleTableClick} />
      ) : (
        <OrderForm table={selectedTable} onBack={handleBackToTables} />
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