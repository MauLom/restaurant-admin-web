import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Heading, Input, Select, Button, VStack, Spinner, Text, SimpleGrid, Divider, HStack, IconButton, useTheme,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from '@chakra-ui/react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

const ROLE_OPTIONS = ['waiter', 'admin', 'hostess', 'cashier', 'kitchen', 'bar'];

function UserManagement() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuthContext();
  const toast = useCustomToast();
  const theme = useTheme();

  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('waiter');
  const [pin, setPin] = useState('');
  const [lastGeneratedPin, setLastGeneratedPin] = useState('');
  const [loading, setLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('waiter');
  const [editPin, setEditPin] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [userToDelete, setUserToDelete] = useState(null);
  const cancelDeleteRef = useRef(null);

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleGenerateUser = async () => {
    if (!username || !role) {
      toast({ title: t('errorTitle'), description: t('completeUsernameAndRoleDescription'), status: 'error' });
      return;
    }

    const finalPin = pin || Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await api.post('/users/pins', {
        username,
        role,
        pin: finalPin
      });

      setLastGeneratedPin(finalPin);
      toast({ title: t('userCreatedTitle'), description: t('userCreatedDescription'), status: 'success' });
      setUsername('');
      setRole('waiter');
      setPin('');
      fetchUsers();
    } catch (error) {
      console.error('Error generating user:', error);
      const description = error.response?.status === 400
        ? t('duplicateUserFieldDescription')
        : t('errorGeneratingUserDescription');
      toast({ title: t('errorTitle'), description, status: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete}`);
      toast({ title: t('userDeletedTitle'), description: t('userDeletedDescription'), status: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: t('errorTitle'), description: t('errorDeletingUserDescription'), status: 'error' });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditUsername(user.username || '');
    setEditRole(user.role || 'waiter');
    setEditPin('');
  };

  const handleSaveEdit = async () => {
    if (!editUsername || !editRole) {
      toast({ title: t('errorTitle'), description: t('completeUsernameAndRoleDescription'), status: 'error' });
      return;
    }

    setSavingEdit(true);
    try {
      const payload = { username: editUsername, role: editRole };
      if (editPin) payload.pin = editPin;

      await api.put(`/users/${editingUser._id}`, payload);
      toast({ title: t('userUpdatedTitle'), description: t('userUpdatedDescription'), status: 'success' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      const description = error.response?.status === 400
        ? t('duplicateUserFieldDescription')
        : t('errorUpdatingUserDescription');
      toast({ title: t('errorTitle'), description, status: 'error' });
    } finally {
      setSavingEdit(false);
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
          {ROLE_OPTIONS.map((roleOption) => (
            <option
              key={roleOption}
              value={roleOption}
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
            >
              {t(`role_${roleOption}`)}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t('newPinOptionalLabel')}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={6}
        />
        <Button colorScheme="teal" onClick={handleGenerateUser}>
          {t('generatePinButton')}
        </Button>
        {lastGeneratedPin && (
          <Text color="green.300" fontWeight="bold">
            {t('generatedPinLabel').replace('{pin}', lastGeneratedPin)}
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
                  <Text fontSize="sm">{t('roleLabel').replace('{role}', user.role ? t(`role_${user.role}`) : t('roleUndefined'))}</Text>
                  <Text fontSize="sm">{t('pinLabel').replace('{pin}', user.pin)}</Text>
                </VStack>
                <HStack>
                  <IconButton
                    icon={<FaEdit />}
                    colorScheme="yellow"
                    size="sm"
                    aria-label={t('editUserAriaLabel')}
                    onClick={() => handleOpenEdit(user)}
                  />
                  {user._id !== currentUser?._id && (
                    <IconButton
                      icon={<FaTrash />}
                      colorScheme="red"
                      size="sm"
                      aria-label={t('deleteUserAriaLabel')}
                      onClick={() => setUserToDelete(user._id)}
                    />
                  )}
                </HStack>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} isCentered>
        <ModalOverlay />
        <ModalContent bg={theme.colors.surface} color={theme.colors.text}>
          <ModalHeader>{t('editUserModalTitle')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Input
                placeholder={t('usernamePlaceholderEs')}
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
              />
              <Select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                {ROLE_OPTIONS.map((roleOption) => (
                  <option
                    key={roleOption}
                    value={roleOption}
                    style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                  >
                    {t(`role_${roleOption}`)}
                  </option>
                ))}
              </Select>
              <Input
                placeholder={t('newPinOptionalLabel')}
                value={editPin}
                onChange={(e) => setEditPin(e.target.value)}
                maxLength={6}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditingUser(null)}>
              {t('cancel')}
            </Button>
            <Button colorScheme="teal" onClick={handleSaveEdit} isLoading={savingEdit}>
              {t('save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={!!userToDelete} leastDestructiveRef={cancelDeleteRef} onClose={() => setUserToDelete(null)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={theme.colors.surface} color={theme.colors.text}>
            <AlertDialogHeader>{t('confirmDeleteUserTitle')}</AlertDialogHeader>
            <AlertDialogBody>{t('confirmDeleteUserDescription')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={() => setUserToDelete(null)}>
                {t('cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                {t('deleteUserAriaLabel')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default UserManagement;
