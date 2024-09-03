import React, { useState, useEffect } from 'react';
import { VStack, HStack, Text, Flex, IconButton, Input } from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import api from '../services/api';

function ItemSelector({ selectedCategory, onAddItem }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(`/menu/items?category=${selectedCategory}`);
        console.log('Items:', response.data);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    if (selectedCategory) {
      fetchItems();
    }
  }, [selectedCategory]);

  return (
    <VStack spacing={4} p={4}>
      {items.map(item => (
        <HStack key={item._id} spacing={4} width="full">
          <Text>{item.name}</Text>
          <Text>${item.price.toFixed(2)}</Text>
          <Flex alignItems="center">
            <IconButton
              icon={<FaMinus />}
              size="sm"
              onClick={() => onAddItem(item._id, -1, item)}
            />

            <Input type="number" value={item.quantity || 0} readOnly width="50px" textAlign="center" />
            <IconButton
              icon={<FaPlus />}
              size="sm"
              onClick={() => onAddItem(item._id, 1, item)}
            />

          </Flex>
        </HStack>
      ))}
    </VStack>
  );
}

export default ItemSelector;
