import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Heading, Text, Button, Flex, IconButton } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PublicMenu = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const itemsContainerRef = React.useRef(null);
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [API_URL]);

  // Add item to the selection
  const handleAddItem = (item) => {
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

  // Subtract item from the selection
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

  // Proceed to create the order
  const handleProceedToCheckout = async () => {
    const newOrder = {
      items: selectedItems.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        sellPrice: item.sellPrice
      })),
      totalPrice: selectedItems.reduce((total, item) => total + item.sellPrice * item.quantity, 0),
      createdBy: "anonymous_user",  // For non-logged-in users
      status: 'Pending'
    };

    try {
      await axios.post(`${API_URL}/orders/create`, newOrder);
      setSelectedItems([]);  // Reset selected items after order creation
      alert("Order created successfully!");
      navigate('/orders');  // Redirect to orders page
    } catch (error) {
      console.error('Error creating order:', error);
      alert("Failed to create order.");
    }
  };

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <Flex direction={{ base: 'column', md: 'row' }}>
      {/* Menu Section */}
      <Box flex="1" p={4}>
        <Heading>Public Menu</Heading>
        <Flex justify="space-between" mb={4}>
          <Button colorScheme="blue" onClick={() => setCurrentCategory(null)}>All Categories</Button>
          <Text>Selected Items: {selectedItems.length}</Text>
        </Flex>

        {currentCategory ? (
          <Box>
            <Button mb={4} onClick={() => setCurrentCategory(null)} colorScheme="gray">Back to Categories</Button>
            <Text fontWeight="bold" mb={2}>{currentCategory}</Text>
            <Flex wrap="wrap" gap={4} align="center">
              <IconButton icon={<ArrowBackIcon />} onClick={() => itemsContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })} />
              <SimpleGrid columns={[1, 2, 3]} spacing={4} flex="1" ref={itemsContainerRef}>
                {groupedItems[currentCategory].map((item) => (
                  <Box key={item._id} p={4} borderWidth="1px" borderRadius="lg" onClick={() => handleAddItem(item)}>
                    <Text>{item.name}</Text>
                    <Text>Price: ${item.sellPrice.toFixed(2)}</Text>
                  </Box>
                ))}
              </SimpleGrid>
              <IconButton icon={<ArrowForwardIcon />} onClick={() => itemsContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })} />
            </Flex>
          </Box>
        ) : (
          <SimpleGrid columns={[2, 3, 4]} spacing={4}>
            {Object.keys(groupedItems).map((category) => (
              <Box key={category} p={4} borderWidth="1px" borderRadius="lg" cursor="pointer" onClick={() => setCurrentCategory(category)}>
                <Text>{category}</Text>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Order Summary Section */}
      <Box width={{ base: '100%', md: '300px' }} bg="gray.100" p={4} borderLeftWidth={{ md: '1px' }} minH="100vh">
        <Heading size="md">Your Order</Heading>
        {selectedItems.map((item, index) => (
          <Flex key={index} justify="space-between" align="center" my={2}>
            <Text>{item.name}</Text>
            <Text>${(item.sellPrice * item.quantity).toFixed(2)}</Text>
            <Flex>
              <Button size="sm" onClick={() => handleSubtractItem(item)}>-</Button>
              <Text mx={2}>{item.quantity}</Text>
              <Button size="sm" onClick={() => handleAddItem(item)}>+</Button>
            </Flex>
          </Flex>
        ))}
        <Text fontWeight="bold" mt={4}>
          Total: ${selectedItems.reduce((total, item) => total + item.sellPrice * item.quantity, 0).toFixed(2)}
        </Text>
        <Button colorScheme="green" mt={4} onClick={handleProceedToCheckout}>Proceed to Checkout</Button>
      </Box>
    </Flex>
  );
};

export default PublicMenu;
