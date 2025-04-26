import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Button, Input, Select, Text } from '@chakra-ui/react';
import api from '../../services/api';
import { useCustomToast } from '../../hooks/useCustomToast';

function MenuCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryArea, setNewCategoryArea] = useState('kitchen'); // Default area
  const toast = useCustomToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/menu/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch categories.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchCategories();
  }, [toast]);

  const handleAddCategory = async () => {
    try {
      const response = await api.post('/menu/categories', { name: newCategoryName, area: newCategoryArea });
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setNewCategoryArea('kitchen'); // Reset to default area
      toast({
        title: 'Category added',
        description: 'New category has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/menu/categories/${categoryId}`);
      setCategories(categories.filter(category => category._id !== categoryId));
      toast({
        title: 'Category deleted',
        description: 'Category has been deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Manage Menu Categories</Text>
      <VStack spacing={4}>
        {categories.map(category => (
          <HStack key={category._id} width="100%" justify="space-between">
            <Text>{category.name} ({category.area})</Text>
            <Button colorScheme="red" onClick={() => handleDeleteCategory(category._id)}>
              Delete
            </Button>
          </HStack>
        ))}
        <HStack width="100%" justify="space-between">
          <Input
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Select
            value={newCategoryArea}
            onChange={(e) => setNewCategoryArea(e.target.value)}
          >
            <option value="kitchen">Kitchen</option>
            <option value="bar">Bar</option>
          </Select>
          <Button colorScheme="blue" onClick={handleAddCategory}>
            Add Category
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default MenuCategoryManagement;
