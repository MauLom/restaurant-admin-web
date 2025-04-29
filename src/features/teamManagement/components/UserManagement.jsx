import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Input, Select, Button, VStack, Spinner, Text, SimpleGrid, Divider, HStack, IconButton
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

function UserManagement() {
  const { t } = useLanguage();
  const toast = useCustomToast();

  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('waiter');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGenerateUser = async () => {
    if (!username || !role) {
      toast({ title: 'Error', description: 'Completa el nombre de usuario y el rol.', status: 'error' });
      return;
    }

    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    setPin(generatedPin);

    try {
      await api.post('/users/pins', {
        username,
        role,
        pin: generatedPin
      });

      toast({ title: 'Usuario creado', description: 'Usuario y PIN generados correctamente.', status: 'success' });
      setUsername('');
      setRole('waiter');
      fetchUsers();
    } catch (error) {
      console.error('Error generating user:', error);
      toast({ title: 'Error', description: 'No se pudo generar el usuario.', status: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast({ title: 'Usuario eliminado', description: 'El usuario fue eliminado exitosamente.', status: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el usuario.', status: 'error' });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4} color="teal.300">👥 Gestión de Usuarios</Heading>

      <VStack spacing={4} align="stretch" mb={6}>
        <Input
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          bg="gray.700"
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          bg="gray.700"
          color="white"
        >
          <option value="waiter">Mesero</option>
          <option value="admin">Administrador</option>
          <option value="hostess">Recepcionista</option>
          <option value="cashier">Cajero</option>
          <option value="kitchen">Cocina</option>
          <option value="bar">Barra</option>
        </Select>
        <Button colorScheme="teal" onClick={handleGenerateUser}>
          Generar PIN
        </Button>
        {pin && (
          <Text color="green.300" fontWeight="bold">
            PIN Generado: {pin}
          </Text>
        )}
      </VStack>

      <Divider my={6} />

      <Heading size="md" mb={4} color="teal.300">Usuarios Existentes</Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {users.map((user) => (
            <Box key={user._id} p={4} borderWidth="1px" borderRadius="md" bg="gray.700">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{user.username}</Text>
                  <Text fontSize="sm">Rol: {user.role}</Text>
                  <Text fontSize="sm">PIN: {user.pin}</Text>
                </VStack>
                <IconButton
                  icon={<FaTrash />}
                  colorScheme="red"
                  size="sm"
                  aria-label="Eliminar usuario"
                  onClick={() => handleDeleteUser(user._id)}
                />
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default UserManagement;
