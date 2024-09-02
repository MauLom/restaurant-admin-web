import React, { useState } from 'react';
import { Box, VStack, HStack, Button, Text, Input, NumberInput, NumberInputField, useToast } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

const initialInventory = [
  { id: 1, name: "Steak", quantity: 50, price: 20.00 },
  { id: 2, name: "Wine", quantity: 30, price: 15.00 },
  { id: 3, name: "Salad", quantity: 40, price: 10.00 }
];

function InventoryManagement() {
  const [inventory, setInventory] = useState(initialInventory);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, price: 0 });
  const toast = useToast();
  const { t } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleAddItem = () => {
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

    const newItemId = inventory.length ? inventory[inventory.length - 1].id + 1 : 1;
    setInventory([...inventory, { ...newItem, id: newItemId }]);
    setNewItem({ name: '', quantity: 0, price: 0 });
  };

  const handleDeleteItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('inventoryManagement')}</Text>
      <VStack spacing={4} align="start">
        {inventory.map(item => (
          <Box key={item.id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between">
              <Text>{item.name} - {t('quantity')}: {item.quantity} - {t('price')}: ${item.price.toFixed(2)}</Text>
              <Button colorScheme="red" size="sm" onClick={() => handleDeleteItem(item.id)}>
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
          <Button colorScheme="green" onClick={handleAddItem}>{t('addItem')}</Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default InventoryManagement;
