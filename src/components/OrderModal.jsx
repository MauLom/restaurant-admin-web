import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button,
  FormControl, FormLabel, Input, Select, Text, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';

const OrderModal = ({ isOpen, onClose, onSave, items, order }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedItems(order.items);
    } else {
      setSelectedItems([]);
    }
  }, [order]);

  const handleAddItem = () => {
    if (selectedItem && quantity > 0) {
      const item = items.find(item => item._id === selectedItem);
      setSelectedItems([...selectedItems, { ...item, quantity }]);
    }
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
        itemId: item._id,
        name: item.name,
        quantity: item.quantity,
        cost: item.costAmount || 0,
        sellPrice: item.sellPrice || 0
      })),
      totalPrice: calculateTotalPrice(),
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
          <FormControl mb={4}>
            <FormLabel>Select Item</FormLabel>
            <Select
              placeholder="Select item"
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              {items.map(item => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Quantity</FormLabel>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
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
              {selectedItems.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Input
                      type="number"
                      value={item.quantity}
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
