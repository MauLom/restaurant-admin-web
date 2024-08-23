// components/SettingsSidebar.jsx
import React from 'react';
import { VStack, Box, Button } from '@chakra-ui/react';

const SettingsSidebar = ({ onSelectTab, selectedTab }) => {
  return (
    <Box
      as="aside"
      bg="gray.700"
      color="white"
      w="200px"
      h="100vh"
      p={4}
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={4}>
        <Button
          variant={selectedTab === 'appearance' ? 'solid' : 'ghost'}
          colorScheme="teal"
          onClick={() => onSelectTab('appearance')}
          w="full"
        >
          Appearance
        </Button>
        <Button
          variant={selectedTab === 'restaurant' ? 'solid' : 'ghost'}
          colorScheme="teal"
          onClick={() => onSelectTab('restaurant')}
          w="full"
        >
          Your Restaurant
        </Button>
        <Button
          variant={selectedTab === 'products' ? 'solid' : 'ghost'}
          colorScheme="teal"
          onClick={() => onSelectTab('products')}
          w="full"
        >
          Products Management
        </Button>
        <Button
          variant={selectedTab === 'menu' ? 'solid' : 'ghost'}
          colorScheme="teal"
          onClick={() => onSelectTab('menu')}
          w="full"
        >
          Gestion de Menu
        </Button>
        <Button
          variant={selectedTab === 'notifications' ? 'solid' : 'ghost'}
          colorScheme="teal"
          onClick={() => onSelectTab('notifications')}
          w="full"
        >
          Notifications
        </Button>
        <Button
          variant={selectedTab === 'security' ? 'solid' : 'ghost'}
          colorScheme="teal"
          onClick={() => onSelectTab('security')}
          w="full"
        >
          Security
        </Button>
      </VStack>
    </Box>
  );
};

export default SettingsSidebar;
