import React, { useState, useEffect } from 'react';
import { Box, Select, VStack, HStack, Text, Button, Input, useToast, useDisclosure } from '@chakra-ui/react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react';
import api from '../services/api';

function CashierPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [tip, setTip] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([{ method: 'cash', amount: 0 }]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get('/sections'); // Fetching sections and tables
        setTables(response.data.flatMap(section => section.tables));
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

  // Handle the price change for order items
  const handleCostChange = (orderId, itemIndex, newPrice) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order._id === orderId) {
          const updatedItems = [...order.items];
          updatedItems[itemIndex].price = newPrice;
          return { ...order, items: updatedItems };
        }
        return order;
      })
    );
  };

  const calculateGrandTotal = () => {
    return total + tip;
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
    const totalPayment = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
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
      const response = await api.post(`/orders/payment/${selectedTable}`, {
        tip,
        paymentMethods,
      });

      toast({
        title: "Payment Completed",
        description: `Payment for the table has been finalized. Total: $${response.data.grandTotal}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setOrders([]);
      setTotal(0);
      setTip(0);
      setSelectedTable('');
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

  return (
    <Box p={4}>
      <Select placeholder="Select Table" onChange={(e) => handleTableSelect(e.target.value)} bg="white" color="black">
        {tables.map(table => (
          <option key={table._id} value={table._id}>
            Table {table.number}
          </option>
        ))}
      </Select>

      <VStack spacing={4} mt={4}>
        {orders.map(order => (
          <Box key={order._id} p={4} borderWidth="1px" borderRadius="md" width="full">
            <Text fontSize="lg">Order #{order._id}</Text>
            <VStack spacing={2} mt={2}>
              {order.items.map((item, index) => (
                <HStack key={index} justifyContent="space-between" width="full">
                  <Text>{item.name} (x{item.quantity})</Text>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleCostChange(order._id, index, parseFloat(e.target.value))}
                    width="100px"
                  />
                  <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ))}

        <HStack justifyContent="space-between" width="full" mt={4}>
          <Text>Total: ${total.toFixed(2)}</Text>
          <Text>Tip:</Text>
          <Input
            type="number"
            value={tip}
            onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
            width="100px"
            bg="white" color="black"
          />
        </HStack>

        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => handleTipShortcut(5)}>+5% Tip</Button>
          <Button colorScheme="blue" onClick={() => handleTipShortcut(10)}>+10% Tip</Button>
          <Button colorScheme="blue" onClick={() => handleTipShortcut(15)}>+15% Tip</Button>
        </HStack>

        {/* Payment Methods */}
        <VStack spacing={4} mt={4}>
          <Text fontSize="lg">Payment Methods</Text>
          {paymentMethods.map((method, index) => (
            <HStack key={index} width="full">
              <Select
                value={method.method}
                onChange={(e) => handlePaymentMethodChange(index, 'method', e.target.value)}
                bg="white" color="black"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={method.amount}
                onChange={(e) => handlePaymentMethodChange(index, 'amount', parseFloat(e.target.value))}
                width="150px"
                bg="white" color="black"
              />
              {paymentMethods.length > 1 && (
                <Button colorScheme="red" onClick={() => handleRemovePaymentMethod(index)}>Remove</Button>
              )}
            </HStack>
          ))}
          <Button colorScheme="blue" onClick={handleAddPaymentMethod}>Add Payment Method</Button>
        </VStack>

        <HStack justifyContent="space-between" width="full" mt={4}>
          <Text>Grand Total (with tip): ${calculateGrandTotal().toFixed(2)}</Text>
        </HStack>

        <Button colorScheme="green" mt={4} onClick={onOpen}>
          Finalize Payment
        </Button>

        {/* Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent >
            <ModalHeader color={"black"}>Confirm Payment</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text color={"black"}>Please confirm the following payments:</Text>
              {paymentMethods.map((method, index) => (
                <HStack key={index} justifyContent="space-between" mt={4}>
                  <Text color={"black"}>{method.method.toUpperCase()}</Text>
                  <Text color={"black"}>${method.amount.toFixed(2)}</Text>
                </HStack>
              ))}
              <HStack justifyContent="space-between" mt={4}>
                <Text color={"black"}>Total</Text>
                <Text color={"black"}>${calculateGrandTotal().toFixed(2)}</Text>
              </HStack>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="green" onClick={handleFinalizePayment}>
                Confirm Payment
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}

export default CashierPage;
