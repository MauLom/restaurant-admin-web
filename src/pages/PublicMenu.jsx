// pages/PublicMenu.jsx
import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid, Heading, Text, Button, Flex, IconButton } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import axios from 'axios';

const PublicMenu = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const itemsContainerRef = React.useRef(null);

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

  const handleAddItem = (item) => {
    setSelectedItems((prevItems) => [...prevItems, item]);
  };

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const scrollLeft = () => {
    itemsContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    itemsContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <Box>
      <Heading>Public Menu</Heading>
      <Flex justify="space-between" mb={4}>
        <Button colorScheme="blue" onClick={() => setCurrentCategory(null)}>All Categories</Button>
        <Text>Selected Items: {selectedItems.length}</Text>
      </Flex>

      {currentCategory ? (
        <Box>
          <Button mb={4} onClick={() => setCurrentCategory(null)} colorScheme="gray">Back to Categories</Button>
          <Text fontWeight="bold" mb={2}>{currentCategory}</Text>
          <Flex wrap="nowrap" gap={4} align="center">
            <IconButton icon={<ArrowBackIcon />} onClick={scrollLeft} />
            <Box className="items-container" ref={itemsContainerRef}>
              {groupedItems[currentCategory].map((item) => (
                <Box key={item._id} p={4} borderWidth="1px" borderRadius="lg" onClick={() => handleAddItem(item)}>
                  <Text>{item.name}</Text>
                  <Text>Price: ${item.sellPrice.toFixed(2)}</Text>
                </Box>
              ))}
            </Box>
            <IconButton icon={<ArrowForwardIcon />} onClick={scrollRight} />
          </Flex>
        </Box>
      ) : (
        <SimpleGrid columns={2} spacing={4}>
          {Object.keys(groupedItems).map((category) => (
            <Box key={category} p={4} borderWidth="1px" borderRadius="lg" cursor="pointer" onClick={() => setCurrentCategory(category)}>
              <Text>{category}</Text>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default PublicMenu;
