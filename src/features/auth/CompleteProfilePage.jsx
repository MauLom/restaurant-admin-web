import React, { useState } from 'react';
import { Box, VStack, Input, Button, Heading, Text, Select, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

function CompleteProfilePage() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleCompleteProfile = async () => {
    if (!username || !role) {
      toast({
        title: t('missingFieldsTitle'),
        description: t('missingFieldsDescription'),
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
        title: t('profileUpdatedTitle'),
        description: t('profileCompletedSuccessfully'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast({
        title: t('profileUpdateErrorTitle'),
        description: t('profileUpdateError'),
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
        <Heading size="lg" color="teal.300">{t('completeProfileTitle')}</Heading>
        <Text textAlign="center">{t('completeProfileDescription')}</Text>

        <Input
          placeholder={t('usernamePlaceholderProfile')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          bg="gray.700"
          _placeholder={{ color: 'gray.400' }}
        />

        <Select
          placeholder={t('selectRolePlaceholder')}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option style={{ backgroundColor: '#2D3748' }} value="admin">{t('roleAdmin')}</option>
          <option style={{ backgroundColor: '#2D3748' }} value="waiter">{t('roleWaiter')}</option>
          <option style={{ backgroundColor: '#2D3748' }} value="hostess">{t('roleHostess')}</option>
          <option style={{ backgroundColor: '#2D3748' }} value="cashier">{t('roleCashier')}</option>
          <option style={{ backgroundColor: '#2D3748' }} value="kitchen">{t('roleKitchen')}</option>
          <option style={{ backgroundColor: '#2D3748' }} value="bar">{t('roleBar')}</option>
        </Select>

        <Input
          type="password"
          placeholder={t('passwordPlaceholderProfile')}
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
          {t('saveProfileButton')}
        </Button>
      </VStack>
    </Box>
  );
}

export default CompleteProfilePage;
