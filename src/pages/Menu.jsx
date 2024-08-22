import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Box, Heading, Flex, Spacer, Button, SimpleGrid, useDisclosure
} from '@chakra-ui/react';
import Breadcrumbs from '../components/Breadcrumbs';
import axios from 'axios';
import MenuItemCard from '../components/MenuItemCard';  // A new component to display each menu item
import MenuModal from '../components/MenuModal';  // A modal to create/edit menu items\
import ConfigurationModal from '../components/ConfigurationModal';  // A modal to configure the menu
import { UserContext } from '../context/UserContext';
import io from 'socket.io-client';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure();  // Configuration modal controls
  const { user } = useContext(UserContext);
  const socketRef = useRef(null);

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
  ];

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    socketRef.current = io(API_URL.replace("/api", ""));

    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/menu`);
        setMenuItems(response.data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();

    socketRef.current.on('menuItemCreated', (newMenuItem) => {
      setMenuItems((prevItems) => [...prevItems, newMenuItem]);
    });

    socketRef.current.on('menuItemUpdated', (updatedMenuItem) => {
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item._id === updatedMenuItem._id ? updatedMenuItem : item
        )
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [API_URL]);

  const handleSaveMenuItem = async (newMenuItem) => {
    try {
      const response = await axios.post(`${API_URL}/menu/create`, newMenuItem);
      const populatedMenuItem = response.data;
      setMenuItems([...menuItems, populatedMenuItem]);
    } catch (error) {
      console.error('Error creating menu item:', error);
    }
  };

  const handleUpdateMenuItem = async (updatedMenuItem) => {
    try {
      await axios.put(`${API_URL}/menu/update/${updatedMenuItem._id}`, updatedMenuItem);
      const response = await axios.get(`${API_URL}/menu`);
      setMenuItems(response.data);
      onClose();
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const handleCardClick = (menuItem) => {
    setSelectedMenuItem(menuItem);
    onOpen();
  };

  return (
    <Box>
      <Flex as="nav" bg="gray.100" p={4} borderBottom="1px solid #e2e2e2">
        <Breadcrumbs items={breadcrumbItems} />
        <Spacer />
        <Button colorScheme="teal" size="lg" onClick={onConfigOpen}>
          Configurations
        </Button>
      </Flex>
      <Flex mt={4} mb={4} align="center" p={4}>
        <Heading as="h1" size="xl" mb={2}>Gestion de Menu</Heading>
        <Spacer />
        <Button colorScheme="teal" size="lg" onClick={() => { setSelectedMenuItem(null); onOpen(); }}>
          Crear Plato
        </Button>
      </Flex>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {menuItems.map(item => (
          <MenuItemCard
            key={item._id}
            menuItem={item}
            onClick={handleCardClick}
          />
        ))}
      </SimpleGrid>

      {/* Menu Modal */}
      <MenuModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={selectedMenuItem ? handleUpdateMenuItem : handleSaveMenuItem}
        menuItem={selectedMenuItem}
      />

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={isConfigOpen}
        onClose={onConfigClose}
      />
    </Box>
  );
};

export default Menu;
