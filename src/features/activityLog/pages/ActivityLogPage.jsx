import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Heading, Text, VStack, HStack, Badge, Spinner, Center, IconButton,
  Collapse, Select, Divider, Button,
} from '@chakra-ui/react';
import { FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import api from '../../../services/api';
import OrderDetailModal from '../components/OrderDetailModal';

const TRACE_TYPES = ['order', 'tableSession', 'table', 'virtualTable', 'role', 'user'];

const TRACE_ICONS = {
  order: '🧾',
  tableSession: '🍽️',
  table: '🧹',
  virtualTable: '🧩',
  role: '🛡️',
  user: '👤',
};

const TRACE_TYPE_LABEL_KEY = {
  order: 'traceTypeOrder',
  tableSession: 'traceTypeTableSession',
  table: 'traceTypeTable',
  virtualTable: 'traceTypeVirtualTable',
  role: 'traceTypeRole',
  user: 'traceTypeUser',
};

// Fills `{placeholder}` tokens in an already-translated string with values
// from an arbitrary metadata object — the log has ~20 event/trace templates
// with different fields each, so a fixed chain of .replace() calls per call
// site isn't practical the way it is for the rest of the app's i18n usage.
function interpolate(text, params) {
  return Object.entries(params || {}).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(value ?? ''),
    text
  );
}

const traceKey = (trace) => `${trace.traceType}:${trace.traceId}`;

function ActivityLogPage() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const toast = useCustomToast();

  const [traces, setTraces] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [traceTypeFilter, setTraceTypeFilter] = useState('');

  const [expandedKey, setExpandedKey] = useState(null);
  const [traceEvents, setTraceEvents] = useState({});
  const [loadingTraceKey, setLoadingTraceKey] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchTraces = useCallback(() => {
    setIsLoading(true);
    const params = { page, limit: 20 };
    if (traceTypeFilter) params.traceType = traceTypeFilter;
    api.get('/activity-logs', { params })
      .then((res) => {
        setTraces(res.data.traces);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => toast({ title: t('errorTitle'), status: 'error' }))
      .finally(() => setIsLoading(false));
  }, [page, traceTypeFilter, t, toast]);

  useEffect(() => { fetchTraces(); }, [fetchTraces]);
  useEffect(() => { setPage(1); }, [traceTypeFilter]);

  const toggleExpand = (trace) => {
    const key = traceKey(trace);
    if (expandedKey === key) {
      setExpandedKey(null);
      return;
    }
    setExpandedKey(key);
    if (!traceEvents[key]) {
      setLoadingTraceKey(key);
      api.get(`/activity-logs/trace/${trace.traceType}/${trace.traceId}`)
        .then((res) => setTraceEvents((prev) => ({ ...prev, [key]: res.data })))
        .catch(() => toast({ title: t('errorTitle'), status: 'error' }))
        .finally(() => setLoadingTraceKey(null));
    }
  };

  if (!currentTheme) return null;
  const c = currentTheme.colors;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <HStack justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="lg" color={c.text}>{t('activityLogHeading')}</Heading>
          <Text color="gray.400" mt={1}>{t('activityLogDescription')}</Text>
        </Box>
        <Select
          value={traceTypeFilter}
          onChange={(e) => setTraceTypeFilter(e.target.value)}
          maxW="220px"
          bg={c.surface}
          borderColor="gray.600"
        >
          <option value="">{t('traceTypeAll')}</option>
          {TRACE_TYPES.map((type) => (
            <option key={type} value={type}>{t(TRACE_TYPE_LABEL_KEY[type])}</option>
          ))}
        </Select>
      </HStack>

      {isLoading ? (
        <Center py={16}><Spinner size="xl" color={c.primary[500]} /></Center>
      ) : traces.length === 0 ? (
        <Center py={16} flexDirection="column" gap={3}>
          <Text fontSize="3xl">📋</Text>
          <Text color="gray.400">{t('noActivityYet')}</Text>
        </Center>
      ) : (
        <VStack align="stretch" spacing={3}>
          {traces.map((trace) => {
            const key = traceKey(trace);
            const isExpanded = expandedKey === key;
            const events = traceEvents[key];
            return (
              <Box key={key} bg={c.surface} borderRadius="lg" border="1px solid" borderColor="transparent" overflow="hidden">
                <HStack
                  p={4}
                  justify="space-between"
                  cursor="pointer"
                  onClick={() => toggleExpand(trace)}
                  _hover={{ bg: `${c.primary[500]}0A` }}
                >
                  <HStack spacing={3} align="flex-start">
                    <Text fontSize="xl">{TRACE_ICONS[trace.traceType] || '•'}</Text>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="semibold" color={c.text}>
                        {interpolate(t(trace.headlineSummary), {
                          ...trace.metadata,
                          actorName: trace.lastActorName,
                          eventCount: trace.eventCount,
                        })}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date(trace.lastEventAt).toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack>
                    {trace.eventCount > 1 && (
                      <Badge bg={`${c.primary[500]}22`} color={c.primary[500]} fontSize="xs">
                        {trace.eventCount}
                      </Badge>
                    )}
                    <IconButton
                      icon={isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      size="xs"
                      variant="ghost"
                      aria-label={t('expandDetail')}
                    />
                  </HStack>
                </HStack>

                <Collapse in={isExpanded} animateOpacity>
                  <Box px={4} pb={4}>
                    <Divider borderColor="gray.600" mb={3} />
                    {loadingTraceKey === key ? (
                      <Center py={4}><Spinner size="md" color={c.primary[500]} /></Center>
                    ) : (
                      <VStack align="stretch" spacing={2}>
                        {(events || []).map((event) => (
                          <HStack key={event._id} justify="space-between" align="flex-start" fontSize="sm">
                            <Text color={c.text}>
                              {interpolate(t(event.summary), { ...event.metadata, actorName: event.actorName })}
                            </Text>
                            <VStack align="end" spacing={0} flexShrink={0}>
                              <Text fontSize="xs" color="gray.400">
                                {new Date(event.createdAt).toLocaleTimeString()}
                              </Text>
                              {event.elapsedFromPreviousMs != null && (
                                <Text fontSize="xs" color="gray.500">
                                  +{Math.round(event.elapsedFromPreviousMs / 1000)}s
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                        ))}
                        {trace.traceType === 'order' && (
                          <Button
                            alignSelf="flex-start"
                            size="sm"
                            variant="outline"
                            mt={2}
                            onClick={() => setSelectedOrderId(trace.traceId)}
                          >
                            {t('viewOrderButton')}
                          </Button>
                        )}
                      </VStack>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </VStack>
      )}

      {totalPages > 1 && (
        <HStack justify="center" mt={6} spacing={4}>
          <IconButton
            icon={<FaChevronLeft />}
            size="sm"
            variant="outline"
            aria-label={t('previousPage')}
            isDisabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          />
          <Text color={c.text} fontSize="sm">
            {t('pageOfTotal').replace('{current}', page).replace('{total}', totalPages)}
          </Text>
          <IconButton
            icon={<FaChevronRight />}
            size="sm"
            variant="outline"
            aria-label={t('nextPage')}
            isDisabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </HStack>
      )}

      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </Box>
  );
}

export default ActivityLogPage;
