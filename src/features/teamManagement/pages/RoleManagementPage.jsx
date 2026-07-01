import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Heading, Text, Button, VStack, HStack, Badge, Spinner, Center,
  useToast, Switch, FormControl, FormLabel, Input, Checkbox, CheckboxGroup,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, SimpleGrid, Divider, IconButton, Tooltip,
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

const PERMISSION_ORDER = [
  'orders', 'waiterOrders', 'kitchenOrders', 'cashier',
  'sections', 'analytics', 'manageCategories', 'manageItems',
  'inventory', 'generatePins', 'manageUsers', 'manageRoles',
];

// Maps permission names to their module title i18n key so the UI
// shows the same name the user sees in the navigation pages.
const PERMISSION_TITLE_KEY = {
  orders: 'manageOrdersTitle',
  kitchenOrders: 'ordersPrepTitle',
  cashier: 'manageBillingTitle',
  analytics: 'consultAnalyticsTitle',
  waiterOrders: 'yourAnalyticsTitle',
  sections: 'manageLayoutTitle',
  manageCategories: 'manageCategoriesTitle',
  manageItems: 'manageProductsTitle',
  inventory: 'manageInventoryTitle',
  manageUsers: 'manageUsersTitle',
  manageRoles: 'manageRolesTitle',
};

function RoleManagementPage() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const toast = useToast();

  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingRole, setEditingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formName, setFormName] = useState('');
  const [formIsSuperRole, setFormIsSuperRole] = useState(false);
  const [formPermissions, setFormPermissions] = useState([]);

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const fetchData = useCallback(async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/users/roles'),
        api.get('/users/permissions'),
      ]);
      setRoles(rolesRes.data);
      const sorted = [...permsRes.data].sort((a, b) => {
        const ai = PERMISSION_ORDER.indexOf(a.name);
        const bi = PERMISSION_ORDER.indexOf(b.name);
        if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      setAllPermissions(sorted);
    } catch {
      toast({ title: t('rolesLoadError'), status: 'error', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingRole(null);
    setFormName('');
    setFormIsSuperRole(false);
    setFormPermissions([]);
    onFormOpen();
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormIsSuperRole(role.isSuperRole || false);
    setFormPermissions(role.permissions?.map(p => p.name) || []);
    onFormOpen();
  };

  const openDelete = (role) => {
    setDeletingRole(role);
    onDeleteOpen();
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      if (editingRole) {
        await api.put(`/users/roles/${editingRole._id}`, {
          name: formName.trim(),
          isSuperRole: formIsSuperRole,
        });
        await api.put(`/users/roles/${editingRole._id}/permissions`, {
          permissions: formIsSuperRole ? [] : formPermissions,
        });
        toast({ title: t('roleUpdatedTitle'), description: t('roleUpdatedDescription'), status: 'success', duration: 3000 });
      } else {
        await api.post('/users/roles', {
          name: formName.trim(),
          isSuperRole: formIsSuperRole,
          permissions: formIsSuperRole ? [] : formPermissions,
        });
        toast({ title: t('roleCreatedTitle'), description: t('roleCreatedDescription'), status: 'success', duration: 3000 });
      }
      onFormClose();
      fetchData();
    } catch (err) {
      const msg = err.response?.status === 409
        ? t('duplicateRoleError')
        : editingRole ? t('errorUpdatingRoleDescription') : t('errorCreatingRoleDescription');
      toast({ title: t('errorTitle'), description: msg, status: 'error', duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setDeletingId(deletingRole._id);
    try {
      await api.delete(`/users/roles/${deletingRole._id}`);
      toast({ title: t('roleDeletedTitle'), description: t('roleDeletedDescription'), status: 'success', duration: 3000 });
      onDeleteClose();
      fetchData();
    } catch (err) {
      const msg = err.response?.status === 409
        ? t('roleHasUsersError')
        : t('errorDeletingRoleDescription');
      toast({ title: t('errorTitle'), description: msg, status: 'error', duration: 4000 });
    } finally {
      setDeletingId(null);
    }
  };

  const permLabel = (name) => {
    const key = PERMISSION_TITLE_KEY[name];
    return key ? t(key) : (t(`permission_${name}`) || name);
  };

  if (!currentTheme) return null;
  const c = currentTheme.colors;

  if (isLoading) return <Center py={16}><Spinner size="xl" color={c.primary[500]} /></Center>;

  return (
    <Box>
      <HStack justify="space-between" align="flex-start" mb={6}>
        <Box>
          <Heading size="lg" color={c.text}>{t('roleManagementHeading')}</Heading>
          <Text color="gray.400" mt={1}>{t('roleManagementDescription')}</Text>
        </Box>
        <Button
          leftIcon={<FaPlus />}
          bg={c.primary[500]}
          color="white"
          _hover={{ opacity: 0.85 }}
          onClick={openCreate}
        >
          {t('createRole')}
        </Button>
      </HStack>

      {roles.length === 0 ? (
        <Center py={16} flexDirection="column" gap={3}>
          <Text fontSize="3xl"><FaShieldAlt /></Text>
          <Text color="gray.400">{t('noRolesYet')}</Text>
        </Center>
      ) : (
        <VStack align="stretch" spacing={4}>
          {roles.map((role) => (
            <Box
              key={role._id}
              bg={c.surface}
              borderRadius="lg"
              p={5}
              border="1px solid"
              borderColor={role.isSuperRole ? c.primary[500] : 'transparent'}
            >
              <HStack justify="space-between" align="flex-start" mb={3}>
                <HStack spacing={3}>
                  <Heading size="md" color={c.text}>{role.name}</Heading>
                  {role.isSuperRole && (
                    <Badge colorScheme="yellow" variant="subtle" fontSize="xs" px={2} py={1}>
                      {t('superRoleBadge')}
                    </Badge>
                  )}
                </HStack>
                <HStack>
                  <Tooltip label={t('editRole')}>
                    <IconButton
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                      color={c.text}
                      onClick={() => openEdit(role)}
                      aria-label={t('editRole')}
                    />
                  </Tooltip>
                  <Tooltip label={t('deleteRole')}>
                    <IconButton
                      icon={<FaTrash />}
                      size="sm"
                      variant="ghost"
                      color="#E53E3E"
                      onClick={() => openDelete(role)}
                      isLoading={deletingId === role._id}
                      aria-label={t('deleteRole')}
                    />
                  </Tooltip>
                </HStack>
              </HStack>

              {role.isSuperRole ? (
                <Text fontSize="sm" color="gray.400" fontStyle="italic">
                  {t('superRoleDescription')}
                </Text>
              ) : (
                <HStack flexWrap="wrap" spacing={2}>
                  {role.permissions?.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">—</Text>
                  ) : (
                    role.permissions.map((p) => (
                      <Badge key={p._id} bg={`${c.primary[500]}22`} color={c.primary[500]} fontSize="xs" px={2} py={1} borderRadius="md">
                        {permLabel(p.name)}
                      </Badge>
                    ))
                  )}
                </HStack>
              )}
            </Box>
          ))}
        </VStack>
      )}

      {/* Create / Edit modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg={c.surface} color={c.text}>
          <ModalHeader>{editingRole ? t('editRole') : t('createRole')}</ModalHeader>
          <ModalBody>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('roleNameLabel')}</FormLabel>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('roleNamePlaceholder')}
                  bg={c.background}
                  borderColor="gray.600"
                />
              </FormControl>

              <FormControl>
                <HStack justify="space-between" align="center">
                  <Box>
                    <FormLabel fontSize="sm" mb={0}>{t('superRoleLabel')}</FormLabel>
                    <Text fontSize="xs" color="gray.400">{t('superRoleDescription')}</Text>
                  </Box>
                  <Switch
                    isChecked={formIsSuperRole}
                    onChange={(e) => setFormIsSuperRole(e.target.checked)}
                    colorScheme="yellow"
                  />
                </HStack>
              </FormControl>

              {!formIsSuperRole && (
                <>
                  <Divider borderColor="gray.600" />
                  <FormControl>
                    <FormLabel fontSize="sm">{t('permissionsLabel')}</FormLabel>
                    <CheckboxGroup
                      value={formPermissions}
                      onChange={(vals) => setFormPermissions(vals)}
                    >
                      <SimpleGrid columns={2} spacing={3}>
                        {allPermissions.map((perm) => (
                          <Checkbox
                            key={perm._id}
                            value={perm.name}
                            colorScheme="blue"
                          >
                            <Text fontSize="sm">{permLabel(perm.name)}</Text>
                          </Checkbox>
                        ))}
                      </SimpleGrid>
                    </CheckboxGroup>
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onFormClose} isDisabled={isSaving}>
              {t('cancel')}
            </Button>
            <Button
              bg={c.primary[500]}
              color="white"
              _hover={{ opacity: 0.85 }}
              onClick={handleSave}
              isLoading={isSaving}
              isDisabled={!formName.trim() || isSaving}
            >
              {t('save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent bg={c.surface} color={c.text}>
          <ModalHeader>{t('confirmDeleteRoleTitle')}</ModalHeader>
          <ModalBody>
            <Text>
              {t('confirmDeleteRoleDescription').replace('{name}', deletingRole?.name || '')}
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onDeleteClose} isDisabled={!!deletingId}>
              {t('cancel')}
            </Button>
            <Button
              bg="#E53E3E"
              color="white"
              _hover={{ bg: '#C53030' }}
              onClick={handleDelete}
              isLoading={!!deletingId}
              isDisabled={!!deletingId}
            >
              {t('deleteRole')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default RoleManagementPage;
