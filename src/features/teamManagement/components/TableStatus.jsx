import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Badge } from '@chakra-ui/react';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

function TableStatus() {
  const { t } = useLanguage();
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get('/sections');
        const sections = response.data;
        const allTables = sections.flatMap(section => section.tables);
        setTables(allTables);
      } catch (error) {
        console.error('Error fetching table status:', error);
      }
    };

    fetchTables();
  }, []);

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('tableStatus')}</Text>
      <VStack spacing={4} align="start">
        {tables.map(table => (
          <HStack key={table._id} justify="space-between" width="100%" p={2} borderWidth="1px" borderRadius="lg">
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
