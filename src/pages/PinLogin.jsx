import React, { useState } from 'react';
import { Box, Button, VStack, HStack, Text, Center, Flex, Grid, Img } from '@chakra-ui/react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuthContext } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';

function PinLogin() {
  const { t } = useLanguage();
  const { login } = useAuthContext();  // Get login method from AuthContext
  const { setUser } = useUserContext(); // Get setUser from UserContext

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleButtonClick = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleLogin = async () => {
    try {
      // Make the API request to login via PIN
      const response = await api.post('/users/login-pin', { pin });
      const token = response.data.token;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Fetch user profile after login
      const profileResponse = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = profileResponse.data.user;

      // Store the user object in UserContext
      setUser(user);

      // Use AuthContext login method to store auth status
      login(user);

      // Navigate based on user role or ask to complete profile
      if (!user.role) {
        navigate('/complete-profile');
      } else {
        switch (user.role) {
          case 'waiter':
            navigate('/dashboard/orders');
            break;
          case 'admin':
            navigate('/dashboard');
            break;
          case 'cashier':
            navigate('/dashboard/cashier');
            break;
          case 'kitchen':
            navigate('/dashboard/kitchen-orders');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      setError(t('invalidPin'));  // Show invalid pin message if login fails
      setPin('');  // Clear the pin input
    }
  };

  return (
    <Flex height="90vh" direction="column" align="center" justify="center">
      <Center flex="1">
        <Img className="logo" maxW="220px" src="maui-logo.png" />
      </Center>
      <Box textAlign="center">
        <Text fontSize="2xl" mb={4}>{t('enterPin')}</Text>
        <HStack justify="center" mb={4}>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              width="15px"
              height="15px"
              borderRadius="50%"
              bg={i < pin.length ? 'white' : '#444'}
              mx={1}
            />
          ))}
        </HStack>
        <VStack spacing={4}>
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
              <Button
                key={num}
                onClick={() => handleButtonClick(num.toString())}
                width="60px"
                height="60px"
                borderRadius="50%"
                bg="#333"
                color="white"
                _hover={{ bg: "#555" }}
              >
                {num}
              </Button>
            ))}
            <Button
              onClick={handleDelete}
              width="60px"
              height="60px"
              borderRadius="50%"
              bg="#333"
              color="white"
              _hover={{ bg: "#555" }}
            >
              ⌫
            </Button>
            <Button
              onClick={() => handleButtonClick('0')}
              width="60px"
              height="60px"
              borderRadius="50%"
              bg="#333"
              color="white"
              _hover={{ bg: "#555" }}
            >
              0
            </Button>
            <Button
              onClick={handleLogin}
              width="60px"
              height="60px"
              borderRadius="50%"
              bg={pin.length === 6 ? 'green.500' : 'gray.500'}
              color="white"
              isDisabled={pin.length !== 6}
              _hover={{ bg: pin.length === 6 ? "green.600" : "gray.600" }}
            >
              ✔
            </Button>
          </Grid>
          {error && <Text color="red.500">{error}</Text>}
        </VStack>
      </Box>
    </Flex>
  );
}

export default PinLogin;
