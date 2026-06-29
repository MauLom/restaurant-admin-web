import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Input, Select, Button, VStack, Spinner, Text, SimpleGrid, Divider, HStack, IconButton, useTheme
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

function UserManagement() {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('waiter');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: t('errorTitle'), description: t('errorLoadingUsersDescription'), status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleGenerateUser = async () => {
    if (!username || !role) {
      toast({ title: t('errorTitle'), description: t('completeUsernameAndRoleDescription'), status: 'error' });
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

      toast({ title: t('userCreatedTitle'), description: t('userCreatedDescription'), status: 'success' });
      setUsername('');
      setRole('waiter');
      fetchUsers();
    } catch (error) {
      console.error('Error generating user:', error);
      toast({ title: t('errorTitle'), description: t('errorGeneratingUserDescription'), status: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast({ title: t('userDeletedTitle'), description: t('userDeletedDescription'), status: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: t('errorTitle'), description: t('errorDeletingUserDescription'), status: 'error' });
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={4} color="teal.300">{t('userManagementHeading')}</Heading>

      <VStack spacing={4} align="stretch" mb={6}>
        <Input
          placeholder={t('usernamePlaceholderEs')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          bg="gray.700"
          color="white"
          _placeholder={{ color: 'gray.400' }}
        />
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="waiter" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Mesero</option>
          <option value="admin" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Administrador</option>
          <option value="hostess" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Recepcionista</option>
          <option value="cashier" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Cajero</option>
          <option value="kitchen" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Cocina</option>
          <option value="bar" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Barra</option>
        </Select>
        <Button colorScheme="teal" onClick={handleGenerateUser}>
          {t('generatePinButton')}
        </Button>
        {pin && (
          <Text color="green.300" fontWeight="bold">
            {t('generatedPinLabel').replace('{pin}', pin)}
          </Text>
        )}
      </VStack>

      <Divider my={6} />

      <Heading size="md" mb={4} color="teal.300">{t('existingUsersHeading')}</Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {users.map((user) => (
            <Box key={user._id} p={4} borderWidth="1px" borderRadius="md" bg="gray.700">
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">{user.username}</Text>
                  <Text fontSize="sm">{t('roleLabel').replace('{role}', user.role)}</Text>
                  <Text fontSize="sm">{t('pinLabel').replace('{pin}', user.pin)}</Text>
                </VStack>
                <IconButton
                  icon={<FaTrash />}
                  colorScheme="red"
                  size="sm"
                  aria-label={t('deleteUserAriaLabel')}
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
