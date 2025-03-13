import React from 'react';
import { Box, Flex, Button, Text, HStack } from '@chakra-ui/react';

function TableSelection({ sections, onTableClick }) {
  return (
    <>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Áreas
      </Text>
      <Flex direction="column" gap={4}>
        {sections.map((section) => (
          <Box key={section._id} border="1px solid black" p={4} borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              {section.name} ({section.tables.length} mesas)
            </Text>
            <HStack wrap="wrap" spacing={4}>
              {section.tables.map((table) => (
                <Button
                  key={table._id}
                  colorScheme={table.status === "occupied" ? "red" : "green"}
                  onClick={() => onTableClick(table)}
                >
                  {table.number} <br /> {table.status === "occupied" ? "Ocupada" : "Disponible"}
                </Button>
              ))}
            </HStack>
          </Box>
        ))}
      </Flex>
    </>
  );
}

export default TableSelection;
