import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button,
  FormControl, FormLabel, Input
} from '@chakra-ui/react';

const ItemModal = ({ isOpen, onClose, onSave, item }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [costAmount, setCostAmount] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setSellPrice(item.sellPrice);
      setCostAmount(item.costAmount);
    } else {
      setName('');
      setQuantity('');
      setSellPrice('');
      setCostAmount('');
    }
  }, [item]);

  const handleSave = () => {
    const newItem = {
      name,
      quantity: parseInt(quantity, 10),
      sellPrice: parseFloat(sellPrice),
      costAmount: parseFloat(costAmount)
    };
    onSave(newItem);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{item ? 'Edit Item' : 'Add New Item'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Item Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Quantity</FormLabel>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Sell Price</FormLabel>
            <Input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Cost</FormLabel>
            <Input type="number" value={costAmount} onChange={(e) => setCostAmount(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ItemModal;
