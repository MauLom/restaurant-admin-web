import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button,
  FormControl, FormLabel, Input, Select, Text, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon
} from '@chakra-ui/react';

const OrderModal = ({ isOpen, onClose, onSave, items, order, user }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantity, setQuantity] = useState('1'); // Initialize as string
  const [selectedItem, setSelectedItem] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1); // Add this state
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedItems(order.items);
      setNumberOfPeople(order.numberOfPeople); // Set number of people if editing order
    } else {
      setSelectedItems([]);
      setNumberOfPeople(1); // Reset to 1 if creating new order
    }
  }, [order]);

  const handleAddItem = () => {
    if (!selectedItem || parseInt(quantity) <= 0) return;

    const item = items.find(item => item._id === selectedItem);
    const currentItem = selectedItems.find(i => i.itemId === selectedItem);
    const currentQuantity = currentItem ? currentItem.quantity : 0;

    if (currentQuantity + parseInt(quantity) > item.quantity) {
      setError(`You can only add up to ${item.quantity - currentQuantity} of ${item.name}`);
      return;
    }

    setSelectedItems(prevItems => {
      const updatedItems = prevItems.map(i => 
        i.itemId === selectedItem ? { ...i, quantity: i.quantity + parseInt(quantity) } : i
      );
      if (!currentItem) {
        updatedItems.push({ itemId: item._id, name: item.name, quantity: parseInt(quantity), sellPrice: item.sellPrice });
      }
      return updatedItems;
    });
    setSelectedItem('');
    setQuantity('1');
    setError('');
  };

  const handleItemChange = (index, quantity) => {
    const updatedItems = selectedItems.map((item, idx) => idx === index ? { ...item, quantity: parseInt(quantity, 10) } : item);
    setSelectedItems(updatedItems);
  };

  const handleDeleteItem = (index) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + (item.quantity * (item.sellPrice || 0)), 0);
  };

  const handleSave = () => {
    const newOrder = {
      items: selectedItems.map(item => ({
        itemId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        cost: item.costAmount || 0,
        sellPrice: item.sellPrice || 0
      })),
      totalPrice: calculateTotalPrice(),
      createdBy: user._id, // Assuming you have user information available
      numberOfPeople,
      status: order ? order.status : 'Pending'
    };
    onSave(newOrder);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{order ? 'Edit Order' : 'Create Order'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          <FormControl mb={4}>
            <FormLabel>Select Item</FormLabel>
            <Select
              placeholder="Select item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              {items.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name} (Available: {item.quantity})
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Number of People</FormLabel>
            <Input
              type="number"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value, 10))}
            />
          </FormControl>
          <Button onClick={handleAddItem} mb={4}>
            Add Item
          </Button>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Qty</Th>
                <Th>Item</Th>
                <Th>Total</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {selectedItems.slice(0, 5).map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Input
                      type="number"
                      value={item.quantity.toString()} // Ensure it's a string
                      onChange={(e) => handleItemChange(index, e.target.value)}
                    />
                  </Td>
                  <Td>{item.name}</Td>
                  <Td>${(item.quantity * (item.sellPrice || 0)).toFixed(2)}</Td>
                  <Td>
                    <Button size="sm" colorScheme="red" onClick={() => handleDeleteItem(index)}>Delete</Button>
                  </Td>
                </Tr>
              ))}
              {selectedItems.length > 5 && (
                <Tr>
                  <Td colSpan={4} textAlign="center">and more...</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
          <Text fontWeight="bold" textAlign="right" mt={4}>Total Price: ${calculateTotalPrice().toFixed(2)}</Text>
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

export default OrderModal;
