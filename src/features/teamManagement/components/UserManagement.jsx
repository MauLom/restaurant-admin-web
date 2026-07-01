import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Heading, Input, Select, Button, VStack, Spinner, Text, SimpleGrid, Divider, HStack, IconButton, useTheme,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Textarea, FormControl, FormLabel,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  PinInput, PinInputField,
} from '@chakra-ui/react';
import { FaTrash, FaEdit, FaBan, FaCheckCircle } from 'react-icons/fa';
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
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('waiter');
  const [editPin, setEditPin] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [userToDelete, setUserToDelete] = useState(null);
  const cancelDeleteRef = useRef(null);

  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const cancelDeactivateRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

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
    if (!username || !role || pin.length !== 6) {
      toast({ title: t('errorTitle'), description: t('usernameAndPinRequired'), status: 'error' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: t('errorTitle'), description: t('pinsDoNotMatch'), status: 'error' });
      return;
    }

    setCreatingUser(true);
    try {
      await api.post('/users/pins', {
        username,
        role,
        pin
      });

      toast({ title: t('userCreatedTitle'), description: t('userCreatedDescription'), status: 'success' });
      setUsername('');
      setRole('waiter');
      setPin('');
      setConfirmPin('');
      fetchUsers();
    } catch (error) {
      console.error('Error generating user:', error);
      const description = error.response?.status === 400
        ? t('duplicateUserFieldDescription')
        : t('errorGeneratingUserDescription');
      toast({ title: t('errorTitle'), description, status: 'error' });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete}`);
      toast({ title: t('userDeletedTitle'), description: t('userDeletedDescription'), status: 'success' });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: t('errorTitle'), description: t('errorDeletingUserDescription'), status: 'error' });
    } finally {
      setUserToDelete(null);
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (user, reason = '') => {
    const activating = user.isActive === false;
    setIsTogglingActive(true);
    try {
      await api.put(`/users/${user._id}`, {
        isActive: activating,
        deactivationReason: activating ? '' : reason,
      });
      toast(
        activating
          ? { title: t('userActivatedTitle'), description: t('userActivatedDescription'), status: 'success' }
          : { title: t('userDeactivatedTitle'), description: t('userDeactivatedDescription'), status: 'success' }
      );
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({ title: t('errorTitle'), description: t('errorTogglingUserStatusDescription'), status: 'error' });
    } finally {
      setIsTogglingActive(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    await handleToggleActive(userToDeactivate, deactivateReason);
    setUserToDeactivate(null);
    setDeactivateReason('');
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

      <Box bg="#363636" borderRadius="xl" borderTop="3px solid" borderTopColor="teal.400" p={6} mb={6}>
        <Text fontSize="lg" fontWeight="bold" color="white" mb={1}>{t('createAccountTitle')}</Text>
        <Text fontSize="xs" color="gray.400" mb={4}>{t('completeFieldsToRegister')}</Text>

        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.300" mb={1}>{t('usernameLabel')}</FormLabel>
            <Input
              placeholder={t('usernamePlaceholderEs')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              bg="gray.600"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              _placeholder={{ color: 'gray.400' }}
              _focus={{ bg: 'gray.500', borderColor: 'teal.400', boxShadow: '0 0 0 1px #319795' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.300" mb={1}>{t('rolePlaceholder')}</FormLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              bg="gray.600"
              border="1px solid"
              borderColor="gray.500"
              color="white"
              _focus={{ bg: 'gray.500', borderColor: 'teal.400', boxShadow: '0 0 0 1px #319795' }}
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
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.300" mb={2} textAlign="center">{t('choosePinLabel')}</FormLabel>
            <HStack justify="center">
              <PinInput type="number" value={pin} onChange={setPin} size="lg" mask>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PinInputField
                    key={i}
                    bg="#2a2a2a"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px #319795' }}
                  />
                ))}
              </PinInput>
            </HStack>
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="gray.300" mb={2} textAlign="center">{t('confirmPinLabel')}</FormLabel>
            <HStack justify="center">
              <PinInput type="number" value={confirmPin} onChange={setConfirmPin} size="lg" mask>
                {Array.from({ length: 6 }).map((_, i) => (
                  <PinInputField
                    key={i}
                    bg="#2a2a2a"
                    border="1px solid"
                    borderColor="gray.600"
                    color="white"
                    _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px #319795' }}
                  />
                ))}
              </PinInput>
            </HStack>
            {confirmPin.length === 6 && pin !== confirmPin && (
              <Text fontSize="xs" color="red.400" textAlign="center" mt={2}>
                {t('pinsDoNotMatch')}
              </Text>
            )}
          </FormControl>

          <Button
            bg="teal.500"
            color="white"
            _hover={{ bg: 'teal.600' }}
            _active={{ bg: 'teal.700' }}
            onClick={handleGenerateUser}
            isLoading={creatingUser}
            loadingText={t('creatingEllipsis')}
            w="full"
          >
            {t('createAccountTitle')}
          </Button>
        </VStack>
      </Box>

      <Divider my={6} />

      <Heading size="md" mb={4} color="teal.300">{t('existingUsersHeading')}</Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : users.length === 0 ? (
        <Box py={8} textAlign="center">
          <Text fontSize="2xl" mb={2}>👤</Text>
          <Text opacity={0.5}>{t('noUsersYet')}</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {users.map((user) => (
            <Box key={user._id} p={4} borderWidth="1px" borderRadius="md" bg="gray.700" opacity={user.isActive === false ? 0.6 : 1}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontWeight="bold">{user.username}</Text>
                    {user.isActive === false && (
                      <Text fontSize="xs" color="red.300" fontWeight="bold">({t('inactiveAccountBadge')})</Text>
                    )}
                  </HStack>
                  <Text fontSize="sm">{t('roleLabel').replace('{role}', user.role ? t(`role_${user.role}`) : t('roleUndefined'))}</Text>
                  <Text fontSize="sm">{t('pinLabel').replace('{pin}', user.pin)}</Text>
                  {user.isActive === false && user.deactivationReason && (
                    <Text fontSize="xs" color="gray.400">{t('deactivationReasonDisplay').replace('{reason}', user.deactivationReason)}</Text>
                  )}
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
                    <>
                      <IconButton
                        icon={user.isActive === false ? <FaCheckCircle /> : <FaBan />}
                        colorScheme={user.isActive === false ? 'green' : 'orange'}
                        size="sm"
                        aria-label={user.isActive === false ? t('activateUserAriaLabel') : t('deactivateUserAriaLabel')}
                        onClick={() => {
                          if (user.isActive === false) {
                            handleToggleActive(user);
                          } else {
                            setDeactivateReason('');
                            setUserToDeactivate(user);
                          }
                        }}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        colorScheme="red"
                        size="sm"
                        aria-label={t('deleteUserAriaLabel')}
                        onClick={() => setUserToDelete(user._id)}
                      />
                    </>
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

      <AlertDialog isOpen={!!userToDeactivate} leastDestructiveRef={cancelDeactivateRef} onClose={() => setUserToDeactivate(null)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={theme.colors.surface} color={theme.colors.text}>
            <AlertDialogHeader>{t('confirmDeactivateUserTitle')}</AlertDialogHeader>
            <AlertDialogBody>
              <Text mb={4}>{t('confirmDeactivateUserDescription')}</Text>
              <FormControl>
                <FormLabel>{t('deactivationReasonLabel')}</FormLabel>
                <Textarea
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder={t('deactivationReasonPlaceholder')}
                />
              </FormControl>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeactivateRef} onClick={() => setUserToDeactivate(null)} isDisabled={isTogglingActive}>
                {t('cancel')}
              </Button>
              <Button colorScheme="orange" onClick={handleConfirmDeactivate} ml={3} isLoading={isTogglingActive}>
                {t('deactivateUserAriaLabel')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog isOpen={!!userToDelete} leastDestructiveRef={cancelDeleteRef} onClose={() => setUserToDelete(null)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent bg={theme.colors.surface} color={theme.colors.text}>
            <AlertDialogHeader>{t('confirmDeleteUserTitle')}</AlertDialogHeader>
            <AlertDialogBody>{t('confirmDeleteUserDescription')}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={() => setUserToDelete(null)} isDisabled={isDeleting}>
                {t('cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3} isLoading={isDeleting}>
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
