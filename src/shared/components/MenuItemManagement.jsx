import React, { useState, useEffect, useRef } from 'react';
import {
  Box, VStack, HStack, Button, Input, Text, Select, useToast, Grid, Image, IconButton, Collapse, Heading,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from '@chakra-ui/react';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import api from '../../services/api';

function MenuItemManagement() {
  const [categories, setCategories] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '', image: '', ingredients: [] });
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  const [deletingItem, setDeletingItem] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, itemsRes, inventoryRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu/items'),
          api.get('/inventory')
        ]);
        setCategories(categoriesRes.data);
        setItems(itemsRes.data);
        setInventoryItems(inventoryRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch data.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchData();
  }, [toast]);

  const resetForm = () => {
    setNewItem({ name: '', description: '', price: '', category: '', image: '', ingredients: [] });
    setEditingItem(null);
  };

  const handleAddIngredient = () => {
    setNewItem({
      ...newItem,
      ingredients: [...newItem.ingredients, { inventoryItem: '', quantity: '', unit: '' }]
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...newItem.ingredients];
    updatedIngredients[index][field] = value;
    setNewItem({ ...newItem, ingredients: updatedIngredients });
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = [...newItem.ingredients];
    updatedIngredients.splice(index, 1);
    setNewItem({ ...newItem, ingredients: updatedIngredients });
  };

  const handleAddItem = async () => {
    try {
      const response = await api.post('/menu/items', newItem);
      setItems([...items, response.data]);
      resetForm();
      toast({
        title: 'Item added',
        description: 'New item has been added successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setShowAddForm(false);
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

  const handleUpdateItem = async () => {
    try {
      const response = await api.put(`/menu/items/${editingItem._id}`, newItem);
      const updatedItem = response.data;
      setItems(items.map(item => item._id === updatedItem._id ? updatedItem : item));
      resetForm();
      toast({
        title: 'Item updated',
        description: 'Item has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Error',
        description: 'Failed to update item.',
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
      setDeletingItem(null);
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

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category?._id || '',
      image: item.image || '',
      ingredients: item.ingredients || []
    });
    setShowAddForm(true);
  };

  return (
    <Box p={4}>
      <Heading as="h2" size="xl" mb={4}>Manage Menu Items</Heading>
      <Button leftIcon={<FaPlus />} colorScheme="blue" mb={4} onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) resetForm(); }}>
        {showAddForm ? 'Close Form' : 'Add New Item'}
      </Button>

      <Collapse in={showAddForm} animateOpacity>
        <Box p={4} mb={4} borderWidth="1px" borderRadius="lg" shadow="md">
          <VStack spacing={4}>
            <Input placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <Input placeholder="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            <Input placeholder="Price" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            <Input placeholder="Image URL (optional)" value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} />
            <Select placeholder="Select Category" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name} ({category.area})</option>
              ))}
            </Select>

            <Box width="100%">
              <Text fontWeight="bold">Ingredientes</Text>
              <VStack spacing={2} align="stretch">
                {newItem.ingredients.map((ing, index) => (
                  <HStack key={index} align="start">
                    <Select placeholder="Selecciona ingrediente" value={ing.inventoryItem} onChange={(e) => handleIngredientChange(index, 'inventoryItem', e.target.value)}>
                      {inventoryItems.map(inv => (
                        <option key={inv._id} value={inv._id}>{inv.name}</option>
                      ))}
                    </Select>
                    <Input placeholder="Cantidad" type="number" value={ing.quantity} onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)} />
                    <Select placeholder="Unidad" value={ing.unit} onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}>
                      <option value="ml">ml</option>
                      <option value="g">g</option>
                      <option value="unit">unidad</option>
                    </Select>
                    <Button size="sm" colorScheme="red" onClick={() => handleRemoveIngredient(index)}>Quitar</Button>
                  </HStack>
                ))}
                <Button size="sm" onClick={handleAddIngredient}>+ Agregar ingrediente</Button>
              </VStack>
            </Box>

            <Button colorScheme="green" onClick={editingItem ? handleUpdateItem : handleAddItem}>{editingItem ? 'Update Item' : 'Save Item'}</Button>
          </VStack>
        </Box>
      </Collapse>

      <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
        {items.map(item => (
          <Box key={item._id} borderWidth="1px" borderRadius="lg" overflow="hidden" p={4} shadow="md">
            <Box mb={4} textAlign="center">
              {item.image ? (
                <Image src={item.image} alt={item.name} boxSize="150px" objectFit="cover" mx="auto" borderRadius="md" />
              ) : (
                <Box boxSize="150px" bg="gray.200" mx="auto" display="flex" alignItems="center" justifyContent="center" borderRadius="md">
                  <Text>No Image</Text>
                </Box>
              )}
            </Box>
            <VStack spacing={2} align="stretch">
              <Text fontWeight="bold">{item.name}</Text>
              <Text fontSize="sm" color="gray.600">{item.category?.name} ({item.category?.area})</Text>
              <Text fontSize="md" color="teal.500">${parseFloat(item.price).toFixed(2)}</Text>
              <HStack justify="space-between">
                <IconButton icon={<FaEdit />} colorScheme="yellow" onClick={() => handleEditItem(item)} aria-label="Edit Item" />
                <IconButton icon={<FaTrash />} colorScheme="red" onClick={() => setDeletingItem(item)} aria-label="Delete Item" />
              </HStack>
            </VStack>
          </Box>
        ))}
      </Grid>

      {deletingItem && (
        <AlertDialog isOpen={Boolean(deletingItem)} leastDestructiveRef={cancelRef} onClose={() => setDeletingItem(null)}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Item</AlertDialogHeader>
              <AlertDialogBody>¿Seguro de eliminar el producto "{deletingItem.name}"?</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setDeletingItem(null)}>Cancel</Button>
                <Button colorScheme="red" onClick={() => handleDeleteItem(deletingItem._id)} ml={3}>Delete</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </Box>
  );
}

export default MenuItemManagement;
