import React, { useState, useEffect } from 'react';
import { Box, Button, VStack, Text, Checkbox, Select, useTheme } from '@chakra-ui/react';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';

function SystemSettings() {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const theme = useTheme();

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [rolePermissions, setRolePermissions] = useState(new Set());

  // Fetch roles and all permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          api.get('/users/roles'),
          api.get('/users/permissions')
        ]);
        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
      } catch (error) {
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingSettings'),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchData();
  }, [t, toast]);

  useEffect(() => {
    const fetchRolePermissions = async () => {
      if (!selectedRoleId) return;
      try {
        const res = await api.get(`/users/roles/${selectedRoleId}/permissions`);
        setRolePermissions(new Set(res.data.map((perm) => perm.name)));
      } catch (error) {
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingPermissions'),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchRolePermissions();
  }, [selectedRoleId, toast, t]);

  const togglePermission = (perm) => {
    const updated = new Set(rolePermissions);
    updated.has(perm) ? updated.delete(perm) : updated.add(perm);
    setRolePermissions(updated);
  };

  const handleSave = async () => {
    try {
      await api.put(`/users/roles/${selectedRoleId}/permissions`, { permissions: Array.from(rolePermissions) });
      toast({
        title: t('settingsUpdatedTitle'),
        description: t('permissionsUpdated'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorSavingPermissions'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="start">
        <Select placeholder={t('selectRole')} value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)}>
          {roles.map((role) => (
            <option key={role._id} value={role._id} style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>{t(`role_${role.name}`)}</option>
          ))}
        </Select>

        {selectedRoleId && (
          <>
            <Text>{t('selectPermissions')}:</Text>
            <VStack align="start">
              {permissions.map((perm) => (
                <Checkbox
                  key={perm._id}
                  isChecked={rolePermissions.has(perm.name)}
                  onChange={() => togglePermission(perm.name)}
                >
                  {t(`permission_${perm.name}`)}
                </Checkbox>
              ))}
            </VStack>
            <Button colorScheme="blue" onClick={handleSave}>{t('savePermissions')}</Button>
          </>
        )}
      </VStack>
    </Box>
  );
}

export default SystemSettings;
