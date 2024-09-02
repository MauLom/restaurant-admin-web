import React, { useState } from 'react';
import { Box, VStack, Text, Button, Input, Select, useToast } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const tables = [
  { id: 1, number: 'T1', status: 'available' },
  { id: 2, number: 'T2', status: 'occupied' },
  { id: 3, number: 'T3', status: 'available' },
  { id: 4, number: 'T4', status: 'available' },
  { id: 5, number: 'T5', status: 'occupied' },
];

function TableAssignment() {
  const [selectedTable, setSelectedTable] = useState('');
  const [guestName, setGuestName] = useState('');
  const toast = useToast();
  const { t } = useLanguage();

  const handleAssignTable = () => {
    if (!selectedTable || !guestName) {
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
      title: t('tableAssignedTitle'),
      description: t('tableAssignedDescription')
        .replace('{table}', selectedTable)
        .replace('{guest}', guestName),
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setSelectedTable('');
    setGuestName('');
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('assignTable')}</Text>
      <VStack spacing={4} align="start">
        <Select
          placeholder={t('selectTable')}
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          {tables.filter(table => table.status === 'available').map(table => (
            <option key={table.id} value={table.number}>
              {t('table')} {table.number}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t('guestNamePlaceholder')}
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleAssignTable}>
          {t('assignTableButton')}
        </Button>
      </VStack>
    </Box>
  );
}

export default TableAssignment;
