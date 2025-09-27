import React from 'react';
import { Box, Flex, Button, Text, HStack } from '@chakra-ui/react';

function TableSelection({ sections, onTableClick }) {
  // Validar que sections existe y es un array
  if (!sections || !Array.isArray(sections)) {
    return (
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Áreas
        </Text>
        <Text>No hay secciones disponibles</Text>
      </Box>
    );
  }

  // Si no hay secciones
  if (sections.length === 0) {
    return (
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Áreas
        </Text>
        <Text>No hay secciones configuradas</Text>
      </Box>
    );
  }

  return (
    <>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Áreas
      </Text>
      <Flex direction="column" gap={4}>
        {sections.map((section) => {
          // Validar que la sección tiene un ID válido
          if (!section || !section._id) {
            return null;
          }

          const tables = section.tables || [];
          
          return (
            <Box key={section._id} border="1px solid black" p={4} borderRadius="md">
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                {section.name || 'Sección sin nombre'} ({tables.length} mesas)
              </Text>
              <HStack wrap="wrap" spacing={4}>
                {tables.length > 0 ? (
                  tables.map((table) => {
                    if (!table || !table._id) {
                      return null;
                    }
                    return (
                      <Button
                        key={table._id}
                        colorScheme={table.status === "occupied" ? "red" : "green"}
                        onClick={() => onTableClick(table)}
                      >
                        {table.number || 'S/N'} <br /> 
                        {table.status === "occupied" ? "Ocupada" : "Disponible"}
                      </Button>
                    );
                  })
                ) : (
                  <Text color="gray.500">No hay mesas en esta sección</Text>
                )}
              </HStack>
            </Box>
          );
        })}
      </Flex>
    </>
  );
}

export default TableSelection;
