import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button,
  FormControl, FormLabel, Input, Text, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, Box, Flex
} from '@chakra-ui/react';

const OrderModal = ({ isOpen, onClose, onSave, items, order, user }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [error, setError] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    if (order) {
      setSelectedItems(order.items.map(item => ({
        itemId: item?.itemId._id,
        name: item?.itemId.name,
        quantity: item?.quantity,
        sellPrice: item?.itemId.sellPrice
      })));
      setNumberOfPeople(order.numberOfPeople);
    } else {
      setSelectedItems([]);
      setNumberOfPeople(1);
    }
  }, [order]);

  const handleAddItem = (item) => {
    if (parseInt(quantity) <= 0) return;

    const currentItem = selectedItems.find(i => i.itemId === item._id);
    const currentQuantity = currentItem ? currentItem.quantity : 0;

    if (currentQuantity + parseInt(quantity) > item.quantity) {
      setError(`You can only add up to ${item.quantity - currentQuantity} of ${item.name}`);
      return;
    }

    setSelectedItems(prevItems => {
      const updatedItems = prevItems.map(i => 
        i.itemId === item._id ? { ...i, quantity: i.quantity + parseInt(quantity) } : i
      );
      if (!currentItem) {
        updatedItems.push({ itemId: item._id, name: item.name, quantity: parseInt(quantity), sellPrice: item.sellPrice });
      }
      return updatedItems;
    });
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
      ...order,
      items: selectedItems.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        sellPrice: item.sellPrice // Include sellPrice
      })),
      totalPrice: calculateTotalPrice(),
      createdBy: user._id,
      numberOfPeople,
      status: order ? order.status : 'Pending'
    };
    onSave(newOrder);
    onClose();
  };

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const renderCategories = () => {
    return (
      <Box>
        <Text fontWeight="bold" mb={2}>Categories</Text>
        <Flex wrap="wrap" gap={4}>
          {Object.keys(groupedItems).map(category => (
            <Box
              key={category}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              cursor="pointer"
              onClick={() => setCurrentCategory(category)}
            >
              <Text>{category}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    );
  };

  const renderItems = (category) => {
    return (
      <Box>
        <Button mb={4} onClick={() => setCurrentCategory(null)}>Regresar a categorias</Button>
        <Text fontWeight="bold" mb={2}>{category}</Text>
        <Flex wrap="wrap" gap={4}>
          {groupedItems[category].map(item => (
            <Box
              key={item._id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              cursor="pointer"
              onClick={() => handleAddItem(item)}
            >
              <Text>{item.name}</Text>
              <Text>Available: {item.quantity}</Text>
              <Text>Price: ${item.sellPrice.toFixed(2)}</Text>
            </Box>
          ))}
        </Flex>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{order ? 'Editar Orden' : 'Crear Orden'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          <FormControl mb={4}>
            <FormLabel>Cantidad personas</FormLabel>
            <Input
              type="number"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value, 10))}
            />
          </FormControl>
          {currentCategory ? renderItems(currentCategory) : renderCategories()}
          <Table variant="simple" size="sm" mt={4}>
            <Thead>
              <Tr>
                <Th>Cantidad</Th>
                <Th>Producto</Th>
                <Th>Total</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {selectedItems.slice(0, 5).map((item, index) => (
                <Tr key={index}>
                  <Td>
                    <Input
                      type="number"
                      value={item.quantity.toString()}
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
          <Text fontWeight="bold" textAlign="right" mt={4}>Total de cuenta: ${calculateTotalPrice().toFixed(2)}</Text>
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
