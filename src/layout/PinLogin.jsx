import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Button, VStack, HStack, Text, Center, Flex, Grid, Img, Input, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  FormControl, FormLabel,
  PinInput, PinInputField,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuthContext } from '../context/AuthContext';
import { useUserContext } from '../context/UserContext';
import { useDemoContext } from '../context/DemoContext';
import { useCustomToast } from '../hooks/useCustomToast';
import api from '../services/api';

function PinLogin() {
  const { t } = useLanguage();
  const { login } = useAuthContext();
  const { setUser } = useUserContext();
  const { enterDemoMode } = useDemoContext();
  const toast = useCustomToast();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [noUsers, setNoUsers] = useState(false);
  const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();

  useEffect(() => {
    const checkIfUsersExist = async () => {
      try {
        const response = await api.get('/users/exists');
        if (!response.data.exists) {
          setNoUsers(true);
        }
      } catch (error) {
        console.error('Error checking users existence:', error);
      }
    };
    checkIfUsersExist();
  }, []);

  const handleLogin = useCallback(async () => {
    try {
      const response = await api.post('/users/login-pin', { pin });
      const token = response.data.token;
      localStorage.setItem('token', token);

      const profileResponse = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = profileResponse.data.user;
      setUser(user);
      login(user);

      console.log('User profile:', user);
      console.log('Profile response:', profileResponse.data);
      if (!profileResponse.data.isProfileComplete) {
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
      setError(t('invalidPin'));
      setPin('');
    }
  }, [pin, setUser, login, navigate, t]);

  // Event listener para el teclado físico
  useEffect(() => {
    const handleKeyPress = (event) => {
      // No interceptar si hay un input/textarea enfocado (ej: modal de registro)
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // Solo procesar si no estamos en el modo de creación de usuario
      if (noUsers) return;

      const key = event.key;
      
      // Números del 0-9
      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        if (pin.length < 6) {
          setPin(prevPin => prevPin + key);
        }
      }
      // Tecla Backspace para borrar
      else if (key === 'Backspace') {
        event.preventDefault();
        setPin(prevPin => prevPin.slice(0, -1));
      }
      // Enter para confirmar si el PIN tiene 6 dígitos
      else if (key === 'Enter') {
        event.preventDefault();
        if (pin.length === 6) {
          handleLogin();
        }
      }
      // Escape para limpiar todo el PIN
      else if (key === 'Escape') {
        event.preventDefault();
        setPin('');
      }
    };

    // Agregar el event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Enfocar el contenedor para asegurar que capture las teclas
    if (containerRef.current) {
      containerRef.current.focus();
    }

    // Cleanup: remover el event listener cuando el componente se desmonte
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [pin, noUsers, handleLogin]); // Dependencias: pin para verificar longitud y noUsers para controlar el estado

  const handleButtonClick = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleDemoLogin = () => {
    try {
      // Initialize demo data
      const demoData = enterDemoMode();
      
      // Set demo admin user
      const demoAdmin = demoData.users.find(user => user.role === 'admin');
      setUser(demoAdmin);
      login(demoAdmin);
      
      // Set demo token
      localStorage.setItem('token', 'demo-token');
      
      toast({
        title: t('welcomeDemoTitle'),
        description: t('exploringDemoData'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to dashboard
      navigate('/dashboard/restaurant-status');
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('demoLoginError'),
        status: 'error'
      });
    }
  };

  function RegisterModal() {
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPin, setRegPin] = useState('');
    const [regConfirmPin, setRegConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
      if (!regUsername || regPin.length !== 6) {
        toast({ title: t('errorTitle'), description: t('usernameAndPinRequired'), status: 'error' });
        return;
      }
      if (regPin !== regConfirmPin) {
        toast({ title: t('errorTitle'), description: t('pinsDoNotMatch'), status: 'error' });
        return;
      }

      setLoading(true);
      try {
        await api.post('/users/register', {
          username: regUsername,
          email: regEmail || undefined,
          pin: regPin,
        });
        toast({ title: t('accountCreatedTitle'), description: t('accountCreatedDescription'), status: 'success' });
        onRegisterClose();
      } catch (err) {
        const msg = err.response?.data?.error || t('errorCreatingAccount');
        toast({ title: t('errorTitle'), description: msg, status: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const inputStyles = {
      bg: 'gray.700',
      border: 'none',
      color: 'white',
      _placeholder: { color: 'gray.400' },
      _focus: { bg: 'gray.600', boxShadow: '0 0 0 2px #319795' },
    };

    const pinFieldStyles = {
      bg: '#2a2a2a',
      border: '1px solid',
      borderColor: 'gray.600',
      color: 'white',
      _focus: { borderColor: 'teal.400', boxShadow: '0 0 0 1px #319795' },
    };

    return (
      <Modal isOpen={isRegisterOpen} onClose={onRegisterClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
        <ModalContent
          bg="#363636"
          color="white"
          borderRadius="xl"
          borderTop="3px solid"
          borderTopColor="teal.400"
          boxShadow="0 25px 50px rgba(0,0,0,0.6)"
        >
          <ModalHeader pb={1}>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold">{t('createAccountTitle')}</Text>
              <Text fontSize="xs" color="gray.400" fontWeight="normal">
                {t('completeFieldsToRegister')}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white', bg: 'gray.600' }} />

          <ModalBody pt={4} pb={2}>
            <VStack spacing={5}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="gray.300" mb={1}>{t('usernameLabel')}</FormLabel>
                <Input
                  placeholder={t('usernamePlaceholder')}
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  {...inputStyles}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="gray.300" mb={1}>
                  {t('emailPlaceholder')}{' '}
                  <Text as="span" fontSize="xs" color="gray.500">({t('optionalLabel')})</Text>
                </FormLabel>
                <Input
                  type="email"
                  placeholder={t('emailExamplePlaceholder')}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  {...inputStyles}
                />
              </FormControl>

              <Box w="full">
                <Divider borderColor="gray.600" mb={4} />
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.300" mb={2} textAlign="center">
                    {t('choosePinLabel')}
                  </FormLabel>
                  <HStack justify="center">
                    <PinInput type="number" value={regPin} onChange={setRegPin} size="lg" mask>
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                    </PinInput>
                  </HStack>
                </FormControl>

                <FormControl isRequired mt={4}>
                  <FormLabel fontSize="sm" color="gray.300" mb={2} textAlign="center">
                    {t('confirmPinLabel')}
                  </FormLabel>
                  <HStack justify="center">
                    <PinInput type="number" value={regConfirmPin} onChange={setRegConfirmPin} size="lg" mask>
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                      <PinInputField {...pinFieldStyles} />
                    </PinInput>
                  </HStack>
                  {regConfirmPin.length === 6 && regPin !== regConfirmPin && (
                    <Text fontSize="xs" color="red.400" textAlign="center" mt={2}>
                      {t('pinsDoNotMatch')}
                    </Text>
                  )}
                </FormControl>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter pt={4} gap={2}>
            <Button
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'white', bg: 'gray.600' }}
              onClick={onRegisterClose}
            >
              {t('cancel')}
            </Button>
            <Button
              bg="teal.500"
              color="white"
              _hover={{ bg: 'teal.600' }}
              _active={{ bg: 'teal.700' }}
              onClick={handleRegister}
              isLoading={loading}
              loadingText={t('creatingEllipsis')}
              px={6}
            >
              {t('createAccountTitle')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  function FirstAdminCreation() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminPin, setAdminPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateAdmin = async () => {
      if (!username || !password || !adminPin) {
        toast({ title: t('errorTitle'), description: t('allFieldsRequired'), status: 'error' });
        return;
      }

      setLoading(true);
      try {
        const accessRes = await api.post('/users/admin-access', { masterKey: 'maui-barrio-antiguo' });
        const token = accessRes.data.token;

        await api.post('/users/first-admin', {
          username,
          password,
          pin: adminPin,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast({ title: t('adminCreatedTitle'), description: t('adminCreatedDescription'), status: 'success' });
        window.location.reload();
      } catch (error) {
        toast({ title: t('errorTitle'), description: t('errorCreatingAdmin'), status: 'error' });
        console.error('Error creating admin:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <VStack spacing={4} w="full" maxW="sm">
        <Text fontSize="lg" fontWeight="bold" color="teal.300">{t('initialSetupTitle')}</Text>
        <Input placeholder={t('usernamePlaceholder')} value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder={t('passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input placeholder={t('pinSixDigitsPlaceholder')} value={adminPin} onChange={(e) => setAdminPin(e.target.value)} maxLength={6} />
        <Button colorScheme="teal" onClick={handleCreateAdmin} isLoading={loading}>
          {t('createAdminButton')}
        </Button>
      </VStack>
    );
  }

  return (
    <Flex
      ref={containerRef}
      minH="100vh"
      bg="#1c1c1c"
      color="white"
      direction="column"
      align="center"
      justify="center"
      tabIndex={0}
      outline="none"
      _focus={{ outline: "none" }}
    >
      <Center flex="1">
        <Img className="logo" maxW="220px" src="maui-logo.png" />
      </Center>

      <RegisterModal />

      {noUsers ? (
        <FirstAdminCreation />
      ) : (
        <VStack spacing={6}>
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
            
            {/* Indicador de que se puede usar el teclado físico */}
       
            
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
                <Button onClick={handleDelete} width="60px" height="60px" borderRadius="50%" bg="#333" color="white" _hover={{ bg: "#555" }}>
                  ⌫
                </Button>
                <Button onClick={() => handleButtonClick('0')} width="60px" height="60px" borderRadius="50%" bg="#333" color="white" _hover={{ bg: "#555" }}>
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

          <Divider />

          <Box textAlign="center" w="full">
            <VStack spacing={3}>
              <Button
                colorScheme="teal"
                variant="outline"
                size="lg"
                onClick={handleDemoLogin}
                w="full"
                maxW="300px"
              >
                🎭 {t('demoAccessButton')}
              </Button>
              <Text fontSize="sm" color="gray.500">
                {t('exploreDemoFeatures')}
              </Text>

              <Divider borderColor="gray.600" />

              <Button
                colorScheme="blue"
                variant="outline"
                size="md"
                onClick={onRegisterOpen}
                w="full"
                maxW="300px"
              >
                {t('createAccountTitle')}
              </Button>
            </VStack>
          </Box>
        </VStack>
      )}
    </Flex>
  );
}

export default PinLogin;
