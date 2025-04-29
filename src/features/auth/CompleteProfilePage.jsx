import React, { useState } from 'react';
import { Box, VStack, Input, Button, Heading, Text, Select, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function CompleteProfilePage() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleCompleteProfile = async () => {
    if (!username || !role) {
      toast({
        title: 'Faltan campos',
        description: 'Debes ingresar un nombre de usuario y seleccionar un rol.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/profile', {
        username,
        role,
        password: password || undefined, // Solo enviamos password si se escribe
      });

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil fue completado correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu perfil.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bg="#1a202c" color="white" p={6}>
      <VStack spacing={6} w="full" maxW="sm">
        <Heading size="lg" color="teal.300">Completar Perfil</Heading>
        <Text textAlign="center">Por favor completa tu información para continuar usando la aplicación.</Text>

        <Input
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          bg="gray.700"
          _placeholder={{ color: 'gray.400' }}
        />

        <Select
          placeholder="Selecciona tu rol"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option style={{ backgroundColor: '#2D3748' }} value="admin">Administrador</option>
          <option style={{ backgroundColor: '#2D3748' }} value="waiter">Mesero</option>
          <option style={{ backgroundColor: '#2D3748' }} value="hostess">Hostess</option>
          <option style={{ backgroundColor: '#2D3748' }} value="cashier">Cajero</option>
          <option style={{ backgroundColor: '#2D3748' }} value="kitchen">Cocina</option>
          <option style={{ backgroundColor: '#2D3748' }} value="bar">Barra</option>
        </Select>

        <Input
          type="password"
          placeholder="Contraseña (opcional)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          bg="gray.700"
          _placeholder={{ color: 'gray.400' }}
        />

        <Button
          colorScheme="teal"
          onClick={handleCompleteProfile}
          isLoading={loading}
          width="full"
        >
          Guardar Perfil
        </Button>
      </VStack>
    </Box>
  );
}

export default CompleteProfilePage;
