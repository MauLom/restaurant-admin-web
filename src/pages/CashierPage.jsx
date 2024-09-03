import React, { useState, useEffect } from 'react';
import { Box, Select, VStack, HStack, Text, Button, Input } from '@chakra-ui/react';
import api from '../services/api';

function CashierPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get('/sections'); // Assuming this endpoint returns sections and tables
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

  const handleFinalizePayment = async () => {
    try {
      const response = await api.post(`/orders/payment/${selectedTable}`, { tip });
      alert(`Payment completed. Total: ${response.data.grandTotal}`);
      setOrders([]);
      setTotal(0);
      setTip(0);
      setSelectedTable('');
    } catch (error) {
      console.error('Error finalizing payment:', error);
    }
  };

  return (
    <Box p={4}>
      <Select placeholder="Select Table" onChange={(e) => handleTableSelect(e.target.value)}>
        {tables.map(table => (
          <option key={table._id} value={table._id}>
            Table {table.number}
          </option>
        ))}
      </Select>

      <VStack spacing={4} mt={4}>
        {orders.map(order => (
          <Box key={order._id} p={4} borderWidth="1px" borderRadius="md" width="full">
            <Text>Order #{order._id}</Text>
            <VStack spacing={2} mt={2}>
              {order.items.map((item, index) => (
                <HStack key={index} justifyContent="space-between" width="full">
                  <Text>{item.name} (x{item.quantity})</Text>
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
          />
        </HStack>
        <Button colorScheme="green" onClick={handleFinalizePayment}>
          Finalize Payment
        </Button>
      </VStack>
    </Box>
  );
}

export default CashierPage;
