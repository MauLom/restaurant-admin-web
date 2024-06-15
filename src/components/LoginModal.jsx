import React, { useState, useContext } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/authenticate`, { username, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      onClose();
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  const handleLoginByPin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/authenticate/pin`, { username, pin });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      onClose();
    } catch (err) {
      setError(err.response.data.error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Tabs isFitted variant="enclosed">
            <TabList mb="1em">
              <Tab>Password</Tab>
              <Tab>PIN</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <FormControl mb={4}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
                <FormControl mb={6}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormControl>
                <Button colorScheme="teal" onClick={handleLogin}>Login</Button>
              </TabPanel>
              <TabPanel>
                <FormControl mb={4}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormControl>
                <FormControl mb={6}>
                  <FormLabel>PIN</FormLabel>
                  <Input
                    placeholder="PIN"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </FormControl>
                <Button colorScheme="teal" onClick={handleLoginByPin}>Login</Button>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
