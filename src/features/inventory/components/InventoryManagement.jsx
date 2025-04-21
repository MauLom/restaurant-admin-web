import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Button, Text, Input, NumberInput, NumberInputField, useToast, Select, IconButton
} from '@chakra-ui/react';
import { FaEdit } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', equivalentMl: '', equivalentGr: '', cost: '', tags: '' });
  const [editingItemId, setEditingItemId] = useState(null);
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

  const handleAddOrUpdateItem = async () => {
    if (!newItem.name || newItem.quantity <= 0 || !newItem.unit) {
      toast({
        title: t('invalidInputTitle'),
        description: t('invalidInputDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      ...newItem,
      equivalentMl: ['ml', 'l', 'bottle'].includes(newItem.unit) ? parseFloat(newItem.equivalentMl) || 0 : 0,
      equivalentGr: ['g', 'kg', 'unit'].includes(newItem.unit) ? parseFloat(newItem.equivalentGr) || 0 : 0,
      tags: newItem.tags.split(',').map(tag => tag.trim()),
    };

    try {
      if (editingItemId) {
        const response = await api.put(`/inventory/${editingItemId}`, payload);
        setInventory(inventory.map(item => item._id === editingItemId ? response.data : item));
        setEditingItemId(null);
        toast({ title: 'Producto actualizado', status: 'success', duration: 3000, isClosable: true });
      } else {
        const response = await api.post('/inventory', payload);
        setInventory([...inventory, response.data]);
        toast({ title: t('itemAddedTitle'), description: t('itemAddedDescription'), status: "success", duration: 3000, isClosable: true });
      }
      setNewItem({ name: '', quantity: '', unit: '', equivalentMl: '', equivalentGr: '', cost: '', tags: '' });
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({ title: t('errorTitle'), description: t('errorDescription'), status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item._id);
    setNewItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      equivalentMl: item.equivalentMl,
      equivalentGr: item.equivalentGr,
      cost: item.cost,
      tags: item.tags.join(', '),
    });
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
    <Box p={4} color="white">
      <Text fontSize="2xl" mb={4}>{t('inventoryManagement')}</Text>
      <VStack spacing={4} align="start">
        {inventory.map(item => (
          <Box key={item._id} p={4} borderWidth="1px" borderRadius="lg" width="100%">
            <HStack justify="space-between" width="100%">
              <Text>{item.name} - {t('quantity')}: {item.quantity} {item.unit || ''} - {item.cost ? `Costo aprox: $${item.cost.toFixed(2)}` : 'Sin costo estimado'}</Text>
              <HStack>
                <IconButton icon={<FaEdit />} onClick={() => handleEditItem(item)} size="sm" colorScheme="yellow" aria-label="Edit" />
                <Button colorScheme="red" size="sm" onClick={() => handleDeleteItem(item._id)}>
                  {t('delete')}
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      <Box mt={8}>
        <Text fontSize="lg" mb={2}>{editingItemId ? 'Editar producto' : t('addNewItem')}</Text>
        <VStack spacing={4} align="start">
          <Input placeholder={t('itemNamePlaceholder')} value={newItem.name} name="name" onChange={handleInputChange} />
          <NumberInput min={0}>
            <NumberInputField placeholder={t('quantityPlaceholder')} name="quantity" value={newItem.quantity} onChange={handleInputChange} />
          </NumberInput>
          <Select
            name="unit"
            value={newItem.unit}
            onChange={handleInputChange}
            placeholder="Unidad de medida"
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.400' }}
          >
            <option style={{ backgroundColor: '#2D3748' }} value="ml">Mililitros</option>
            <option style={{ backgroundColor: '#2D3748' }} value="l">Litros</option>
            <option style={{ backgroundColor: '#2D3748' }} value="g">Gramos</option>
            <option style={{ backgroundColor: '#2D3748' }} value="kg">Kilogramos</option>
            <option style={{ backgroundColor: '#2D3748' }} value="unit">Unidad</option>
            <option style={{ backgroundColor: '#2D3748' }} value="bottle">Botella</option>
          </Select>
          {['ml', 'l', 'bottle'].includes(newItem.unit) && (
            <NumberInput min={0} precision={2} step={0.01}>
              <NumberInputField
                placeholder="Contenido por unidad en mililitros (ml)"
                name="equivalentMl"
                value={newItem.equivalentMl}
                onChange={handleInputChange}
              />
            </NumberInput>
          )}
          {['g', 'kg', 'unit'].includes(newItem.unit) && (
            <NumberInput min={0} precision={2} step={0.01}>
              <NumberInputField
                placeholder="Peso aproximado por unidad (g)"
                name="equivalentGr"
                value={newItem.equivalentGr}
                onChange={handleInputChange}
              />
            </NumberInput>
          )}
          <NumberInput min={0} precision={2} step={0.01}>
            <NumberInputField
              placeholder="Costo del producto"
              name="cost"
              value={newItem.cost}
              onChange={handleInputChange}
            />
          </NumberInput>
          <Input
            placeholder="Etiquetas separadas por coma"
            value={newItem.tags}
            name="tags"
            onChange={handleInputChange}
          />
          <Button colorScheme="green" onClick={handleAddOrUpdateItem}>{editingItemId ? 'Guardar cambios' : t('addItem')}</Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default InventoryManagement;
