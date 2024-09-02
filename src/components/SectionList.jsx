import React, { useState } from 'react';
import { Box, VStack, Button, Text } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const sectionsData = [
  {
    id: 1,
    name: "Main Hall",
    tables: [
      { id: 1, number: "T1", status: "available" },
      { id: 2, number: "T2", status: "occupied" },
      { id: 3, number: "T3", status: "available" }
    ]
  },
  {
    id: 2,
    name: "VIP Area",
    tables: [
      { id: 4, number: "T4", status: "available" },
      { id: 5, number: "T5", status: "occupied" }
    ]
  }
];

function SectionList() {
  const { t } = useLanguage();

  const [selectedSection, setSelectedSection] = useState(null);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  return (
    <Box p={4}>
      <VStack spacing={4}>
        {sectionsData.map(section => (
          <Button
            key={section.id}
            onClick={() => handleSectionClick(section)}
            variant="solid"
            width="100%"
          >
            {section.name}
          </Button>
        ))}
      </VStack>
      {selectedSection && (
        <Box mt={6}>
          <Text fontSize="lg" mb={4}>{selectedSection.name} - {t('table')}</Text>
          <VStack spacing={4}>
            {selectedSection.tables.map(table => (
              <Button
                key={table.id}
                colorScheme={table.status === 'available' ? 'green' : 'red'}
                variant="outline"
                width="100%"
              >
                {table.number} - {table.status}
              </Button>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}

export default SectionList;
