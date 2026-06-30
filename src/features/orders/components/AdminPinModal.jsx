import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, Button, Grid, HStack, VStack,
} from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import api from '../../../services/api';

function AdminPinModal({ isOpen, onClose, onConfirm }) {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length < 6) setPin(prev => prev + digit);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const handleConfirm = async () => {
    if (pin.length !== 6) return;
    setLoading(true);
    try {
      const response = await api.post('/users/login-pin', { pin });
      const adminToken = response.data.token;
      setPin('');
      onClose();
      onConfirm(adminToken);
    } catch {
      toast({ title: t('adminPinInvalid'), status: 'error', duration: 3000 });
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xs">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader fontSize="md">{t('adminPinRequired')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <HStack justify="center" spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Box
                  key={i}
                  w="12px"
                  h="12px"
                  borderRadius="50%"
                  bg={i < pin.length ? 'white' : 'gray.600'}
                />
              ))}
            </HStack>

            <Grid templateColumns="repeat(3, 1fr)" gap={3}>
              {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                <Button
                  key={num}
                  onClick={() => handleDigit(num.toString())}
                  w="56px"
                  h="56px"
                  borderRadius="50%"
                  bg="gray.700"
                  color="white"
                  _hover={{ bg: 'gray.600' }}
                >
                  {num}
                </Button>
              ))}
              <Button
                onClick={handleDelete}
                w="56px"
                h="56px"
                borderRadius="50%"
                bg="gray.700"
                color="white"
                _hover={{ bg: 'gray.600' }}
              >
                ⌫
              </Button>
              <Button
                onClick={() => handleDigit('0')}
                w="56px"
                h="56px"
                borderRadius="50%"
                bg="gray.700"
                color="white"
                _hover={{ bg: 'gray.600' }}
              >
                0
              </Button>
              <Button
                onClick={handleConfirm}
                w="56px"
                h="56px"
                borderRadius="50%"
                bg={pin.length === 6 ? 'green.500' : 'gray.600'}
                color="white"
                isDisabled={pin.length !== 6}
                isLoading={loading}
                _hover={{ bg: pin.length === 6 ? 'green.600' : 'gray.600' }}
              >
                ✔
              </Button>
            </Grid>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AdminPinModal;
