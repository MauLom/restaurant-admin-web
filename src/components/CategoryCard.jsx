import React from 'react';
import { Box, Heading, Text, HStack } from '@chakra-ui/react';

const CategoryCard = ({ category, items }) => {
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="lg" mb={4}>
      <Heading size="md" mb={4}>{category}</Heading>
      {items.map((item, index) => (
        <Box key={index} mb={2}>
          <HStack justify="space-between">
            <Text fontWeight="bold">{item.name}</Text>
            <Text>${(item.sellPrice || 0).toFixed(2)}</Text>
          </HStack>
          <Text>Cost: ${(item.costAmount || 0).toFixed(2)}</Text>
          <Text>Sold Amount: ${(item.soldAmount || 0).toFixed(2)}</Text>
          <Text>Quantity: {(item.quantity || 0)}</Text>
        </Box>
      ))}
    </Box>
  );
};

export default CategoryCard;
