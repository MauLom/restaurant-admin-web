import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Button, Select, Text } from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

function ReservationForm() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const toast = useCustomToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get('/sections');
        const sections = response.data;
        const availableTables = sections.flatMap(section => section.tables.filter(table => table.status === 'available'));
        setTables(availableTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  const handleReserve = async () => {
    if (!selectedTable || !customerName) {
      toast({
        title: t('invalidInputTitle'),
        description: t('invalidInputDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const selectedTableData = tables.find(table => table.number === selectedTable);
      await api.post('/reservations', {
        tableId: selectedTableData._id,
        customerName,
        reservationTime: new Date(),
      });

      toast({
        title: t('tableReservedTitle'),
        description: t('tableReservedDescription')
          .replace('{table}', selectedTable)
          .replace('{customer}', customerName),
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setSelectedTable('');
      setCustomerName('');

      // Refresh the tables list after reservation
      const response = await api.get('/sections');
      const sections = response.data;
      const availableTables = sections.flatMap(section => section.tables.filter(table => table.status === 'available'));
      setTables(availableTables);

    } catch (error) {
      console.error('Error making reservation:', error);
      toast({
        title: t('reservationErrorTitle'),
        description: t('reservationErrorDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box mt={8} p={4}>
      <Text fontSize="2xl" mb={4}>{t('reserveTable')}</Text>
      <VStack spacing={4} align="start">
        <Select
          placeholder={t('selectTable')}
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          {tables.map(table => (
            <option key={table._id} value={table.number}>
              {t('table')} {table.number}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t('customerNamePlaceholder')}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleReserve}>
          {t('reserveTableButton')}
        </Button>
      </VStack>
    </Box>
  );
}

export default ReservationForm;
