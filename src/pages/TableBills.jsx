import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Select, Input, Button, Text, HStack } from '@chakra-ui/react';
import axios from 'axios';

const TableBills = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [orders, setOrders] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [prices, setPrices] = useState({});
  const [tip, setTip] = useState(0);
  const [filterHours, setFilterHours] = useState(5); // Default to 5 hours
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch users who have placed orders within the specified time range
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/filtered-orders?hours=${filterHours}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [API_URL, filterHours]);

  const fetchOrders = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/telegram-orders?userId=${userId}&status=Delivered&hours=${filterHours}`);
      setOrders(response.data);
      groupItems(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const groupItems = (orders) => {
    const grouped = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const key = item.item.toLowerCase();
        if (acc[key]) {
          acc[key].quantity += item.quantity;
        } else {
          acc[key] = { ...item };
        }
      });
      return acc;
    }, {});
    setGroupedItems(grouped);
  };

  const calculateSubtotal = () => {
    return Object.keys(groupedItems).reduce((acc, key) => {
      const item = groupedItems[key];
      const price = prices[key] || 0;
      return acc + (item.quantity * price);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + parseFloat(tip);
  };

  const applyTipPercentage = (percentage) => {
    const subtotal = calculateSubtotal();
    const calculatedTip = (subtotal * percentage).toFixed(2);
    setTip(parseFloat(calculatedTip));
  };

  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>Table Bill Checkout</Heading>
      
      <HStack spacing={4} mb={4}>
        <Button onClick={() => setFilterHours(5)} colorScheme={filterHours === 5 ? 'teal' : 'gray'}>Last 5 Hours</Button>
        <Button onClick={() => setFilterHours(10)} colorScheme={filterHours === 10 ? 'teal' : 'gray'}>Last 10 Hours</Button>
        <Button onClick={() => setFilterHours(24)} colorScheme={filterHours === 24 ? 'teal' : 'gray'}>Last 24 Hours</Button>
      </HStack>

      <Select placeholder="Select User" onChange={(e) => {
        setSelectedUser(e.target.value);
        fetchOrders(e.target.value);
      }}>
        {users.map(user => (
          <option key={user.userId} value={user.userId}>{user.user}</option>
        ))}
      </Select>
      
      <Box mt={4}>
        <Heading as="h2" size="lg" mb={4}>Items Ordered</Heading>
        <SimpleGrid columns={2} spacing={4}>
          {Object.keys(groupedItems).map(key => (
            <Box key={key} p={4} borderWidth="1px" borderRadius="lg">
              <Text fontWeight="bold">{groupedItems[key].quantity} x {groupedItems[key].item}</Text>
              <Input 
                placeholder="Set Price"
                onChange={(e) => setPrices(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box mt={4}>
        <Heading as="h2" size="lg" mb={4}>Tip</Heading>
        <HStack spacing={4} mb={4}>
          <Button onClick={() => applyTipPercentage(0.05)} colorScheme="teal">5%</Button>
          <Button onClick={() => applyTipPercentage(0.10)} colorScheme="teal">10%</Button>
          <Button onClick={() => applyTipPercentage(0.15)} colorScheme="teal">15%</Button>
        </HStack>
        <Input 
          placeholder="Enter Tip Amount"
          value={tip}
          onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
        />
      </Box>

      <Box mt={4}>
        <Heading as="h2" size="lg" mb={4}>Total</Heading>
        <Text fontSize="2xl" fontWeight="bold">{`$${calculateTotal().toFixed(2)}`}</Text>
        <Button mt={4} colorScheme="teal">Finalize Bill</Button>
      </Box>
    </Box>
  );
};

export default TableBills;
