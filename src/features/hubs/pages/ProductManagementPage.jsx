import React from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function ProductManagementPage() {
  const options = [
    { title: 'Categorías del Menú', description: 'Crea o edita categorías para organizar productos.', link: '/dashboard/manage-categories' },
    { title: 'Productos del Menú', description: 'Agrega o edita platillos, bebidas y más.', link: '/dashboard/manage-items' },
    { title: 'Inventario de Insumos', description: 'Gestiona existencias de ingredientes.', link: '/dashboard/inventory' },
  ];

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="teal.300">🍔 Gestión de Productos</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {options.map((option, index) => (
          <Box key={index} p={6} bg="gray.700" borderRadius="md" shadow="md">
            <VStack spacing={3} align="start">
              <Heading size="md">{option.title}</Heading>
              <Text fontSize="sm" color="gray.300">{option.description}</Text>
              <Button as={Link} to={option.link} colorScheme="teal" variant="solid" size="sm">
                Ir
              </Button>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default ProductManagementPage;
