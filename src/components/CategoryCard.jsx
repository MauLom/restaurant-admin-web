import React from 'react';
import { Box, Heading, Text, Stack } from '@chakra-ui/react';

const CategoryCard = ({ category, items }) => {
  const calculateCategoryTotal = () => {
    return items.reduce((total, item) => total + (item.quantitySold * item.soldAmount), 0);
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      w="full"
      mb={4}
    >
      <Heading size="md" mb={2}>{category}</Heading>
      <Stack spacing={2}>
        {items.map((item, index) => (
          <Box key={index} p={2} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">{item.name}</Text>
            <Text>Costo: ${item.soldAmount.toFixed(2)}</Text>
            <Text>Precio: ${item.sellPrice.toFixed(2)}</Text>
            <Text>Unidades vendidas: {item.quantitySold}</Text>
            <Text>A pagar: ${(item.quantitySold * item.soldAmount).toFixed(2)}</Text>
          </Box>
        ))}
      </Stack>
      <Text fontWeight="bold" mt={2}>Total a pagar para {category}: ${calculateCategoryTotal().toFixed(2)}</Text>
    </Box>
  );
};

export default CategoryCard;
