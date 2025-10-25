import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Text, Center, Flex, Grid, Img, Input, Divider } from '@chakra-ui/react';
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

  // Event listener para el teclado físico
  useEffect(() => {
    const handleKeyPress = (event) => {
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
  }, [pin, noUsers]); // Dependencias: pin para verificar longitud y noUsers para controlar el estado

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
        title: '¡Bienvenido al Demo!',
        description: 'Explorando con datos de demostración',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to dashboard
      navigate('/dashboard/restaurant-status');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el modo demo',
        status: 'error'
      });
    }
  };

  function FirstAdminCreation() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [adminPin, setAdminPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateAdmin = async () => {
      if (!username || !password || !adminPin) {
        toast({ title: 'Error', description: 'Todos los campos son obligatorios.', status: 'error' });
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

        toast({ title: 'Administrador creado', description: 'Ya puedes iniciar sesión.', status: 'success' });
        window.location.reload();
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudo crear el administrador.', status: 'error' });
        console.error('Error creating admin:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <VStack spacing={4} w="full" maxW="sm">
        <Text fontSize="lg" fontWeight="bold" color="teal.300">Configuración Inicial</Text>
        <Input placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input placeholder="PIN (6 dígitos)" value={adminPin} onChange={(e) => setAdminPin(e.target.value)} maxLength={6} />
        <Button colorScheme="teal" onClick={handleCreateAdmin} isLoading={loading}>
          Crear Administrador
        </Button>
      </VStack>
    );
  }

  return (
    <Flex 
      ref={containerRef}
      height="90vh" 
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
            <Text fontSize="lg" mb={4} color="gray.300">
              ¿Quieres probar el sistema?
            </Text>
            <Button
              colorScheme="teal"
              variant="outline"
              size="lg"
              onClick={handleDemoLogin}
              w="full"
              maxW="300px"
            >
              🎭 Acceder al Demo
            </Button>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Explora todas las funciones con datos de ejemplo
            </Text>
          </Box>
        </VStack>
      )}
    </Flex>
  );
}

export default PinLogin;
