import React, { useState } from 'react';
import {
  Box, Button, VStack, HStack, Text, Input, Select, Divider,
  FormControl, FormLabel, PinInput, PinInputField, useTheme,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomToast } from '../../hooks/useCustomToast';
import api from '../../services/api';

const SELF_REGISTRATION_ROLES = ['waiter', 'hostess', 'cashier', 'kitchen', 'bar'];

function RegisterPage() {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const navigate = useNavigate();
  const theme = useTheme();

  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !role || pin.length !== 6) {
      toast({ title: t('errorTitle'), description: t('usernameAndPinRequired'), status: 'error' });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: t('errorTitle'), description: t('pinsDoNotMatch'), status: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', {
        username,
        role,
        email: email || undefined,
        pin,
      });
      toast({ title: t('accountCreatedTitle'), description: t('accountCreatedDescription'), status: 'success' });
      navigate('/login');
    } catch (err) {
      const description = err.response?.data?.error || t('errorCreatingAccount');
      toast({ title: t('errorTitle'), description, status: 'error' });
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
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bg="#1c1c1c" p={6}>
      <VStack spacing={5} w="full" maxW="sm">
        <Text fontSize="lg" fontWeight="bold" color="white">{t('createAccountTitle')}</Text>
        <Text fontSize="xs" color="gray.400">{t('completeFieldsToRegister')}</Text>

        <FormControl isRequired>
          <FormLabel fontSize="sm" color="gray.300" mb={1}>{t('usernameLabel')}</FormLabel>
          <Input
            placeholder={t('usernamePlaceholder')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            {...inputStyles}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" color="gray.300" mb={1}>{t('rolePlaceholder')}</FormLabel>
          <Select
            placeholder={t('selectRole')}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            {...inputStyles}
          >
            {SELF_REGISTRATION_ROLES.map((roleOption) => (
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

        <FormControl>
          <FormLabel fontSize="sm" color="gray.300" mb={1}>
            {t('emailPlaceholder')}{' '}
            <Text as="span" fontSize="xs" color="gray.500">({t('optionalLabel')})</Text>
          </FormLabel>
          <Input
            type="email"
            placeholder={t('emailExamplePlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              <PinInput type="number" value={pin} onChange={setPin} size="lg" mask>
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
              <PinInput type="number" value={confirmPin} onChange={setConfirmPin} size="lg" mask>
                <PinInputField {...pinFieldStyles} />
                <PinInputField {...pinFieldStyles} />
                <PinInputField {...pinFieldStyles} />
                <PinInputField {...pinFieldStyles} />
                <PinInputField {...pinFieldStyles} />
                <PinInputField {...pinFieldStyles} />
              </PinInput>
            </HStack>
            {confirmPin.length === 6 && pin !== confirmPin && (
              <Text fontSize="xs" color="red.400" textAlign="center" mt={2}>
                {t('pinsDoNotMatch')}
              </Text>
            )}
          </FormControl>
        </Box>

        <HStack pt={2} spacing={3} w="full" justify="center">
          <Button
            variant="ghost"
            color="gray.300"
            _hover={{ color: 'white', bg: 'gray.600' }}
            onClick={() => navigate('/login')}
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
        </HStack>
      </VStack>
    </Box>
  );
}

export default RegisterPage;
