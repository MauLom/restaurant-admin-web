import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Input, useDisclosure, Stack, Image,
  Select, useTheme,
} from '@chakra-ui/react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
} from '@chakra-ui/react';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { useLanguage } from '../../../context/LanguageContext';
import OrderCard from '../../orders/components/OrderCard';

function CashierPage() {
  const { t } = useLanguage();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [tip, setTip] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'cash', amount: 0 }]);
  const toast = useCustomToast();
  const theme = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get('/sections'); // Fetching sections and tables
        const fetchedTables = response.data.flatMap(section => section.tables);
        setTables(fetchedTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, []);

  const handleTableSelect = async (tableId) => {
    setSelectedTable(tableId);
    try {
      const response = await api.get(`/orders/payment/${tableId}`);
      setOrders(response.data);
      const totalAmount = response.data.reduce((sum, order) => sum + order.total, 0);
      setTotal(totalAmount);
    } catch (error) {
      console.error('Error fetching orders for payment:', error);
      setOrders([]);
      setTotal(0);
    }
  };

  // Handle tip percentage shortcut
  const handleTipShortcut = (percentage) => {
    setTip(total * (percentage / 100));
  };

  const calculateGrandTotal = () => {
    return total + tip;
  };

  const calculateTotalPayment = () => {
    return paymentMethods.reduce((sum, method) => sum + (parseFloat(method.amount) || 0), 0);
  };

  const calculateTotalCashPayment = () => {
    return paymentMethods
      .filter(method => method.method === 'cash')
      .reduce((sum, method) => sum + (parseFloat(method.amount) || 0), 0);
  };

  const handlePaymentMethodChange = (index, field, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index][field] = value;
    setPaymentMethods(newMethods);
  };

  const handleAddPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { method: 'card', amount: 0 }]);
  };

  const handleRemovePaymentMethod = (index) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
  };

  const isPaymentValid = () => {
    const totalPayment = calculateTotalPayment();
    return totalPayment >= calculateGrandTotal();
  };

  const handleFinalizePayment = async () => {
    if (!isPaymentValid()) {
      toast({
        title: t('errorTitle'),
        description: t('totalPaymentLessThanGrandTotal'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await api.post(`/orders/payment/${selectedTable}`, {
        tip,
        paymentMethods,
      });

      toast({
        title: t('paymentCompletedTitle'),
        description: t('paymentFinalizedDescription'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setOrders([]);
      setTotal(0);
      setTip(0);
      setSelectedTable(null);
      setPaymentMethods([{ method: 'cash', amount: 0 }]); // Reset payment methods
      onClose();
    } catch (error) {
      console.error('Error finalizing payment:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorFinalizingPaymentDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const grandTotal = calculateGrandTotal();
  const totalPayment = calculateTotalPayment();
  const totalCashPayment = calculateTotalCashPayment();
  const change = totalCashPayment - grandTotal;

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        {/* Table Order Summaries */}
        <Text fontSize="2xl" mb={4}>{t('selectATable')}</Text>
        {tables.length > 0 ? (
          <Stack direction="row" wrap="wrap" spacing={4}>
            {tables.map((table) => (
              <Box
                key={table._id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                boxShadow="lg"
                cursor="pointer"
                bg={selectedTable === table._id ? 'blue.50' : 'white'}
                onClick={() => handleTableSelect(table._id)}
              >
                <Text color={'black'} fontSize="lg" fontWeight="bold">{t('tableNumberLabel').replace('{number}', table.number)}</Text>
                {table.orders && table.orders.length > 0 ? (
                  <>
                    <Text color="black">Total Orders: {table.orders.length}</Text>
                    <Text color="black">Total Amount: ${table.orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</Text>
                  </>
                ) : (
                  <Text color="black">{t('noPendingOrders')}</Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={10}>
            <Image
              src="/images/empty-state.png"
              alt={t('noOrdersImageAlt')}
              boxSize="150px"
              margin="auto"
            />
            <Text fontSize="lg" mt={4}>{t('noTablesWithPendingOrders')}</Text>
          </Box>
        )}

        {/* Orders Section */}
        {orders.length > 0 && (
          <VStack spacing={4} align="stretch" mt={6}>
            <Text fontSize="lg" fontWeight="bold">{t('ordersForTable').replace('{table}', selectedTable)}</Text>
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                allowPayment
                onPaid={() => handleTableSelect(selectedTable)}
              />
            ))}

            <HStack justifyContent="space-between">
              <Text fontSize="lg">{t('subtotalLabel')}</Text>
              <Text fontSize="lg">${total.toFixed(2)}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="lg">{t('tipLabel')}</Text>
              <Input
                type="number"
                value={tip}
                onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                width="100px"
                bg="white"
                color="black"
              />
            </HStack>
            <HStack spacing={4}>
              <Button colorScheme="blue" onClick={() => handleTipShortcut(5)}>{t('add5PercentTip')}</Button>
              <Button colorScheme="blue" onClick={() => handleTipShortcut(10)}>{t('add10PercentTip')}</Button>
              <Button colorScheme="blue" onClick={() => handleTipShortcut(15)}>{t('add15PercentTip')}</Button>
            </HStack>

            {/* Payment Methods */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">{t('paymentMethodsHeading')}</Text>
              {paymentMethods.map((method, index) => (
                <HStack key={index} spacing={4}>
                  <Select
                    value={method.method}
                    onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value)}
                    width="150px"
                  >
                    <option value="cash" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Cash</option>
                    <option value="card" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>Card</option>
                  </Select>
                  <Input
                    type="number"
                    placeholder={t('amountPlaceholder')}
                    value={method.amount}
                    onChange={(e) =>
                      handlePaymentMethodChange(index, 'amount', parseFloat(e.target.value) || 0)
                    }
                    width="150px"
                    bg="white"
                    color="black"
                  />
                  {paymentMethods.length > 1 && (
                    <Button colorScheme="red" onClick={() => handleRemovePaymentMethod(index)}>{t('remove')}</Button>
                  )}
                </HStack>
              ))}
              <Button colorScheme="blue" onClick={handleAddPaymentMethod}>{t('addPaymentMethodButton')}</Button>
            </VStack>

            {change > 0 && (
              <Text color="green.500" fontSize="lg">
                {t('changeToReturnLabel').replace('{amount}', change.toFixed(2))}
              </Text>
            )}

            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">{t('grandTotalWithTipLabel')}</Text>
              <Text fontSize="lg" fontWeight="bold">${grandTotal.toFixed(2)}</Text>
            </HStack>

            <Button colorScheme="green" onClick={onOpen}>
              {t('finalizePaymentButton')}
            </Button>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent bg="white">
                <ModalHeader color="black">{t('confirmPayment')}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text color="black">{t('confirmFollowingPayments')}</Text>
                  {paymentMethods.map((method, index) => (
                    <HStack key={index} justifyContent="space-between" mt={4}>
                      <Text color="black">{method.method.toUpperCase()}</Text>
                      <Text color="black">
                        ${parseFloat(method.amount).toFixed(2)}
                      </Text>
                    </HStack>
                  ))}
                  <HStack justifyContent="space-between" mt={4}>
                    <Text color="black" fontWeight="bold">{t('totalPaymentLabel')}</Text>
                    <Text color="black" fontWeight="bold">
                      ${totalPayment.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between" mt={4}>
                    <Text color="black" fontWeight="bold">{t('grandTotal')}</Text>
                    <Text color="black" fontWeight="bold">
                      ${grandTotal.toFixed(2)}
                    </Text>
                  </HStack>
                  {change > 0 && (
                    <HStack justifyContent="space-between" mt={4}>
                      <Text color="black" fontWeight="bold">{t('changeToReturnHeading')}</Text>
                      <Text color="black" fontWeight="bold">
                        ${change.toFixed(2)}
                      </Text>
                    </HStack>
                  )}
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="green" onClick={handleFinalizePayment}>
                    {t('confirmPayment')}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default CashierPage;
