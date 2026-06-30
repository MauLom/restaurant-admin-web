import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, Button, Grid, HStack, VStack,
} from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';

function AdminPinModal({ isOpen, onClose, onConfirm }) {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const { currentTheme, colorMode } = useTheme();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Light mode needs explicit values because the lightTheme palette has very
  // little contrast between background/sidebar/surface colors.
  const pinBg = colorMode === 'light' ? '#d0d0d0' : currentTheme.colors.background;
  const pinHover = colorMode === 'light' ? '#b8b8b8' : '#555';
  const dotEmpty = colorMode === 'light' ? '#b8b8b8' : '#444';

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
      <ModalContent bg={currentTheme.colors.sidebar} color={currentTheme.colors.text}>
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
                  bg={i < pin.length ? currentTheme.colors.text : dotEmpty}
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
                  bg={pinBg}
                  color={currentTheme.colors.text}
                  _hover={{ bg: pinHover }}
                >
                  {num}
                </Button>
              ))}
              <Button
                onClick={handleDelete}
                w="56px"
                h="56px"
                borderRadius="50%"
                bg={pinBg}
                color={currentTheme.colors.text}
                _hover={{ bg: pinHover }}
              >
                ⌫
              </Button>
              <Button
                onClick={() => handleDigit('0')}
                w="56px"
                h="56px"
                borderRadius="50%"
                bg={pinBg}
                color={currentTheme.colors.text}
                _hover={{ bg: pinHover }}
              >
                0
              </Button>
              <Button
                onClick={handleConfirm}
                w="56px"
                h="56px"
                borderRadius="50%"
                bg={pin.length === 6 ? 'green.500' : pinBg}
                color={currentTheme.colors.text}
                isDisabled={pin.length !== 6}
                isLoading={loading}
                _hover={{ bg: pin.length === 6 ? 'green.600' : pinHover }}
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
