import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button,
  FormControl, FormLabel, Input, Text, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, Box, Flex, IconButton
} from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import '../App.css'; // Import custom CSS for animations

const OrderModal = ({ isOpen, onClose, onSave, items = [], order, user }) => {  // Default `items` to an empty array
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [error, setError] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [clickedItem, setClickedItem] = useState(null); // State to handle the clicked item animation
  const itemsContainerRef = useRef(null); // Ref for the items container

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

    setClickedItem(item._id); // Set clicked item for animation

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

    setTimeout(() => {
      setClickedItem(null); // Remove animation class after animation completes
    }, 300); // Animation duration
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
        sellPrice: item.sellPrice
      })),
      totalPrice: calculateTotalPrice(),
      createdBy: user._id,
      numberOfPeople,
      status: order ? order.status : 'Created'
    };
    onSave(newOrder);
    onClose();
  };

  // Ensure that `items` exists and is an array before trying to group items
  const groupedItems = items?.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {}) || {}; // Fallback to empty object if items is undefined

  const scrollLeft = () => {
    itemsContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    itemsContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const renderCategories = () => {
    return (
      <Box>
        <Text fontWeight="bold" mb={2}>Categorias</Text>
        <Flex wrap="wrap" gap={4} justify="center">
          {Object.keys(groupedItems).map(category => (
            <Box
              key={category}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              cursor="pointer"
              onClick={() => setCurrentCategory(category)}
              className="item-card"
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
        <Button mb={4} onClick={() => setCurrentCategory(null)} colorScheme="gray">Regresar a categorias</Button>
        <Text fontWeight="bold" mb={2}>{category}</Text>
        <Flex wrap="nowrap" gap={4} justify="center" align="center">
          <IconButton icon={<ArrowBackIcon />} onClick={scrollLeft} />
          <Box className="items-container" ref={itemsContainerRef}>
            {groupedItems[category].map(item => (
              <Box
                key={item._id}
                p={2}
                borderWidth="1px"
                borderRadius="lg"
                cursor="pointer"
                onClick={() => handleAddItem(item)}
                className={`item-card ${clickedItem === item._id ? 'clicked' : ''}`} // Add animation class
              >
                <Text>{item.name}</Text>
                <Text>Disp: {item.quantity}</Text>
                <Text>${item.sellPrice.toFixed(2)}</Text>
              </Box>
            ))}
          </Box>
          <IconButton icon={<ArrowForwardIcon />} onClick={scrollRight} />
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
            <FormLabel htmlFor="numberOfPeople">Cantidad personas</FormLabel>
            <Input
              id="numberOfPeople"
              type="number"
              value={numberOfPeople}
              placeholder="Enter number of people"
              onChange={(e) => setNumberOfPeople(parseInt(e.target.value, 10))}
            />
          </FormControl>
          {currentCategory ? renderItems(currentCategory) : renderCategories()}
          <Table variant="simple" size="sm" mt={4}>
            <Thead>
              <Tr>
                <Th fontWeight="bold">Cantidad</Th>
                <Th fontWeight="bold">Producto</Th>
                <Th fontWeight="bold">Total</Th>
                <Th fontWeight="bold">Acciones</Th>
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
        <ModalFooter bg="gray.100">
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
