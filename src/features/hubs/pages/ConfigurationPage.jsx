import React from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function ConfigurationPage() {
  const options = [
    { 
      title: 'Generar accesos (PINs)', 
      description: 'Generar códigos PIN para colaboradores.', 
      link: '/dashboard/generate-pins' 
    },
    { 
      title: 'Configurar perfil', 
      description: 'Actualizar datos personales y credenciales.', 
      link: '/dashboard/profile' 
    },
    { 
      title: 'Configurar sistema', 
      description: 'Ajustar preferencias y configuraciones generales.', 
      link: '/dashboard/settings' 
    },
    { 
      title: 'Gestionar layout', 
      description: 'Administrar secciones y mesas del restaurante.', 
      link: '/dashboard/sections' 
    },
  ];

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="teal.300">⚙️ Configurar sistema</Heading>
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

export default ConfigurationPage;
