import React, { useState, useEffect } from 'react';
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
  const {t} = useLanguage();
  
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

  // Cargar mesas disponibles cuando se abre el modal (solo en modo combinado)
  useEffect(() => {
    if (isOpen) {
      if (mode === 'combined') {
        fetchAvailableTables();
      }
      resetForm();
    }
  }, [isOpen, mode]);

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

  const fetchAvailableTables = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/virtual-tables/available-tables');
      setAvailableTables(response.data);
    } catch (error) {
      console.error('Error fetching available tables:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las mesas disponibles',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!virtualTableName.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (mode === 'combined' && selectedTables.length < 2) {
      newErrors.tables = 'Selecciona al menos 2 mesas para combinar';
    }

    if (mode === 'standalone' && (capacity < 1 || capacity > 50)) {
      newErrors.capacity = 'La capacidad debe estar entre 1 y 50 personas';
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
        title: 'Mesa Virtual Creada',
        description: `"${virtualTableName}" ha sido creada exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onVirtualTableCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating virtual table:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al crear la mesa virtual',
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
        title: 'Error',
        description: 'El número de mesas debe estar entre 1 y 50',
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
        title: 'Mesas Generadas',
        description: `${multipleCount} mesas virtuales han sido creadas exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onVirtualTableCreated(response.data);
      onClose();
    } catch (error) {
      console.error('Error generating multiple tables:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error al generar las mesas virtuales',
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
        return isSimpleMode ? '📋 Nueva Mesa' : '📋 Mesa Simple';
      case 'combined':
        return '🔗 Combinar Mesas';
      case 'multiple':
        return '⚡ Generación Rápida';
      default:
        return 'Mesa Virtual';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" bg="black">
      <ModalOverlay />
      <ModalContent maxW="600px" bg="#363636" color="white">
        <ModalHeader>
          🪑 Crear Mesa Virtual
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
                        ? 'Crea una mesa independiente para gestionar pedidos dinámicamente.'
                        : 'Crea una mesa virtual independiente, sin vincular mesas físicas.'
                      }
                    </Text>
                  </Alert>

                  {/* Información básica */}
                  <Box>
                    <Text fontSize="lg" fontWeight="semibold" mb={3}>
                      📝 Información Básica
                    </Text>
                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired isInvalid={errors.name}>
                        <FormLabel>Nombre de la Mesa Virtual</FormLabel>
                        <Input
                          value={virtualTableName}
                          onChange={(e) => setVirtualTableName(e.target.value)}
                          placeholder="ej: Mesa Grande Terraza, Evento Empresarial..."
                          maxLength={50}
                          bg="gray.700"
                          _placeholder={{ color: 'gray.400' }}
                        />
                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Descripción (opcional)</FormLabel>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe el propósito o características especiales..."
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
                      👥 Capacidad
                    </Text>
                    <FormControl isRequired isInvalid={errors.capacity}>
                      <FormLabel>Número de personas</FormLabel>
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
                      ⚙️ Configuración Avanzada
                    </Text>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="separate-orders" mb="0" color="gray.300">
                          Permitir pedidos separados
                        </FormLabel>
                        <Switch
                          id="separate-orders"
                          isChecked={allowSeparateOrders}
                          onChange={(e) => setAllowSeparateOrders(e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="combine-billing" mb="0" color="gray.300">
                          Facturación combinada
                        </FormLabel>
                        <Switch
                          id="combine-billing"
                          isChecked={combineBilling}
                          onChange={(e) => setCombineBilling(e.target.checked)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Notas de configuración</FormLabel>
                        <Textarea
                          value={configNotes}
                          onChange={(e) => setConfigNotes(e.target.value)}
                          placeholder="Instrucciones especiales para el servicio..."
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
                        Combina mesas físicas existentes para formar una mesa virtual más grande.
                      </Text>
                    </Alert>

                    {/* Información básica */}
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" mb={3}>
                        📝 Información Básica
                      </Text>
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired isInvalid={errors.name}>
                          <FormLabel>Nombre de la Mesa Virtual</FormLabel>
                          <Input
                            value={virtualTableName}
                            onChange={(e) => setVirtualTableName(e.target.value)}
                            placeholder="ej: Mesa Grande Terraza, Evento Empresarial..."
                            maxLength={50}
                            bg="gray.700"
                            _placeholder={{ color: 'gray.400' }}
                          />
                          <FormErrorMessage>{errors.name}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Descripción (opcional)</FormLabel>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el propósito o características especiales..."
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
                          🪑 Seleccionar Mesas
                        </Text>
                        {selectedTables.length > 0 && (
                          <Badge colorScheme="teal" variant="subtle">
                            {selectedTables.length} mesa{selectedTables.length !== 1 ? 's' : ''} • {getSelectedTablesCapacity()} personas
                          </Badge>
                        )}
                      </HStack>

                      <FormControl isInvalid={errors.tables}>
                        {isLoading ? (
                          <Text>Cargando mesas disponibles...</Text>
                        ) : availableTables.length === 0 ? (
                          <Alert status="warning">
                            <AlertIcon />
                            No hay mesas físicas disponibles para combinar
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
                        ⚙️ Configuración Avanzada
                      </Text>
                      <VStack spacing={4} align="stretch">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="separate-orders-combined" mb="0" color="gray.300">
                            Permitir pedidos separados
                          </FormLabel>
                          <Switch
                            id="separate-orders-combined"
                            isChecked={allowSeparateOrders}
                            onChange={(e) => setAllowSeparateOrders(e.target.checked)}
                          />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="combine-billing-combined" mb="0" color="gray.300">
                            Facturación combinada
                          </FormLabel>
                          <Switch
                            id="combine-billing-combined"
                            isChecked={combineBilling}
                            onChange={(e) => setCombineBilling(e.target.checked)}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Notas de configuración</FormLabel>
                          <Textarea
                            value={configNotes}
                            onChange={(e) => setConfigNotes(e.target.value)}
                            placeholder="Instrucciones especiales para el servicio..."
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
                        Genera múltiples mesas virtuales de una vez para acelerar la configuración inicial.
                      </Text>
                    </Alert>

                    {/* Configuración de generación */}
                    <Box>
                      <Text fontSize="lg" fontWeight="semibold" mb={3}>
                        ⚡ Configuración de Generación
                      </Text>
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Número de mesas a generar</FormLabel>
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
                          <FormLabel>Prefijo del nombre</FormLabel>
                          <Input
                            value={multiplePrefix}
                            onChange={(e) => setMultiplePrefix(e.target.value)}
                            placeholder="Mesa"
                            maxLength={20}
                            bg="gray.700"
                            _placeholder={{ color: 'gray.400' }}
                          />
                          <Text fontSize="xs" color="gray.400" mt={1}>
                            Las mesas se numerarán como: "{multiplePrefix} 1", "{multiplePrefix} 2", etc.
                          </Text>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Capacidad por mesa</FormLabel>
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
                        👀 Vista Previa
                      </Text>
                      <Box p={4} bg="gray.700" borderRadius="md" border="1px" borderColor="gray.600">
                        <Text fontSize="sm" mb={2} fontWeight="medium">
                          Se generarán {multipleCount} mesa{multipleCount !== 1 ? 's' : ''}:
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
              Crear Mesa Virtual
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default VirtualTableModal;