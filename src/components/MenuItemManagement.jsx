import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Button, Input, Text, Select, useToast } from '@chakra-ui/react';
import api from '../services/api';

function MenuItemManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '' });
  const toast = useToast();

  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const categoriesResponse = await api.get('/menu/categories');
        const itemsResponse = await api.get('/menu/items');
        setCategories(categoriesResponse.data);
        setItems(itemsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories or items.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchCategoriesAndItems();
  }, [toast]);

  const handleAddItem = async () => {
    try {
      const response = await api.post('/menu/items', newItem);
      setItems([...items, response.data]);
      setNewItem({ name: '', description: '', price: '', category: '' });
      toast({
        title: 'Item added',
        description: 'New item has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/menu/items/${itemId}`);
      setItems(items.filter(item => item._id !== itemId));
      toast({
        title: 'Item deleted',
        description: 'Item has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Manage Menu Items</Text>
      <VStack spacing={4}>
        {items.map(item => (
          <HStack key={item._id} width="100%" justify="space-between">
            <Text>{item.name} - {item.category.name} ({item.category.area}) - ${item.price.toFixed(2)}</Text>
            <Button colorScheme="red" onClick={() => handleDeleteItem(item._id)}>
              Delete
            </Button>
          </HStack>
        ))}
        <VStack width="100%" spacing={4}>
          <Input
            placeholder="Item Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <Input
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          />
          <Input
            placeholder="Price"
            type="number"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          />
          <Select
            placeholder="Select Category"
            value={newItem.category}
            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          >
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name} ({category.area})
              </option>
            ))}
          </Select>
          <Button colorScheme="blue" onClick={handleAddItem}>
            Add Item
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

export default MenuItemManagement;
