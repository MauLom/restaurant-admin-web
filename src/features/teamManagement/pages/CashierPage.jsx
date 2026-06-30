import React, { useState, useEffect } from 'react';
import {
  Box, Grid, VStack, HStack, Text, Button, Input, Divider,
  Badge, IconButton, Heading, Checkbox,
} from '@chakra-ui/react';
import { FaMoneyBillAlt, FaCreditCard, FaExchangeAlt, FaTimes } from 'react-icons/fa';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

const PAYMENT_METHODS = [
  { key: 'cash', Icon: FaMoneyBillAlt },
  { key: 'card', Icon: FaCreditCard },
  { key: 'transfer', Icon: FaExchangeAlt },
];

function CashierPage() {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const { currentTheme } = useTheme();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [tip, setTip] = useState(0);
  const [customTipInput, setCustomTipInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sections + filter to only tables with pending payment orders
  const fetchTables = async () => {
    try {
      const [sectionsRes, pendingRes] = await Promise.all([
        api.get('/sections'),
        api.get('/orders/pending-payment-tables'),
      ]);
      const pendingIds = new Set(pendingRes.data);
      const allTables = sectionsRes.data.flatMap(s => s.tables);
      setTables(allTables.filter(t => pendingIds.has(t._id)));
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  if (!currentTheme) return null;
  const c = currentTheme.colors;

  const panelBg          = c.surface;
  const panelBorder      = `${c.primary[500]}40`;
  const dimText          = `${c.text}80`;
  const itemRowBg        = `${c.background}B0`;
  const selectedMethodBg = `${c.primary[500]}25`;
  const primaryColor     = c.primary[500];

  // Flat list of all items with order context
  const allItems = orders.flatMap(o =>
    (o.items ?? []).map((item, idx) => ({
      ...item,
      orderId: o._id.toString(),
      // Use orderId+index as unique display key (handles duplicate itemIds)
      key: `${o._id}:${idx}`,
      // itemId as string for the backend
      itemIdStr: item.itemId?.toString() ?? String(idx),
    }))
  );

  const unpaidItems = allItems.filter(i => !i.paid);
  const isAllSelected = unpaidItems.length > 0 && unpaidItems.every(i => selectedKeys.has(i.key));

  const selectedItems  = allItems.filter(i => selectedKeys.has(i.key) && !i.paid);
  const baseAmount     = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const payableTotal   = baseAmount + tip;
  const cashReceivedAmount = parseFloat(cashReceived) || 0;
  const change         = paymentMethod === 'cash' ? cashReceivedAmount - payableTotal : 0;
  const isPaymentValid = selectedItems.length > 0 &&
    (paymentMethod === 'cash' ? cashReceivedAmount >= payableTotal : true);

  const activeTipPct = [5, 10, 15].find(
    pct => baseAmount > 0 && Math.abs(tip - baseAmount * pct / 100) < 0.01
  );

  const handleTableSelect = async (table) => {
    if (selectedTable?._id === table._id) { handleClose(); return; }
    try {
      const res = await api.get(`/orders/payment/${table._id}`);
      setSelectedTable(table);
      setOrders(res.data);
      setSelectedKeys(new Set());
      setTip(0);
      setCustomTipInput('');
      setCashReceived('');
      setPaymentMethod('cash');
    } catch (err) {
      if (err.response?.status === 404) {
        toast({ title: t('noPendingOrders'), status: 'info', duration: 2000, isClosable: true });
      } else {
        toast({ title: t('errorTitle'), description: t('errorFetchingDataDescription'), status: 'error', duration: 3000, isClosable: true });
      }
    }
  };

  const handleClose = () => {
    setSelectedTable(null);
    setOrders([]);
    setSelectedKeys(new Set());
    setTip(0);
    setCustomTipInput('');
    setCashReceived('');
  };

  const toggleItem = (key) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setTip(0);
    setCustomTipInput('');
    setCashReceived('');
  };

  const selectAll = () => {
    setSelectedKeys(new Set(unpaidItems.map(i => i.key)));
    setTip(0);
    setCustomTipInput('');
    setCashReceived('');
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
    setTip(0);
    setCustomTipInput('');
    setCashReceived('');
  };

  const handleTipShortcut = (pct) => {
    setTip(parseFloat((baseAmount * pct / 100).toFixed(2)));
    setCustomTipInput('');
  };

  const handleCustomTip = (val) => {
    setCustomTipInput(val);
    setTip(parseFloat(val) || 0);
  };

  const handlePayment = async () => {
    if (!isPaymentValid) {
      toast({ title: t('errorTitle'), description: t('totalPaymentLessThanGrandTotal'), status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setIsSubmitting(true);
    const paymentPayload = [{
      method: paymentMethod,
      amount: paymentMethod === 'cash' ? cashReceivedAmount : payableTotal,
    }];

    try {
      if (isAllSelected) {
        // All unpaid items selected → full payment, closes table session
        await api.post(`/orders/payment/${selectedTable._id}`, {
          tip,
          paymentMethods: paymentPayload,
        });
        toast({ title: t('paymentCompletedTitle'), description: t('paymentFinalizedDescription'), status: 'success', duration: 3000, isClosable: true });
        handleClose();
        fetchTables();
      } else {
        // Partial payment — group selected items by orderId
        const byOrder = {};
        selectedItems.forEach(item => {
          if (!byOrder[item.orderId]) byOrder[item.orderId] = [];
          byOrder[item.orderId].push(item.itemIdStr);
        });

        for (const [orderId, itemsToPay] of Object.entries(byOrder)) {
          await api.post(`/orders/partial-payment/${orderId}`, {
            itemsToPay,
            tip: 0,
            paymentMethods: paymentPayload,
          });
        }

        toast({
          title: t('partialPaymentSuccess'),
          description: t('partialPaymentSuccessDesc').replace('{count}', selectedItems.length),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Refresh orders for this table; if none left, close panel and refresh table list
        try {
          const res = await api.get(`/orders/payment/${selectedTable._id}`);
          setOrders(res.data);
          setSelectedKeys(new Set());
          setTip(0);
          setCustomTipInput('');
          setCashReceived('');
        } catch (err) {
          if (err.response?.status === 404) {
            handleClose();
          }
        }
        fetchTables();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({ title: t('errorTitle'), description: t('errorFinalizingPaymentDescription'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4} h="100%">
      <Heading size="md" mb={5}>{t('cashierTitle')}</Heading>

      <Grid
        templateColumns={selectedTable ? { base: '1fr', lg: '1fr 380px' } : '1fr'}
        gap={6}
        alignItems="start"
      >
        {/* ── Table grid ── */}
        <Box>
          <Text fontSize="sm" color={dimText} mb={3}>{t('selectATable')}</Text>
          {tables.length === 0 ? (
            <Text color={dimText} mt={6} textAlign="center">{t('noTablesWithPendingOrders')}</Text>
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={3}>
              {tables.map(table => {
                const isSelected = selectedTable?._id === table._id;
                return (
                  <Box
                    key={table._id}
                    p={4}
                    borderWidth="2px"
                    borderRadius="xl"
                    cursor="pointer"
                    borderColor={isSelected ? primaryColor : 'green.400'}
                    bg={isSelected ? selectedMethodBg : 'transparent'}
                    color={c.text}
                    onClick={() => handleTableSelect(table)}
                    transition="all 0.15s"
                    textAlign="center"
                    _hover={{ borderColor: primaryColor, transform: 'translateY(-2px)', shadow: 'md' }}
                  >
                    <Text fontWeight="bold" fontSize="lg">{table.number}</Text>
                    <Badge mt={1} fontSize="2xs" colorScheme="green" borderRadius="full" px={2}>
                      {t('occupied')}
                    </Badge>
                  </Box>
                );
              })}
            </Grid>
          )}
        </Box>

        {/* ── Receipt panel ── */}
        {selectedTable && (
          <Box
            borderWidth="1px"
            borderColor={panelBorder}
            borderRadius="2xl"
            bg={panelBg}
            color={c.text}
            shadow="xl"
            overflow="hidden"
            position="sticky"
            top={4}
          >
            {/* Header */}
            <HStack px={5} py={4} borderBottomWidth="1px" borderColor={panelBorder} justify="space-between">
              <Text fontWeight="bold" fontSize="lg">
                {t('tableNumberLabel').replace('{number}', selectedTable.number)}
              </Text>
              <IconButton icon={<FaTimes />} size="sm" variant="ghost" onClick={handleClose} aria-label="close" />
            </HStack>

            {/* Items with checkboxes */}
            <Box px={5} pt={4} pb={2}>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="xs" color={dimText} textTransform="uppercase" letterSpacing="wider">
                  {selectedItems.length > 0
                    ? t('itemsSelected').replace('{count}', selectedItems.length)
                    : t('selectForPayment')}
                </Text>
                <HStack spacing={2}>
                  <Button size="xs" variant="ghost" onClick={selectAll} isDisabled={isAllSelected}>
                    {t('selectAll')}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={clearSelection} isDisabled={selectedKeys.size === 0}>
                    {t('clearSelection')}
                  </Button>
                </HStack>
              </HStack>

              <VStack spacing={1} align="stretch">
                {allItems.map((item) => (
                  <HStack
                    key={item.key}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    bg={selectedKeys.has(item.key) ? `${primaryColor}18` : itemRowBg}
                    opacity={item.paid ? 0.5 : 1}
                    transition="background 0.1s"
                  >
                    {item.paid ? (
                      <Badge colorScheme="blue" fontSize="2xs" flexShrink={0}>{t('paid')}</Badge>
                    ) : (
                      <Checkbox
                        isChecked={selectedKeys.has(item.key)}
                        onChange={() => toggleItem(item.key)}
                        colorScheme="teal"
                        flexShrink={0}
                      />
                    )}
                    <Text fontSize="sm" flex={1}>
                      {item.name}
                      <Text as="span" color={dimText}> × {item.quantity}</Text>
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Divider borderColor={panelBorder} opacity={1} my={1} />

            {/* Summary */}
            <VStack spacing={2} px={5} py={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color={dimText}>{t('subtotalLabel').replace(':', '')}</Text>
                <Text fontSize="sm">${baseAmount.toFixed(2)}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color={dimText}>{t('tipLabel').replace(':', '')}</Text>
                <Text fontSize="sm">${tip.toFixed(2)}</Text>
              </HStack>
              <Divider borderColor={panelBorder} opacity={1} />
              <HStack justify="space-between" mt={1}>
                <Text fontWeight="bold">{t('grandTotal')}</Text>
                <Text fontWeight="bold" fontSize="2xl">${payableTotal.toFixed(2)}</Text>
              </HStack>
            </VStack>

            <Divider borderColor={panelBorder} opacity={1} />

            {/* Tip shortcuts */}
            <VStack px={5} py={4} align="stretch" spacing={2}>
              <Text fontSize="xs" color={dimText} textTransform="uppercase" letterSpacing="wider">
                {t('tipLabel').replace(':', '')}
              </Text>
              <HStack spacing={2}>
                {[5, 10, 15].map(pct => (
                  <Button
                    key={pct}
                    size="sm"
                    flex={1}
                    variant={activeTipPct === pct ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => handleTipShortcut(pct)}
                    isDisabled={selectedItems.length === 0}
                  >
                    {pct}%
                  </Button>
                ))}
                <Input
                  size="sm"
                  flex={1}
                  type="number"
                  placeholder={t('customTipPlaceholder')}
                  value={customTipInput}
                  onChange={e => handleCustomTip(e.target.value)}
                  min={0}
                  isDisabled={selectedItems.length === 0}
                />
              </HStack>
            </VStack>

            <Divider borderColor={panelBorder} opacity={1} />

            {/* Payment method */}
            <VStack px={5} py={4} align="stretch" spacing={3}>
              <Text fontSize="xs" color={dimText} textTransform="uppercase" letterSpacing="wider">
                {t('paymentMethodsHeading')}
              </Text>
              <HStack spacing={4} justify="center">
                {PAYMENT_METHODS.map(({ key, Icon }) => {
                  const isActive = paymentMethod === key;
                  return (
                    <VStack
                      key={key}
                      spacing={1}
                      cursor="pointer"
                      onClick={() => { setPaymentMethod(key); setCashReceived(''); }}
                      opacity={isActive ? 1 : 0.45}
                      transition="all 0.15s"
                      _hover={{ opacity: 0.85 }}
                    >
                      <Box
                        p={3}
                        borderRadius="xl"
                        borderWidth="2px"
                        borderColor={isActive ? primaryColor : panelBorder}
                        bg={isActive ? selectedMethodBg : 'transparent'}
                        color={c.text}
                        transition="all 0.15s"
                      >
                        <Icon size={20} />
                      </Box>
                      <Text fontSize="xs" fontWeight={isActive ? 'semibold' : 'normal'} color={c.text}>
                        {t(`paymentMethod_${key}`)}
                      </Text>
                    </VStack>
                  );
                })}
              </HStack>

              {paymentMethod === 'cash' && (
                <VStack spacing={2} align="stretch">
                  <Input
                    size="sm"
                    type="number"
                    placeholder={t('cashReceivedLabel')}
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    min={0}
                    isDisabled={selectedItems.length === 0}
                  />
                  {change > 0 && (
                    <HStack justify="space-between" px={1}>
                      <Text fontSize="sm" color={dimText}>{t('changeToReturnHeading')}</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.400">
                        ${change.toFixed(2)}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              )}
            </VStack>

            {/* Pay button */}
            <Box px={5} pb={5}>
              <Button
                colorScheme="green"
                size="lg"
                w="full"
                onClick={handlePayment}
                isLoading={isSubmitting}
                isDisabled={!isPaymentValid}
              >
                {isAllSelected
                  ? t('finalizePaymentButton')
                  : `${t('paySelectedItems')} (${selectedItems.length})`}
              </Button>
            </Box>
          </Box>
        )}
      </Grid>
    </Box>
  );
}

export default CashierPage;
