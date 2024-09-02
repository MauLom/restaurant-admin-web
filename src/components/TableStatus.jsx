import React from 'react';
import { Box, VStack, HStack, Text, Badge } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const tableData = [
  { id: 1, number: "T1", status: "available" },
  { id: 2, number: "T2", status: "occupied" },
  { id: 3, number: "T3", status: "reserved" },
  { id: 4, number: "T4", status: "available" },
  { id: 5, number: "T5", status: "occupied" }
];

function TableStatus() {
  const { t } = useLanguage();

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('tableStatus')}</Text>
      <VStack spacing={4} align="start">
        {tableData.map(table => (
          <HStack key={table.id} justify="space-between" width="100%" p={2} borderWidth="1px" borderRadius="lg">
            <Text>{t('table')} {table.number}</Text>
            <Badge colorScheme={table.status === 'available' ? 'green' : table.status === 'occupied' ? 'red' : 'yellow'}>
              {t(table.status)}
            </Badge>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

export default TableStatus;
