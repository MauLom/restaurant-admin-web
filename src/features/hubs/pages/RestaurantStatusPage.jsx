import React from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, useTheme } from '@chakra-ui/react';
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

  // Use theme colors directly for consistency with custom theme system
  const theme = useTheme();
  const cardBg = theme.colors.background;
  const cardBorder = theme.colors.primary[500];
  const descriptionColor = theme.colors.text;
  const headingColor = theme.colors.primary[500];

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Box
        display="flex"
        justifyContent="center"
        mb={20}
      >
        <Box
          px={6}
          py={3}
          bg={`${theme.colors.primary[500]}15`}
          border="2px solid"
          borderColor={theme.colors.primary[500]}
          borderRadius="lg"
          boxShadow="md"
        >
          <Heading 
            size={{ base: 'lg', md: 'xl' }} 
            mb={0} 
            color={headingColor}
            textAlign="center"
          >
            Estado del restaurante
          </Heading>
        </Box>
      </Box>
      <SimpleGrid 
        columns={{ base: 1, sm: 2, lg: 2 }} 
        spacing={{ base: 8, md: 10 }}
        maxW="4xl"
        mx="auto"
      >
        {options.map((option, index) => (
          <Box
            key={index}
            as={Link}
            to={option.link}
            p={{ base: 6, md: 8 }}
            minH={{ base: '140px', md: '160px' }}
            w="full"
            bg={cardBg}
            borderRadius="lg"
            shadow="md"
            border="1px solid"
            borderColor="transparent"
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            _hover={{
              bg: `${cardBg}EE`,
              transform: 'translateY(-2px)',
              shadow: 'lg',
              borderColor: cardBorder,
            }}
            _active={{
              transform: 'translateY(0px)',
              shadow: 'md',
            }}
            _focus={{
              outline: 'none',
              ring: 2,
              ringColor: cardBorder,
              ringOffset: 2,
            }}
            textDecoration="none"
            role="button"
            aria-label={`Ir a ${option.title}`}
          >
            <VStack spacing={{ base: 2, md: 3 }} align="start" h="full" justify="center">
              <Heading 
                size={{ base: 'md', md: 'lg' }} 
                mb={2}
                color={headingColor}
              >
                {option.title}
              </Heading>
              <Text 
                fontSize={{ base: 'sm', md: 'md' }} 
                color={descriptionColor}
                lineHeight="1.4"
                opacity={0.8}
                fontStyle={'italic'}
              >
                {option.description}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default RestaurantStatusPage;
