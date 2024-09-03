import React, { useState, useEffect } from 'react';
import { HStack, Button } from '@chakra-ui/react';
import api from '../services/api';

function CategorySelector({ onSelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/menu/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <HStack spacing={4} overflowX="scroll" p={4}>
      {categories.map(category => (
        <Button key={category._id} onClick={() => onSelect(category._id)}>
          {category.name}
        </Button>
      ))}
    </HStack>
  );
}

export default CategorySelector;
