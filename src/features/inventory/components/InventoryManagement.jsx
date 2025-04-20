import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Button, Text, Input, NumberInput, NumberInputField, useToast, Textarea
} from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0, cost: 0, tags: '', preparationInstructions: '' });
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/inventory');
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = async () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) {
      toast({
        title: t('invalidInputTitle'),
        description: t('invalidInputDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = {
        ...newItem,
        tags: newItem.tags.split(',').map(tag => tag.trim()),
      };
      const response = await api.post('/inventory', payload);
      setInventory([...inventory, response.data]);
      setNewItem({ name: '', quantity: 0, price: 0, cost: 0, tags: '', preparationInstructions: '' });
      toast({
        title: t('itemAddedTitle'),
        description: t('itemAddedDescription'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(inventory.filter(item => item._id !== id));
      toast({
        title: t('itemDeletedTitle'),
        description: t('itemDeletedDescription'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('inventoryManagement')}</Text>
      <VStack spacing={4} align="start">
        {inventory.map(item => (
          <Box key={item._id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between">
              <Text>{item.name} - {t('quantity')}: {item.quantity} - {t('price')}: ${item.price.toFixed(2)}</Text>
              <Button colorScheme="red" size="sm" onClick={() => handleDeleteItem(item._id)}>
                {t('delete')}
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Box mt={8}>
        <Text fontSize="lg" mb={2}>{t('addNewItem')}</Text>
        <VStack spacing={4} align="start">
          <Input
            placeholder={t('itemNamePlaceholder')}
            value={newItem.name}
            name="name"
            onChange={handleInputChange}
          />
          <NumberInput value={newItem.quantity} min={0}>
            <NumberInputField
              placeholder={t('quantityPlaceholder')}
              name="quantity"
              onChange={handleInputChange}
            />
          </NumberInput>
          <NumberInput value={newItem.price} min={0} precision={2} step={0.01}>
            <NumberInputField
              placeholder={t('pricePlaceholder')}
              name="price"
              onChange={handleInputChange}
            />
          </NumberInput>
          <NumberInput value={newItem.cost} min={0} precision={2} step={0.01}>
            <NumberInputField
              placeholder="Costo del producto"
              name="cost"
              onChange={handleInputChange}
            />
          </NumberInput>
          <Input
            placeholder="Etiquetas separadas por coma"
            value={newItem.tags}
            name="tags"
            onChange={handleInputChange}
          />
          <Textarea
            placeholder="Instrucciones de preparación (si aplica)"
            value={newItem.preparationInstructions}
            name="preparationInstructions"
            onChange={handleInputChange}
          />
          <Button colorScheme="green" onClick={handleAddItem}>{t('addItem')}</Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default InventoryManagement;
