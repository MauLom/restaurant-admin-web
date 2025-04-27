import React from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function RestaurantStatusPage() {
  const options = [
    { 
      title: 'Gestionar órdenes', 
      description: 'Visualizar y crear nuevas órdenes.', 
      link: '/dashboard/orders' 
    },
    { 
      title: 'Órdenes en preparación', 
      description: 'Supervisar órdenes en cocina o barra.', 
      link: '/dashboard/kitchen-orders' 
    },
    { 
      title: 'Gestionar cobros', 
      description: 'Administrar pagos y sesiones listas para cobro.', 
      link: '/dashboard/cashier' 
    },
    { 
      title: 'Consultar análisis del día', 
      description: 'Revisar ventas y actividad diaria.', 
      link: '/dashboard/analytics' 
    },
  ];

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="teal.300">📋 Estado del restaurante</Heading>
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

export default RestaurantStatusPage;
