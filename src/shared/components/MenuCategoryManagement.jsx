import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Button, Input, Select, Text, useTheme } from '@chakra-ui/react';
import api from '../../services/api';
import { useCustomToast } from '../../hooks/useCustomToast';
import { useLanguage } from '../../context/LanguageContext';

function MenuCategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryArea, setNewCategoryArea] = useState('kitchen'); // Default area
  const toast = useCustomToast();
  const { t } = useLanguage();
  const theme = useTheme();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/menu/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingCategoriesDescription'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchCategories();
  }, [toast, t]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: t('errorTitle'),
        description: t('nameRequiredError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.post('/menu/categories', { name: newCategoryName, area: newCategoryArea });
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setNewCategoryArea('kitchen'); // Reset to default area
      toast({
        title: t('categoryAddedTitle'),
        description: t('categoryAddedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorAddingCategoryDescription'),
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
        title: t('categoryDeletedTitle'),
        description: t('categoryDeletedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorDeletingCategoryDescription'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('manageMenuCategories')}</Text>
      <VStack spacing={4}>
        {categories.map(category => (
          <HStack key={category._id} width="100%" justify="space-between">
            <Text>{category.name} ({category.area})</Text>
            <Button colorScheme="red" onClick={() => handleDeleteCategory(category._id)}>
              {t('delete')}
            </Button>
          </HStack>
        ))}
        <HStack width="100%" justify="space-between">
          <Input
            placeholder={t('newCategoryNamePlaceholder')}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Select
            value={newCategoryArea}
            onChange={(e) => setNewCategoryArea(e.target.value)}
          >
            <option value="kitchen" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Kitchen</option>
            <option value="bar" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Bar</option>
          </Select>
          <Button colorScheme="blue" onClick={handleAddCategory}>
            {t('addCategory')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default MenuCategoryManagement;
