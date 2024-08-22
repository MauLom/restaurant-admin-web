// components/MenuModal.jsx
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
} from '@chakra-ui/react';

const MenuModal = ({ isOpen, onClose, onSave, menuItem }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(0);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setPrice(menuItem.price);
      setImage(menuItem.image);
      setAvailable(menuItem.available);
    } else {
      setName('');
      setPrice(0);
      setImage('');
      setAvailable(0);
    }
  }, [menuItem]);

  const handleSubmit = () => {
    const newItem = {
      name,
      price,
      image,
      available,
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
        <ModalHeader>{menuItem ? 'Edit Menu Item' : 'Create Menu Item'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Price</FormLabel>
            <NumberInput value={price} onChange={(valueString) => setPrice(parseFloat(valueString))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Image URL</FormLabel>
            <Input value={image} onChange={(e) => setImage(e.target.value)} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Available Quantity</FormLabel>
            <NumberInput value={available} onChange={(valueString) => setAvailable(parseInt(valueString))}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleSubmit}>
            {menuItem ? 'Save Changes' : 'Create Item'}
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MenuModal;
