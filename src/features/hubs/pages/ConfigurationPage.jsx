import React from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

function ConfigurationPage() {
  const options = [
    { 
      title: 'Generar Accesos (PINs)', 
      description: 'Crea accesos para nuevos colaboradores.', 
      link: '/dashboard/generate-pins' 
    },
    { 
      title: 'Configuración de Perfil', 
      description: 'Edita tus datos personales y credenciales.', 
      link: '/dashboard/profile' 
    },
    { 
      title: 'Ajustes Generales', 
      description: 'Administra configuraciones del sistema.', 
      link: '/dashboard/settings' 
    },
    { 
      title: 'Gestión de Layout', 
      description: 'Administra las secciones y mesas del restaurante.', 
      link: '/dashboard/sections' 
    },
  ];

  return (
    <Box p={6}>
      <Heading size="lg" mb={6} color="teal.300">⚙️ Configuraciones</Heading>
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
