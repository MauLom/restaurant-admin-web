import React, { useState, useEffect } from 'react';
import { VStack, Text, IconButton, SimpleGrid, Button, Stack, Input} from '@chakra-ui/react';
import { FaMinus } from 'react-icons/fa';
import api from '../services/api';

function ItemSelector({ selectedCategory, onAddItem }) {
  const [items, setItems] = useState([]);
  const [comment, setComments] = useState([]);

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

  const handleAddItem = (itemId, quantity, item) => {
    onAddItem(itemId, quantity, item, comment);
    setComments('');
  };

  // Refactored for better user usability
  return (
    <VStack marginTop={5}>
    <Input 
      placeholder='Add comment to product' 
      value={comment}
      onChange={(e) => setComments(e.target.value)} 
    />
    <SimpleGrid columns={[2,3,5]} spacing={5} zIndex={900}>
      {items.map((item) => (
        <Stack key={item._id} spacing={0}>
        <Button colorScheme="blue" onClick={() => handleAddItem(item._id, 1, item, comment)} height={120} p={10} borderBottomRadius={0}>
          <VStack>
            {/* Seria bueno mostrar una imagen de referencia para meseros nuevos les */}
            {/* <Image src='gibbresh.png' fallbackSrc='maui-logo.png' height={150}/> */}
            <Text textAlign='center' whiteSpace='normal'>{item.name} </Text>
            <Text>{item.price.toFixed(2)}</Text>
          </VStack>
        </Button>
        <IconButton bg='#a70000' borderTopRadius={0}
          icon={<FaMinus />}
          onClick={() => handleAddItem(item._id, -1, item)}
        />
        </Stack>
      ))}
    </SimpleGrid>
    </VStack>
  );
}

export default ItemSelector;
