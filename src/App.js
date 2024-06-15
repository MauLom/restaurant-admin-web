import React, { useContext, useEffect } from 'react';
import { Route, Navigate, Routes, useNavigate } from 'react-router-dom';
import { Box, Heading, Container, Flex, Spacer, Button, VStack, useDisclosure } from '@chakra-ui/react';
import { PackageIcon, ListUnorderedIcon, PersonIcon, GraphIcon } from '@primer/octicons-react';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Card from './components/Card';
import LoginModal from './components/LoginModal';
import { UserContext } from './context/UserContext';
import './App.css';
import Analysis from './pages/Analysis';


function App() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = JSON.parse(atob(token.split('.')[1]));
      setUser({ _id: userData.userId, username: userData.username });
    }
  }, [setUser]);


  return (
    <Box>
      <Flex as="header" bg="teal.500" p={4} color="white">
        <Heading as="h1" size="lg">Resto-Bar Admin</Heading>
        <Spacer />
        {user ? (
          <Button onClick={() => { localStorage.removeItem('token'); setUser(null); }}>Log Out</Button>
        ) : (
          <Button onClick={onOpen}>Login</Button>
        )}
      </Flex>
      <Container maxW="container.md" mt={4}>
        <Routes>
          <Route path="/inventory" element={user ? <Inventory /> : <Navigate to="/" />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/" />} />
          <Route path="/users" element={user ? <Users /> : <Navigate to="/" />} />
          <Route path="/analysis" element={user ? <Analysis /> : <Navigate to="/" />} />

          <Route path="/" element={
            user ? (
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
                 <Card
                  icon={<GraphIcon size={48} />}
                  title="Balances"
                  onClick={() => navigate('/analysis')}


                />
              </VStack>
            ) : (
              <Navigate to="/" />
            )
          } />
        </Routes>
      </Container>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default App;
