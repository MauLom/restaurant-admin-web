import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Box,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';

const MenuModal = ({ isOpen, onClose, onSave, menuItem }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(0);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // Add category state
  const [ingredients, setIngredients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch inventory items to populate the ingredient selection
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        setInventoryItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, [API_URL]);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setPrice(menuItem.price);
      setImage(menuItem.image);
      setAvailable(menuItem.available);
      setDescription(menuItem.description || '');
      setCategory(menuItem.category || ''); // Set the category
      setIngredients(menuItem.ingredients || []);
    } else {
      setName('');
      setPrice(0);
      setImage('');
      setAvailable(0);
      setDescription('');
      setCategory(''); // Reset the category
      setIngredients([]);
    }
  }, [menuItem]);

  // Handle adding a new ingredient
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { inventoryItem: '', quantity: 1 }]);
  };

  // Handle changing the inventory item or quantity for an ingredient
  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setIngredients(updatedIngredients);
  };

  // Handle removing an ingredient
  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const newItem = {
      name,
      price,
      image,
      available,
      description,
      category, // Include category in the submission
      ingredients: ingredients.map(ingredient => ({
        inventoryItem: ingredient.inventoryItem,
        quantity: ingredient.quantity,
      })),
    };

    if (menuItem) {
      newItem._id = menuItem._id; // Retain the same ID when updating
    }

    onSave(newItem);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{menuItem ? 'Editar item del menu' : 'Crear Item del menu'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Nombre</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Precio</FormLabel>
            <NumberInput value={price} onChange={(valueString) => setPrice(parseFloat(valueString))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Categoria</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Selecciona categoria</option>
              <option value="Comida">Comida</option>
              <option value="Bebida sin alcohol">Bebida sin alcohol</option>
              <option value="Cerveza">Cerveza</option>
              <option value="Tragos">Tragos</option>
              <option value="Coctel">Coctel</option>
              <option value="Otro">Otro</option>
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Imagen URL</FormLabel>
            <Input value={image} onChange={(e) => setImage(e.target.value)} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Descripcion</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Cantidad disponible</FormLabel>
            <NumberInput value={available} onChange={(valueString) => setAvailable(parseInt(valueString))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Ingredientes</FormLabel>
            {ingredients.map((ingredient, index) => (
              <Flex key={index} alignItems="center" mb={2}>
                <Select
                  placeholder="Select ingredient"
                  value={ingredient.inventoryItem}
                  onChange={(e) => handleIngredientChange(index, 'inventoryItem', e.target.value)}
                  mr={2}
                >
                  {inventoryItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
                <NumberInput
                  value={ingredient.quantity}
                  min={1}
                  onChange={(valueString) => handleIngredientChange(index, 'quantity', parseInt(valueString))}
                  width="100px"
                  mr={2}
                >
                  <NumberInputField />
                </NumberInput>
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleRemoveIngredient(index)}
                />
              </Flex>
            ))}
            <Button mt={2} onClick={handleAddIngredient} leftIcon={<AddIcon />}>
              Agregar ingrediente
            </Button>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
            {menuItem ? 'Guardar elemento' : 'Crear item'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MenuModal;
