import React, { useState, useEffect } from 'react';
import { Box, Flex, Button, Text, HStack, VStack, Badge, useDisclosure, useToast, Grid } from '@chakra-ui/react';
import VirtualTableModal from './VirtualTableModal';
import api from '../../../services/api';

function TableSelection({ sections, onTableClick, onRefreshSections }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [virtualTables, setVirtualTables] = useState([]);
  const [isLoadingVirtual, setIsLoadingVirtual] = useState(false);
  const toast = useToast();

  // Detectar si es un restaurante simple (sin secciones configuradas)
  const isSimpleRestaurant = !sections || sections.length === 0 || 
    sections.every(section => !section.tables || section.tables.length === 0);

  // Cargar mesas virtuales al montar el componente
  useEffect(() => {
    fetchVirtualTables();
  }, []);

  const fetchVirtualTables = async () => {
    try {
      setIsLoadingVirtual(true);
      const response = await api.get('/virtual-tables?active=true');
      setVirtualTables(response.data);
    } catch (error) {
      console.error('Error fetching virtual tables:', error);
    } finally {
      setIsLoadingVirtual(false);
    }
  };

  const handleVirtualTableCreated = (newVirtualTable) => {
    setVirtualTables(prev => [newVirtualTable, ...prev]);
    // Refrescar las secciones para actualizar el estado de las mesas físicas
    if (onRefreshSections) {
      onRefreshSections();
    }
    toast({
      title: 'Mesa virtual creada',
      description: `"${newVirtualTable.name}" está lista para usar`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleVirtualTableClick = (virtualTable) => {
    // Crear un objeto similar a una mesa física para mantener compatibilidad
    const virtualTableAsTable = {
      _id: virtualTable._id,
      number: virtualTable.name,
      status: virtualTable.status,
      isVirtual: true,
      virtualTableData: virtualTable,
      capacity: virtualTable.totalCapacity,
    };
    
    onTableClick(virtualTableAsTable);
  };
  // Validar que sections existe y es un array
  if (!sections || !Array.isArray(sections)) {
    return (
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Áreas
        </Text>
        <Text>No hay secciones disponibles</Text>
      </Box>
    );
  }

  // Si no hay secciones
  if (sections.length === 0) {
    return (
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          Áreas
        </Text>
        <Text>No hay secciones configuradas</Text>
      </Box>
    );
  }

  return (
    <>
      {isSimpleRestaurant ? (
        /* Modo restaurante simple - Solo mesas virtuales */
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="2xl" fontWeight="bold">
                🍽️ Mesas del Restaurante
              </Text>
              <Text fontSize="sm" color="gray.600">
                Gestiona tus mesas de forma simple y rápida
              </Text>
            </Box>
            <VStack spacing={2}>
              <Button 
                colorScheme="green" 
                onClick={onOpen}
                size="md"
                leftIcon={<Text>🍽️</Text>}
              >
                Nueva Mesa
              </Button>
              {virtualTables.length === 0 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  ¡Crea tu primera mesa!
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Mesas Virtuales para restaurante simple */}
          {virtualTables.length === 0 ? (
            <Box 
              p={8} 
              textAlign="center" 
              borderWidth="2px" 
              borderStyle="dashed" 
              borderColor="gray.300" 
              borderRadius="md"
              bg="gray.50"
            >
              <VStack spacing={4}>
                <Text fontSize="6xl">🍽️</Text>
                <Text fontSize="lg" fontWeight="bold" color="gray.600">
                  ¡Bienvenido a tu restaurante!
                </Text>
                <Text color="gray.500" maxW="400px">
                  Empieza creando tus primeras mesas. Es súper fácil y no necesitas configurar nada más.
                </Text>
                <Button 
                  colorScheme="blue" 
                  size="lg"
                  onClick={onOpen}
                  leftIcon={<Text>⚡</Text>}
                >
                  Configuración Rápida
                </Button>
              </VStack>
            </Box>
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={4}>
              {virtualTables.map((virtualTable) => (
                <Box
                  key={virtualTable._id}
                  as="button"
                  onClick={() => handleVirtualTableClick(virtualTable)}
                  p={4}
                  borderWidth="2px"
                  borderRadius="lg"
                  borderColor={virtualTable.status === "occupied" ? "red.300" : "green.300"}
                  bg={virtualTable.status === "occupied" ? "red.50" : "green.50"}
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                    borderColor: virtualTable.status === "occupied" ? "red.400" : "green.400"
                  }}
                  transition="all 0.2s"
                >
                  <VStack spacing={3}>
                    <Text fontSize="2xl">
                      {virtualTable.status === "occupied" ? "🔴" : "🟢"}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" textAlign="center">
                      {virtualTable.name}
                    </Text>
                    <HStack spacing={3}>
                      <Badge 
                        colorScheme={virtualTable.status === "occupied" ? "red" : "green"}
                        variant="solid"
                      >
                        {virtualTable.status === "occupied" ? "Ocupada" : "Disponible"}
                      </Badge>
                      <Badge colorScheme="blue" variant="outline">
                        {virtualTable.totalCapacity}p
                      </Badge>
                    </HStack>
                    {virtualTable.description && (
                      <Text fontSize="xs" color="gray.600" textAlign="center" noOfLines={2}>
                        {virtualTable.description}
                      </Text>
                    )}
                  </VStack>
                </Box>
              ))}
            </Grid>
          )}
        </VStack>
      ) : (
        /* Modo restaurante avanzado - Secciones + Mesas virtuales */
        <>
          <HStack mb={4} justify="space-between">
            <Text fontSize="2xl" fontWeight="bold">
              Áreas
            </Text>
            <Button 
              colorScheme="blue" 
              onClick={onOpen}
              size="md"
              leftIcon={<Text>🔗</Text>}
            >
              Generar mesa virtual
            </Button>
          </HStack>

          {/* Mesas Virtuales */}
          {virtualTables.length > 0 && (
            <Box mb={6}>
              <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.600">
                🔗 Mesas Virtuales
              </Text>
              <HStack wrap="wrap" spacing={4}>
                {virtualTables.map((virtualTable) => (
                  <Button
                    key={virtualTable._id}
                    colorScheme={virtualTable.status === "occupied" ? "red" : "blue"}
                    variant={virtualTable.status === "occupied" ? "solid" : "outline"}
                    onClick={() => handleVirtualTableClick(virtualTable)}
                    minW="120px"
                    h="70px"
                    position="relative"
                  >
                    <VStack spacing={1}>
                      <Text fontSize="sm" fontWeight="bold" textAlign="center">
                        {virtualTable.name}
                      </Text>
                      <HStack spacing={2}>
                        {virtualTable.mode === 'combined' && (
                          <Badge size="sm" colorScheme="gray">
                            {virtualTable.physicalTables.length} mesas
                          </Badge>
                        )}
                        <Badge size="sm" colorScheme="green">
                          {virtualTable.totalCapacity}p
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color={virtualTable.status === "occupied" ? "white" : "gray.600"}>
                        {virtualTable.status === "occupied" ? "Ocupada" : "Disponible"}
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </HStack>
            </Box>
          )}

          <Flex direction="column" gap={4}>
            {sections.map((section) => {
              // Validar que la sección tiene un ID válido
              if (!section || !section._id) {
                return null;
              }

              const tables = section.tables || [];

              return (
                <Box key={section._id} border="1px solid black" p={4} borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {section.name || 'Sección sin nombre'} ({tables.length} mesas)
                  </Text>
                  <HStack wrap="wrap" spacing={4}>
                    {tables.length > 0 ? (
                      tables.map((table) => {
                        if (!table || !table._id) {
                          return null;
                        }
                        
                        // Verificar si la mesa es parte de una mesa virtual
                        const isPartOfVirtual = table.virtualTableId || table.isPartOfVirtual;
                        
                        return (
                          <Button
                            key={table._id}
                            colorScheme={
                              isPartOfVirtual 
                                ? "purple" 
                                : table.status === "occupied" 
                                  ? "red" 
                                  : "green"
                            }
                            onClick={() => onTableClick(table)}
                            isDisabled={isPartOfVirtual}
                            position="relative"
                            minW="100px"
                            h="60px"
                          >
                            <VStack spacing={1}>
                              <Text fontSize="sm" fontWeight="bold">
                                Mesa {table.number || 'S/N'}
                              </Text>
                              <Text fontSize="xs">
                                {isPartOfVirtual 
                                  ? "En Mesa Virtual" 
                                  : table.status === "occupied" 
                                    ? "Ocupada" 
                                    : "Disponible"
                                }
                              </Text>
                            </VStack>
                            {isPartOfVirtual && (
                              <Badge 
                                position="absolute" 
                                top="-5px" 
                                right="-5px" 
                                colorScheme="purple" 
                                fontSize="xs"
                              >
                                🔗
                              </Badge>
                            )}
                          </Button>
                        );
                      })
                    ) : (
                      <Text color="gray.500">No hay mesas en esta sección</Text>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </Flex>
        </>
      )}

      {/* Modal para crear mesa virtual */}
      <VirtualTableModal
        isOpen={isOpen}
        onClose={onClose}
        onVirtualTableCreated={handleVirtualTableCreated}
        sections={sections}
        isSimpleMode={isSimpleRestaurant}
      />
    </>
  );
}

export default TableSelection;
