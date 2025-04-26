import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Input, useDisclosure, Stack, Image,
  Select,
} from '@chakra-ui/react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
} from '@chakra-ui/react';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

function CashierPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [tip, setTip] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'cash', amount: 0 }]);
  const toast = useCustomToast();
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
        title: "Error",
        description: "Total payment is less than the grand total.",
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
        title: "Payment Completed",
        description: "Payment for the table has been finalized.",
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
        title: "Error",
        description: "Error finalizing payment.",
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
        <Text fontSize="2xl" mb={4}>Select a Table</Text>
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
                <Text color={'black'} fontSize="lg" fontWeight="bold">Table {table.number}</Text>
                {table.orders && table.orders.length > 0 ? (
                  <>
                    <Text>Total Orders: {table.orders.length}</Text>
                    <Text>Total Amount: ${table.orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</Text>
                  </>
                ) : (
                  <Text>No pending orders</Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={10}>
            <Image
              src="/images/empty-state.png"
              alt="No orders"
              boxSize="150px"
              margin="auto"
            />
            <Text fontSize="lg" mt={4}>No tables with pending orders</Text>
          </Box>
        )}

        {/* Orders Section */}
        {orders.length > 0 && (
          <VStack spacing={4} align="stretch" mt={6}>
            <Text fontSize="lg" fontWeight="bold">Orders for Table {selectedTable}</Text>
            {orders.map((order) => (
              <Box key={order._id} p={4} borderWidth="1px" borderRadius="md" width="full">
                <Text fontSize="lg" fontWeight="bold">Order #{order._id}</Text>
                {/* Order details, similar to your existing layout */}
              </Box>
            ))}

            <HStack justifyContent="space-between">
              <Text fontSize="lg">Subtotal:</Text>
              <Text fontSize="lg">${total.toFixed(2)}</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="lg">Tip:</Text>
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
              <Button colorScheme="blue" onClick={() => handleTipShortcut(5)}>Add 5% Tip</Button>
              <Button colorScheme="blue" onClick={() => handleTipShortcut(10)}>Add 10% Tip</Button>
              <Button colorScheme="blue" onClick={() => handleTipShortcut(15)}>Add 15% Tip</Button>
            </HStack>

            {/* Payment Methods */}
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Payment Methods</Text>
              {paymentMethods.map((method, index) => (
                <HStack key={index} spacing={4}>
                  <Select
                    value={method.method}
                    onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value)}
                    bg="white"
                    color="black"
                    width="150px"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={method.amount}
                    onChange={(e) =>
                      handlePaymentMethodChange(index, 'amount', parseFloat(e.target.value) || 0)
                    }
                    width="150px"
                    bg="white"
                    color="black"
                  />
                  {paymentMethods.length > 1 && (
                    <Button colorScheme="red" onClick={() => handleRemovePaymentMethod(index)}>Remove</Button>
                  )}
                </HStack>
              ))}
              <Button colorScheme="blue" onClick={handleAddPaymentMethod}>Add Payment Method</Button>
            </VStack>

            {change > 0 && (
              <Text color="green.500" fontSize="lg">
                Change to return: ${change.toFixed(2)}
              </Text>
            )}

            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">Grand Total (with tip):</Text>
              <Text fontSize="lg" fontWeight="bold">${grandTotal.toFixed(2)}</Text>
            </HStack>

            <Button colorScheme="green" onClick={onOpen}>
              Finalize Payment
            </Button>

            {/* Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader color="black">Confirm Payment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text color="black">Please confirm the following payments:</Text>
                  {paymentMethods.map((method, index) => (
                    <HStack key={index} justifyContent="space-between" mt={4}>
                      <Text color="black">{method.method.toUpperCase()}</Text>
                      <Text color="black">
                        ${parseFloat(method.amount).toFixed(2)}
                      </Text>
                    </HStack>
                  ))}
                  <HStack justifyContent="space-between" mt={4}>
                    <Text color="black" fontWeight="bold">Total Payment</Text>
                    <Text color="black" fontWeight="bold">
                      ${totalPayment.toFixed(2)}
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between" mt={4}>
                    <Text color="black" fontWeight="bold">Grand Total</Text>
                    <Text color="black" fontWeight="bold">
                      ${grandTotal.toFixed(2)}
                    </Text>
                  </HStack>
                  {change > 0 && (
                    <HStack justifyContent="space-between" mt={4}>
                      <Text color="black" fontWeight="bold">Change to Return</Text>
                      <Text color="black" fontWeight="bold">
                        ${change.toFixed(2)}
                      </Text>
                    </HStack>
                  )}
                </ModalBody>

                <ModalFooter>
                  <Button colorScheme="green" onClick={handleFinalizePayment}>
                    Confirm Payment
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
