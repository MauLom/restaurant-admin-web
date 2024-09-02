import React, { useState } from 'react';
import { Box, VStack, Input, Button, Select, useToast, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const tableData = [
  { id: 1, number: "T1", status: "available" },
  { id: 2, number: "T2", status: "occupied" },
  { id: 3, number: "T3", status: "reserved" },
  { id: 4, number: "T4", status: "available" },
  { id: 5, number: "T5", status: "occupied" }
];

function ReservationForm() {
  const [selectedTable, setSelectedTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const toast = useToast();
  const { t } = useLanguage();

  const handleReserve = () => {
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
          {tableData.filter(table => table.status === 'available').map(table => (
            <option key={table.id} value={table.number}>
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
