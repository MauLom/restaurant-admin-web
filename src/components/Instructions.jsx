import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import CategoryCard from '../components/CategoryCard';

const Instructions = ({ categories, items }) => {
  return (
    <Box>
      <Heading size="md" mb={4}>Instrucciones</Heading>
      {categories.map((category, index) => (
        <CategoryCard
          key={index}
          category={category}
          items={items.filter(item => item.category === category)}
        />
      ))}
    </Box>
  );
};

export default Instructions;
