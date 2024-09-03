import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Button, Text, Select, useToast } from '@chakra-ui/react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function GeneratePins() {
  const [pins, setPins] = useState([]);
  const [newPin, setNewPin] = useState('');
  const [role, setRole] = useState(''); // State for selected role
  const toast = useToast();
  const { t } = useLanguage();

  // Generate new PIN
  const handleGeneratePin = async () => {
    if (!role || !newPin) {
      toast({
        title: t('invalidInputTitle'),
        description: t('roleAndPinRequired'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.post('/users/pins', { role, pin: newPin });
      setPins([...pins, response.data]);
      setNewPin('');
      setRole(''); // Reset the role after generating the PIN
      toast({
        title: t('pinGeneratedTitle'),
        description: t('pinGeneratedDescription'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorGeneratingPin'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch existing PINs
  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await api.get('/users/pins');
        setPins(response.data);
      } catch (error) {
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingPins'),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchPins();
  }, [toast, t]);

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>{t('generatePins')}</Text>
      <VStack spacing={4} align="start">
        <Select
          placeholder={t('selectRole')}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          sx={{
            bg: 'white', // Background color
            color: 'black', // Font color
            _hover: {
              bg: 'gray.200', // Background color on hover
            },
            _focus: {
              borderColor: 'blue.500', // Border color on focus
            },
          }}
        >
          <option value="admin">{t('admin')}</option>
          <option value="waiter">{t('waiter')}</option>
          <option value="hostess">{t('hostess')}</option>
          <option value="cashier">{t('cashier')}</option>
          <option value="kitchen">{t('kitchen')}</option>
        </Select>
        <Input
          placeholder={t('pinPlaceholder')}
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleGeneratePin}>
          {t('generatePinButton')}
        </Button>
      </VStack>
      <Box mt={8}>
        <Text fontSize="lg" mb={2}>{t('existingPins')}</Text>
        <VStack spacing={4} align="start">
          {pins.map((pin, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg" width="100%">
              <Text>{t('pin')}: {pin.pin}</Text>
              <Text>{t('role')}: {pin.role}</Text>
              <Text>{t('expiresAt')}: {new Date(pin.pinExpiration).toLocaleString()}</Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

export default GeneratePins;
