import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input
} from '@chakra-ui/react';

const ItemModal = ({ isOpen, onClose, onSave, item }) => {
  const [name, setName] = useState('');
  const [sellPrice, setSellPrice] = useState(0);
  const [costAmount, setCostAmount] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setSellPrice(item.sellPrice);
      setCostAmount(item.costAmount);
      setQuantity(item.quantity);
      setCategory(item.category);
    } else {
      setName('');
      setSellPrice(0);
      setCostAmount(0);
      setQuantity(0);
      setCategory('');
    }
  }, [item]);

  const handleSubmit = () => {
    onSave({ name, sellPrice, costAmount, quantity, category });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{item ? 'Edit Item' : 'Add Item'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl id="name" mb={4}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl id="sellPrice" mb={4}>
            <FormLabel>Sell Price</FormLabel>
            <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(parseFloat(e.target.value))} />
          </FormControl>
          <FormControl id="costAmount" mb={4}>
            <FormLabel>Cost Amount</FormLabel>
            <Input type="number" value={costAmount} onChange={(e) => setCostAmount(parseFloat(e.target.value))} />
          </FormControl>
          <FormControl id="quantity" mb={4}>
            <FormLabel>Quantity</FormLabel>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} />
          </FormControl>
          <FormControl id="category" mb={4}>
            <FormLabel>Category</FormLabel>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ItemModal;
