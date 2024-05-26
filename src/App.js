import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Heading, Container, Flex, Spacer, Button, VStack } from '@chakra-ui/react';
import { PackageIcon, ListUnorderedIcon, PersonIcon } from '@primer/octicons-react';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Card from './components/Card';
import './App.css';

function App() {
  const navigate = useNavigate();

  return (
    <Box>
      <Flex as="header" bg="teal.500" p={4} color="white">
        <Heading as="h1" size="lg">Resto-Bar Admin</Heading>
        <Spacer />
        <Button colorScheme="teal" variant="outline">Log Out</Button>
      </Flex>
      <Container maxW="container.md" mt={4}>
        <Routes>
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/users" element={<Users />} />
          <Route path="/" element={
            <VStack spacing={4}>
              <Heading>Welcome to Resto-Bar Admin</Heading>
              <Card
                icon={<PackageIcon size={48} />}
                title="Manage Inventory"
                onClick={() => navigate('/inventory')}
              />
              <Card
                icon={<ListUnorderedIcon size={48} />}
                title="Manage Orders"
                onClick={() => navigate('/orders')}
              />
              <Card
                icon={<PersonIcon size={48} />}
                title="Manage Users"
                onClick={() => navigate('/users')}
              />
              
            </VStack>
          } />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;
