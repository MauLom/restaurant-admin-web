import React, { useState, useEffect, useCallback } from 'react';
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
  HStack,
  Text,
  Input,
  Textarea,
  Checkbox,
  CheckboxGroup,
  Box,
  Badge,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  useToast,
  Grid,
  GridItem,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useUserContext } from '../../../context/UserContext';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';

function VirtualTableModal({ isOpen, onClose, onVirtualTableCreated, sections = [], isSimpleMode = false }) {
  const { user } = useUserContext();
  const toast = useToast();
  const { t } = useLanguage();
  
  // Estados del formulario
  const [mode, setMode] = useState(isSimpleMode ? 'standalone' : 'combined');
  const [virtualTableName, setVirtualTableName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [selectedTables, setSelectedTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados para generación múltiple
  const [multipleCount, setMultipleCount] = useState(5);
  const [multiplePrefix, setMultiplePrefix] = useState('Mesa');
  const [multipleCapacity, setMultipleCapacity] = useState(4);
  
  // Configuración avanzada
  const [allowSeparateOrders, setAllowSeparateOrders] = useState(false);
  const [combineBilling, setCombineBilling] = useState(true);
  const [configNotes, setConfigNotes] = useState('');

  const resetForm = () => {
    setVirtualTableName('');
    setDescription('');
    setCapacity(4);
    setSelectedTables([]);
    setMultipleCount(5);
    setMultiplePrefix('Mesa');
    setMultipleCapacity(4);
    setAllowSeparateOrders(false);
    setCombineBilling(true);
    setConfigNotes('');
    setErrors({});
  };

  const fetchAvailableTables = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/virtual-tables/available-tables');
      setAvailableTables(response.data);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      toast({
        title: t('errorTitle'),
        description: 'No se pudieron cargar las mesas disponibles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  // Cargar mesas disponibles cuando se abre el modal (solo en modo combinado)
  useEffect(() => {
    if (isOpen) {
      if (mode === 'combined') {
        fetchAvailableTables();
      }
      resetForm();
    }
  }, [isOpen, mode, fetchAvailableTables]);

  const validateForm = () => {
    const newErrors = {};

    if (!virtualTableName.trim()) {
      newErrors.name = t('nameRequiredError');
    }

    if (mode === 'combined' && selectedTables.length < 2) {
      newErrors.tables = t('selectAtLeast2Tables');
    }

    if (mode === 'standalone' && (capacity < 1 || capacity > 50)) {
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
        mode,
        createdBy: user._id,
        configuration: {
          allowSeparateOrders,
          combineBilling,
          notes: configNotes.trim(),
        },
      };

      if (mode === 'standalone') {
        virtualTableData.capacity = capacity;
      } else {
        virtualTableData.physicalTables = selectedTables;
      }

      const response = await api.post('/virtual-tables', virtualTableData);
      
      toast({
        title: t('virtualTableCreated'),
        description: t('virtualTableCreatedDesc').replace('{tableName}', virtualTableName),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onVirtualTableCreated(response.data);
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

  const handleGenerateMultiple = async () => {
    if (multipleCount < 1 || multipleCount > 50) {
      toast({
        title: t('errorTitle'),
        description: t('invalidTableCountError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      const bulkData = {
        count: multipleCount,
        prefix: multiplePrefix.trim() || 'Mesa',
        capacity: multipleCapacity,
        mode: 'standalone',
        createdBy: user._id,
        configuration: {
          allowSeparateOrders: false,
          combineBilling: true,
          notes: 'Generada automáticamente',
        },
      };

      const response = await api.post('/virtual-tables/generate-multiple', bulkData);
      
      toast({
        title: t('tablesGenerated'),
        description: t('tablesGeneratedDesc').replace('{count}', multipleCount),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onVirtualTableCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error generating multiple tables:', error);
      toast({
        title: t('errorTitle'),
        description: error.response?.data?.message || t('tablesGenerationError'),
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableSelection = (tableIds) => {
    setSelectedTables(tableIds);
  };

  const getSelectedTablesCapacity = () => {
    return selectedTables.reduce((total, tableId) => {
      const table = availableTables.find(t => t._id === tableId);
      return total + (table?.capacity || 0);
    }, 0);
  };

  const getTabTitle = (tabMode) => {
    switch (tabMode) {
      case 'standalone':
        return isSimpleMode ? `📋 ${t('simpleTableTab')}` : '📋 Mesa Simple';
      case 'combined':
        return `🔗 ${t('combineTablesTab')}`;
      case 'multiple':
        return `⚡ ${t('quickGenerationTab')}`;
      default:
        return 'Mesa Virtual';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" bg="black">
      <ModalOverlay />
      <ModalContent maxW="600px" bg="#363636" color="white">
        <ModalHeader>
          🪑 {t('createVirtualTableHeader')}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Tabs 
            variant="soft-rounded" 
            colorScheme="teal"
            index={mode === 'standalone' ? 0 : mode === 'combined' ? 1 : 2}
            onChange={(index) => {
              const modes = ['standalone', 'combined', 'multiple'];
              setMode(modes[index]);
              setErrors({});
            }}
          >
            <TabList mb={4} justifyContent="center">
              <Tab fontSize="sm" isDisabled={isSimpleMode}>
                {getTabTitle('standalone')}
              </Tab>
              {!isSimpleMode && (
                <>
                  <Tab fontSize="sm">
                    {getTabTitle('combined')}
                  </Tab>
                  <Tab fontSize="sm">
                    {getTabTitle('multiple')}
                  </Tab>
                </>
              )}
            </TabList>

            <TabPanels>
              {/* Tab 1: Mesa Simple/Standalone */}
              <TabPanel px={0}>
                <VStack spacing={5} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      {isSimpleMode
                        ? t('standaloneTableDesc')
                        : t('simpleTableDesc')
                      }
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
                          bg="gray.700"
                          _placeholder={{ color: 'gray.400' }}
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
                          bg="gray.700"
                          _placeholder={{ color: 'gray.400' }}
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
                        <NumberInputField bg="gray.700" _placeholder={{ color: 'gray.400' }} />
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
                        <FormLabel htmlFor="separate-orders" mb="0" color="gray.300">
                          {t('allowSeparateOrders')}
                        </FormLabel>
                        <Switch
                          id="separate-orders"
                          isChecked={allowSeparateOrders}
                          onChange={(e) => setAllowSeparateOrders(e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="combine-billing" mb="0" color="gray.300">
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
                          bg="gray.700"
                          _placeholder={{ color: 'gray.400' }}
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Tab 2: Combinar Mesas */}
              {!isSimpleMode && (
                <TabPanel px={0}>
                  <VStack spacing={5} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        {t('combineTablesDesc')}
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
                            bg="gray.700"
                            _placeholder={{ color: 'gray.400' }}
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
                            bg="gray.700"
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>
                      </VStack>
                    </Box>

                    <Divider />

                    {/* Selección de mesas */}
                    <Box>
                      <HStack justify="space-between" mb={3}>
                        <Text fontSize="lg" fontWeight="semibold">
                          🪑 {t('selectTablesLabel')}
                        </Text>
                        {selectedTables.length > 0 && (
                          <Badge colorScheme="teal" variant="subtle">
                            {selectedTables.length} mesa{selectedTables.length !== 1 ? 's' : ''} • {getSelectedTablesCapacity()} personas
                          </Badge>
                        )}
                      </HStack>

                      <FormControl isInvalid={errors.tables}>
                        {isLoading ? (
                          <Text>{t('loadingTables')}</Text>
                        ) : availableTables.length === 0 ? (
                          <Alert status="warning">
                            <AlertIcon />
                            {t('noTablesAvailable')}
                          </Alert>
                        ) : (
                          <CheckboxGroup
                            value={selectedTables}
                            onChange={handleTableSelection}
                          >
                            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={3}>
                              {availableTables.map((table) => (
                                <GridItem key={table._id}>
                                  <Checkbox value={table._id}>
                                    <VStack align="start" spacing={1}>
                                      <Text fontWeight="medium">
                                        {table.name || `Mesa ${table.number}`}
                                      </Text>
                                      <HStack spacing={2}>
                                        <Badge size="sm" colorScheme="green">
                                          {table.capacity} personas
                                        </Badge>
                                        {table.section && (
                                          <Badge size="sm" variant="outline">
                                            {table.section.name}
                                          </Badge>
                                        )}
                                      </HStack>
                                    </VStack>
                                  </Checkbox>
                                </GridItem>
                              ))}
                            </Grid>
                          </CheckboxGroup>
                        )}
                        <FormErrorMessage>{errors.tables}</FormErrorMessage>
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
                          <FormLabel htmlFor="separate-orders-combined" mb="0" color="gray.300">
                            {t('allowSeparateOrders')}
                          </FormLabel>
                          <Switch
                            id="separate-orders-combined"
                            isChecked={allowSeparateOrders}
                            onChange={(e) => setAllowSeparateOrders(e.target.checked)}
                          />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="combine-billing-combined" mb="0" color="gray.300">
                            {t('combinedBilling')}
                          </FormLabel>
                          <Switch
                            id="combine-billing-combined"
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
                            bg="gray.700"
                            _placeholder={{ color: 'gray.400' }}
                          />
                        </FormControl>
                      </VStack>
                    </Box>
                  </VStack>
                </TabPanel>
              )}

              {/* Tab 3: Generación Múltiple */}
              {!isSimpleMode && (
                <TabPanel px={0}>
                  <VStack spacing={5} align="stretch">
                    <Alert status="success" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        {t('multipleGenerationDesc')}
                      </Text>
                    </Alert>

                    {/* Configuración de generación */}
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" mb={3}>
                        ⚡ {t('generationConfigSection')}
                      </Text>
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>{t('numberToGenerate')}</FormLabel>
                          <NumberInput
                            value={multipleCount}
                            onChange={(value) => setMultipleCount(parseInt(value) || 1)}
                            min={1}
                            max={50}
                          >
                            <NumberInputField bg="gray.700" _placeholder={{ color: 'gray.400' }} />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>{t('namePrefixLabel')}</FormLabel>
                          <Input
                            value={multiplePrefix}
                            onChange={(e) => setMultiplePrefix(e.target.value)}
                            placeholder={t('namePrefixPlaceholder')}
                            maxLength={20}
                            bg="gray.700"
                            _placeholder={{ color: 'gray.400' }}
                          />
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            {t('namingPatternHelper').replace('{prefix}', multiplePrefix).replace('{prefix}', multiplePrefix)}
                          </Text>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>{t('capacityPerTable')}</FormLabel>
                          <NumberInput
                            value={multipleCapacity}
                            onChange={(value) => setMultipleCapacity(parseInt(value) || 1)}
                            min={1}
                            max={50}
                          >
                            <NumberInputField bg="gray.700" _placeholder={{ color: 'gray.400' }} />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </VStack>
                    </Box>

                    <Divider />

                    {/* Preview */}
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" mb={3}>
                        👀 {t('previewSection')}
                      </Text>
                      <Box p={4} bg="gray.700" borderRadius="md" border="1px" borderColor="gray.600">
                        <Text fontSize="sm" mb={2} fontWeight="medium">
                          {t('willGenerateText').replace('{count}', multipleCount)}
                        </Text>
                        <VStack align="start" spacing={1}>
                          {Array.from({ length: Math.min(multipleCount, 5) }, (_, i) => (
                            <HStack key={i} spacing={2}>
                              <Text fontSize="sm">📋</Text>
                              <Text fontSize="sm">
                                {multiplePrefix} {i + 1}
                              </Text>
                              <Badge size="sm" colorScheme="teal">
                                {multipleCapacity} personas
                              </Badge>
                            </HStack>
                          ))}
                          {multipleCount > 5 && (
                            <Text fontSize="xs" color="gray.400" fontStyle="italic">
                              ... y {multipleCount - 5} mesa{multipleCount - 5 !== 1 ? 's' : ''} más
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </Box>
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          
          {mode === 'multiple' ? (
            <Button
              colorScheme="orange"
              onClick={handleGenerateMultiple}
              isLoading={isLoading}
              loadingText="Generando..."
              isDisabled={multipleCount < 1}
            >
              Generar {multipleCount} Mesas
            </Button>
          ) : (
            <Button
              colorScheme="teal"
              onClick={handleCreateVirtualTable}
              isLoading={isLoading}
              loadingText="Creando..."
              isDisabled={
                !virtualTableName.trim() || 
                (mode === 'combined' && selectedTables.length < 2) ||
                (mode === 'standalone' && (capacity < 1 || capacity > 50))
              }
            >
              {t('createVirtualTableHeader')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default VirtualTableModal;