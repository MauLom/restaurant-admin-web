import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Input,
  Textarea,
  Box,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  useToast,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useUserContext } from '../../../context/UserContext';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

function VirtualTableModal({ isOpen, onClose, onVirtualTableCreated }) {
  const { user } = useUserContext();
  const toast = useToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  // Estados del formulario
  const [virtualTableName, setVirtualTableName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Configuración avanzada
  const [allowSeparateOrders, setAllowSeparateOrders] = useState(false);
  const [combineBilling, setCombineBilling] = useState(true);
  const [configNotes, setConfigNotes] = useState('');

  const resetForm = () => {
    setVirtualTableName('');
    setDescription('');
    setCapacity(4);
    setAllowSeparateOrders(false);
    setCombineBilling(true);
    setConfigNotes('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!virtualTableName.trim()) {
      newErrors.name = t('nameRequiredError');
    }

    if (capacity < 1 || capacity > 50) {
      newErrors.capacity = t('capacityRangeError');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateVirtualTable = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const virtualTableData = {
        name: virtualTableName.trim(),
        description: description.trim(),
        mode: 'standalone',
        capacity,
        createdBy: user._id,
        configuration: {
          allowSeparateOrders,
          combineBilling,
          notes: configNotes.trim(),
        },
      };

      const response = await api.post('/virtual-tables', virtualTableData);

      toast({
        title: t('virtualTableCreated'),
        description: t('virtualTableCreatedDesc').replace('{tableName}', virtualTableName),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onVirtualTableCreated(response.data);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating virtual table:', error);
      toast({
        title: t('errorTitle'),
        description: error.response?.data?.message || t('virtualTableCreationError'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" bg="black">
      <ModalOverlay />
      <ModalContent maxW="600px" bg={currentTheme.colors.sidebar} color={currentTheme.colors.text}>
        <ModalHeader>
          🪑 {t('createVirtualTableHeader')}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={5} align="stretch">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                {t('standaloneTableDesc')}
              </Text>
            </Alert>

            {/* Información básica */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                📝 {t('basicInfoSection')}
              </Text>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={errors.name}>
                  <FormLabel>{t('virtualTableNameLabel')}</FormLabel>
                  <Input
                    value={virtualTableName}
                    onChange={(e) => setVirtualTableName(e.target.value)}
                    placeholder={t('virtualTableNamePlaceholder')}
                    maxLength={50}
                    bg={currentTheme.colors.surface}
                    _placeholder={{ color: currentTheme.colors.text, opacity: 0.5 }}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>{t('descriptionOptional')}</FormLabel>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    maxLength={200}
                    rows={3}
                    bg={currentTheme.colors.surface}
                    _placeholder={{ color: currentTheme.colors.text, opacity: 0.5 }}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* Capacidad */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                👥 {t('capacitySection')}
              </Text>
              <FormControl isRequired isInvalid={errors.capacity}>
                <FormLabel>{t('numberOfPeopleLabel')}</FormLabel>
                <NumberInput
                  value={capacity}
                  onChange={(value) => setCapacity(parseInt(value) || 1)}
                  min={1}
                  max={50}
                >
                  <NumberInputField bg={currentTheme.colors.surface} _placeholder={{ color: currentTheme.colors.text, opacity: 0.5 }} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{errors.capacity}</FormErrorMessage>
              </FormControl>
            </Box>

            <Divider />

            {/* Configuración avanzada */}
            <Box>
              <Text fontSize="lg" fontWeight="semibold" mb={3}>
                ⚙️ {t('advancedConfigSection')}
              </Text>
              <VStack spacing={4} align="stretch">
                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="separate-orders" mb="0">
                    {t('allowSeparateOrders')}
                  </FormLabel>
                  <Switch
                    id="separate-orders"
                    isChecked={allowSeparateOrders}
                    onChange={(e) => setAllowSeparateOrders(e.target.checked)}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="combine-billing" mb="0">
                    {t('combinedBilling')}
                  </FormLabel>
                  <Switch
                    id="combine-billing"
                    isChecked={combineBilling}
                    onChange={(e) => setCombineBilling(e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>{t('configurationNotes')}</FormLabel>
                  <Textarea
                    value={configNotes}
                    onChange={(e) => setConfigNotes(e.target.value)}
                    placeholder={t('configNotesPlaceholder')}
                    maxLength={150}
                    rows={2}
                    bg={currentTheme.colors.surface}
                    _placeholder={{ color: currentTheme.colors.text, opacity: 0.5 }}
                  />
                </FormControl>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>

          <Button
            colorScheme="teal"
            onClick={handleCreateVirtualTable}
            isLoading={isLoading}
            loadingText="Creando..."
            isDisabled={!virtualTableName.trim() || capacity < 1 || capacity > 50}
          >
            {t('createVirtualTableHeader')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default VirtualTableModal;
