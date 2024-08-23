import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Heading, Text, Button, Flex, IconButton, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PublicMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [clickedItemId, setClickedItemId] = useState(null);  // Track clicked item
  const itemsContainerRef = React.useRef(null);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        setMenuItems(response.data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, [API_URL]);

  const handleAddItem = (item) => {
    // Show a toast notification when the item is added
    toast({
      title: "Item added",
      description: `${item.name} fue agregado a tu orden`,
      status: "success",
      duration: 1500,
      isClosable: true,
      position: "top",
    });

    // Highlight the clicked item
    setClickedItemId(item._id);
    setTimeout(() => setClickedItemId(null), 500);  

    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        return prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const handleSubtractItem = (item) => {
    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem?.quantity === 1) {
        return prevItems.filter(i => i._id !== item._id);
      } else if (existingItem) {
        return prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevItems;
    });
  };

  const handleProceedToCheckout = async () => {
    const newOrder = {
      items: selectedItems.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        sellPrice: item.price
      })),
      totalPrice: selectedItems.reduce((total, item) => total + item.price * item.quantity, 0),
      createdBy: null,
      tableNumber: 1,
      numberOfPeople: 2,
      paymentMethod: 'None',
      status: 'Pending'
    };

    try {
      await axios.post(`${API_URL}/orders/create`, newOrder);
      setSelectedItems([]);
      alert("Se creo la orden!");
      // navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert("Failed to create order.");
    }
  };

  const groupedMenuItems = menuItems.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="stretch">
      <Box flex="1" p={4}>
        <Heading>Menu</Heading>
        <Flex justify="space-between" mb={4}>
          <Text>Cantidad de items seleccionados: {selectedItems.length}</Text>
          <Button colorScheme="blue" onClick={onOpen}>Resumen orden</Button> 
        </Flex>

        {currentCategory ? (
          <Box>
            <Button mb={4} onClick={() => setCurrentCategory(null)} colorScheme="gray">Ver todas las categorias</Button>
            <Text fontWeight="bold" mb={2}>{currentCategory}</Text>
            <Flex wrap="wrap" gap={4} align="center">
              <SimpleGrid columns={[1, 2, 3]} spacing={4} flex="1" ref={itemsContainerRef}>
                {groupedMenuItems[currentCategory].map((item) => (
                  <Box
                    key={item._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    cursor="pointer"
                    onClick={() => handleAddItem(item)}
                    bg={clickedItemId === item._id ? "green.100" : "white"}  // Add background highlight
                    boxShadow={clickedItemId === item._id ? "0 0 10px rgba(0, 128, 0, 0.6)" : "none"}  // Add shadow highlight
                    transition="all 0.3s ease-in-out"
                  >
                    <Text>{item.name}</Text>
                    <Text>Price: ${item.price.toFixed(2)}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Flex>
          </Box>
        ) : (
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {Object.keys(groupedMenuItems).map((category) => (
              <Box key={category} p={4} borderWidth="1px" borderRadius="lg" cursor="pointer" onClick={() => setCurrentCategory(category)}>
                <Text>{category}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Tu Pedido</DrawerHeader>
          <DrawerBody>
            {selectedItems.length === 0 ? (
              <Text>No haz seleccionado items </Text>
            ) : (
              selectedItems.map((item, index) => (
                <Flex key={index} justify="space-between" align="center" my={2}>
                  <Text>{item.name}</Text>
                  <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                  <Flex>
                    <Button size="sm" onClick={() => handleSubtractItem(item)}>-</Button>
                    <Text mx={2}>{item.quantity}</Text>
                    <Button size="sm" onClick={() => handleAddItem(item)}>+</Button>
                  </Flex>
                </Flex>
              ))
            )}
          </DrawerBody>
          <DrawerFooter>
            <Text fontWeight="bold" mr={4}>
              Total: ${selectedItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </Text>
            <Button colorScheme="green" onClick={handleProceedToCheckout}>Crear Orden</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default PublicMenu;
