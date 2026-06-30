import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Button, Text, HStack, VStack, Badge, useDisclosure, useToast, Grid } from '@chakra-ui/react';
import VirtualTableModal from './VirtualTableModal';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

// Hex values bypass Chakra's colorScheme system (which the global theme overrides)
const STATUS_STYLES = {
  available: {
    borderColor: '#48BB78',   // green.400
    cardBg: 'rgba(72, 187, 120, 0.1)',
    buttonBg: '#38A169',      // green.600 — clear on both light and dark
    buttonHover: '#2F855A',
    badgeScheme: 'green',
    dotColor: '#48BB78',
    icon: '🟢',
  },
  open: {
    borderColor: '#FC8181',   // red.400
    cardBg: 'rgba(245, 101, 101, 0.1)',
    buttonBg: '#E53E3E',      // red.500
    buttonHover: '#C53030',
    badgeScheme: 'red',
    dotColor: '#FC8181',
    icon: '🔴',
  },
  ready_for_payment: {
    borderColor: '#ECC94B',   // yellow.400
    cardBg: 'rgba(236, 201, 75, 0.1)',
    buttonBg: '#D69E2E',      // yellow.600 — better contrast than yellow.400
    buttonHover: '#B7791F',
    badgeScheme: 'yellow',
    dotColor: '#ECC94B',
    icon: '🟡',
  },
};

// Special physical table states not tied to session status
const SPECIAL_BUTTON = {
  virtual: { bg: '#805AD5', hover: '#6B46C1' },    // purple.500
  maintenance: { bg: '#ED8936', hover: '#DD6B20' }, // orange.400 (.500 is overridden by theme)
};

function TableSelection({ sections, onTableClick, onRefreshSections }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [virtualTables, setVirtualTables] = useState([]);
  const [sessionMap, setSessionMap] = useState({});
  const toast = useToast();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const isSimpleRestaurant = !sections || sections.length === 0 ||
    sections.every(section => !section.tables || section.tables.length === 0);

  useEffect(() => {
    fetchVirtualTables();
    fetchActiveSessions();
  }, []);

  // Re-fetch sessions when sections change (table opened/closed from OrderPage)
  const prevSectionsKeyRef = useRef(null);
  useEffect(() => {
    const key = JSON.stringify(
      sections?.map(s => s.tables?.map(t => t._id + t.status).join(''))
    );
    if (key !== prevSectionsKeyRef.current) {
      prevSectionsKeyRef.current = key;
      fetchActiveSessions();
    }
  }, [sections]);

  if (!currentTheme) return null;
  const textColor = currentTheme.colors.text;
  const surfaceColor = currentTheme.colors.surface;

  const fetchVirtualTables = async () => {
    try {
      const response = await api.get('/virtual-tables?active=true');
      setVirtualTables(response.data);
    } catch (error) {
      console.error('Error fetching virtual tables:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await api.get('/tableSession/active');
      const map = {};
      response.data.forEach(session => {
        map[session.tableId.toString()] = session.status;
      });
      setSessionMap(map);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  // Returns 'available' | 'open' | 'ready_for_payment'
  const getEffectiveStatus = (tableId, tableStatus) => {
    if (tableStatus !== 'occupied') return 'available';
    return sessionMap[tableId?.toString()] === 'ready_for_payment'
      ? 'ready_for_payment'
      : 'open';
  };

  const handleVirtualTableCreated = (newVirtualTable) => {
    setVirtualTables(prev => [newVirtualTable, ...prev]);
    if (onRefreshSections) onRefreshSections();
    fetchActiveSessions();
    toast({
      title: t('virtualTableCreated'),
      description: t('virtualTableCreatedDesc').replace('{tableName}', newVirtualTable.name),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReleaseTable = async (tableId) => {
    try {
      await api.put(`/tables/${tableId}/release`);
      if (onRefreshSections) onRefreshSections();
      fetchActiveSessions();
      toast({ title: t('releaseTable'), status: 'success', duration: 2000, isClosable: true });
    } catch (error) {
      console.error('Error releasing table:', error);
      toast({
        title: t('errorTitle'),
        description: t('releaseTableError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVirtualTableClick = (virtualTable) => {
    onTableClick({
      _id: virtualTable._id,
      number: virtualTable.name,
      status: virtualTable.status,
      isVirtual: true,
      virtualTableData: virtualTable,
      capacity: virtualTable.totalCapacity,
    });
  };

  if (!sections || !Array.isArray(sections)) {
    return (
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>{t('areasLabel')}</Text>
        <Text>{t('noSectionsAvailable')}</Text>
      </Box>
    );
  }

  if (sections.length === 0) {
    return (
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>{t('areasLabel')}</Text>
        <Text>{t('noSectionsConfigured')}</Text>
      </Box>
    );
  }

  const StatusLegend = () => (
    <HStack spacing={5} fontSize="xs" flexWrap="wrap">
      <Text fontWeight="semibold" color={`${textColor}99`}>{t('colorLegend')}:</Text>
      {Object.entries(STATUS_STYLES).map(([key, s]) => (
        <HStack key={key} spacing={1}>
          <Box w={3} h={3} borderRadius="full" bg={s.dotColor} flexShrink={0} />
          <Text color={`${textColor}CC`}>
            {key === 'available' ? t('available') : key === 'open' ? t('occupiedStatus') : t('readyForPayment')}
          </Text>
        </HStack>
      ))}
    </HStack>
  );

  return (
    <>
      {isSimpleRestaurant ? (
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="2xl" fontWeight="bold">
                🍽️ {t('restaurantTablesHeader')}
              </Text>
              <Text fontSize="sm" color={`${textColor}80`}>
                {t('manageTablesDescription')}
              </Text>
            </Box>
            <VStack spacing={2} align="flex-end">
              <Button colorScheme="green" onClick={onOpen} size="md" leftIcon={<Text>🍽️</Text>}>
                {t('newTableButton')}
              </Button>
              {virtualTables.length === 0 && (
                <Text fontSize="xs" color={`${textColor}66`} textAlign="center">
                  {t('createFirstTable')}
                </Text>
              )}
            </VStack>
          </HStack>

          {virtualTables.length === 0 ? (
            <Box
              p={8}
              textAlign="center"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor={`${textColor}33`}
              borderRadius="md"
              bg={surfaceColor}
            >
              <VStack spacing={4}>
                <Text fontSize="6xl">🍽️</Text>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>{t('welcomeRestaurant')}</Text>
                <Text color={`${textColor}80`} maxW="400px">{t('createTableIntro')}</Text>
                <Button colorScheme="blue" size="lg" onClick={onOpen} leftIcon={<Text>⚡</Text>}>
                  {t('quickSetup')}
                </Button>
              </VStack>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              <StatusLegend />
              <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={4}>
                {virtualTables.map((virtualTable) => {
                  const status = getEffectiveStatus(virtualTable._id, virtualTable.status);
                  const s = STATUS_STYLES[status];
                  const label = status === 'available' ? t('available')
                    : status === 'open' ? t('occupiedStatus')
                    : t('readyForPayment');
                  return (
                    <Box
                      key={virtualTable._id}
                      as="button"
                      onClick={() => handleVirtualTableClick(virtualTable)}
                      p={4}
                      borderWidth="2px"
                      borderRadius="lg"
                      borderColor={s.borderColor}
                      bg={s.cardBg}
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'lg',
                        borderColor: s.buttonBg,
                      }}
                      transition="all 0.2s"
                      textAlign="center"
                    >
                      <VStack spacing={3}>
                        <Text fontSize="2xl">{s.icon}</Text>
                        <Text fontSize="lg" fontWeight="bold" color={textColor}>
                          {virtualTable.name}
                        </Text>
                        <HStack spacing={2} justify="center" flexWrap="wrap">
                          <Badge colorScheme={s.badgeScheme} variant="solid">{label}</Badge>
                          <Badge colorScheme="blue" variant="outline">{virtualTable.totalCapacity}p</Badge>
                        </HStack>
                        {virtualTable.description && (
                          <Text fontSize="xs" color={`${textColor}80`} textAlign="center" noOfLines={2}>
                            {virtualTable.description}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  );
                })}
              </Grid>
            </VStack>
          )}
        </VStack>
      ) : (
        <>
          <HStack mb={3} justify="space-between">
            <Text fontSize="2xl" fontWeight="bold">{t('areasLabel')}</Text>
            <Button colorScheme="blue" onClick={onOpen} size="md" leftIcon={<Text>🔗</Text>}>
              {t('generateVirtualTableBtn')}
            </Button>
          </HStack>

          <StatusLegend />

          {virtualTables.length > 0 && (
            <Box mb={6} mt={4}>
              <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.400">
                🔗 {t('virtualTablesHeader')}
              </Text>
              <HStack wrap="wrap" spacing={4}>
                {virtualTables.map((virtualTable) => {
                  const status = getEffectiveStatus(virtualTable._id, virtualTable.status);
                  const s = STATUS_STYLES[status];
                  const label = status === 'available' ? t('available')
                    : status === 'open' ? t('occupiedStatus')
                    : t('readyForPayment');
                  const isAvailable = status === 'available';
                  return (
                    <Button
                      key={virtualTable._id}
                      variant={isAvailable ? 'outline' : 'solid'}
                      bg={isAvailable ? 'transparent' : s.buttonBg}
                      borderColor={s.borderColor}
                      color={isAvailable ? s.borderColor : 'white'}
                      _hover={{
                        bg: isAvailable ? s.cardBg : s.buttonHover,
                        borderColor: s.borderColor,
                      }}
                      onClick={() => handleVirtualTableClick(virtualTable)}
                      minW="120px"
                      h="70px"
                    >
                      <VStack spacing={1}>
                        <Text fontSize="sm" fontWeight="bold" textAlign="center">
                          {virtualTable.name}
                        </Text>
                        <HStack spacing={2}>
                          {virtualTable.mode === 'combined' && (
                            <Badge size="sm" colorScheme="gray">
                              {virtualTable.physicalTables.length} {t('tablesLabel').toLowerCase()}
                            </Badge>
                          )}
                          <Badge size="sm" colorScheme="blue">{virtualTable.totalCapacity}p</Badge>
                        </HStack>
                        <Text fontSize="xs">{label}</Text>
                      </VStack>
                    </Button>
                  );
                })}
              </HStack>
            </Box>
          )}

          <Flex direction="column" gap={4} mt={virtualTables.length > 0 ? 0 : 4}>
            {sections.map((section) => {
              if (!section || !section._id) return null;
              const tables = section.tables || [];
              return (
                <Box key={section._id} border="1px solid" borderColor={`${textColor}33`} p={4} borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {section.name || t('sectionWithoutName')} ({tables.length} {t('tablesLabel').toLowerCase()})
                  </Text>
                  <HStack wrap="wrap" spacing={4}>
                    {tables.length > 0 ? (
                      tables.map((table) => {
                        if (!table || !table._id) return null;

                        const isPartOfVirtual = table.virtualTableId || table.isPartOfVirtual;
                        const isMaintenance = table.status === 'maintenance';
                        const effectiveStatus = getEffectiveStatus(table._id, table.status);
                        const s = STATUS_STYLES[effectiveStatus];

                        let btnBg, btnHover, btnColor;
                        if (isPartOfVirtual) {
                          btnBg = SPECIAL_BUTTON.virtual.bg;
                          btnHover = SPECIAL_BUTTON.virtual.hover;
                          btnColor = 'white';
                        } else if (isMaintenance) {
                          btnBg = SPECIAL_BUTTON.maintenance.bg;
                          btnHover = SPECIAL_BUTTON.maintenance.hover;
                          btnColor = 'white';
                        } else {
                          btnBg = s.buttonBg;
                          btnHover = s.buttonHover;
                          btnColor = 'white';
                        }

                        const statusLabel = isPartOfVirtual
                          ? t('inVirtualTableStatus')
                          : isMaintenance
                            ? `🧹 ${t('maintenance')}`
                            : effectiveStatus === 'available' ? t('available')
                            : effectiveStatus === 'open' ? t('occupiedStatus')
                            : t('readyForPayment');

                        return (
                          <Box key={table._id} position="relative">
                            <Button
                              bg={btnBg}
                              color={btnColor}
                              _hover={{ bg: btnHover }}
                              _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
                              onClick={() => onTableClick(table)}
                              isDisabled={isPartOfVirtual || isMaintenance}
                              minW="100px"
                              h="60px"
                              position="relative"
                            >
                              <VStack spacing={1}>
                                <Text fontSize="sm" fontWeight="bold">
                                  {t('table')} {table.number || t('notAssignedAbbr')}
                                </Text>
                                <Text fontSize="xs">{statusLabel}</Text>
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
                            {isMaintenance && !isPartOfVirtual && (
                              <Button
                                mt={1}
                                size="xs"
                                width="100%"
                                bg="transparent"
                                borderWidth="1px"
                                borderColor={SPECIAL_BUTTON.maintenance.bg}
                                color={SPECIAL_BUTTON.maintenance.bg}
                                _hover={{ bg: `${SPECIAL_BUTTON.maintenance.bg}22` }}
                                onClick={() => handleReleaseTable(table._id)}
                              >
                                {t('releaseTable')}
                              </Button>
                            )}
                          </Box>
                        );
                      })
                    ) : (
                      <Text color={`${textColor}66`}>{t('noTablesInSection')}</Text>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </Flex>
        </>
      )}

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
