import React, { useState, useEffect } from 'react';
import { Box, Select, VStack, HStack, Button } from '@chakra-ui/react';
import DailySummary from '../components/DailySummary';
import PopularItems from '../components/PopularItems';
import api from '../services/api';

function AnalyticsPage() {
  const [area, setArea] = useState('');
  const [waiter, setWaiter] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [waiters, setWaiters] = useState([]);

  useEffect(() => {
    // Fetch waiters to populate dropdown
    const fetchWaiters = async () => {
      try {
        const response = await api.get('/waiters'); // Assuming there is an endpoint to get waiters
        setWaiters(response.data);
      } catch (error) {
        console.error('Error fetching waiters:', error);
      }
    };

    fetchWaiters();
  }, []);

  return (
    <Box p={4}>
      <HStack spacing={4}>
        <Select placeholder="Select Area" onChange={(e) => setArea(e.target.value)}>
          <option value="kitchen">Kitchen</option>
          <option value="bar">Bar</option>
        </Select>
        <Select placeholder="Select Waiter" onChange={(e) => setWaiter(e.target.value)}>
          {waiters?.map(waiter => (
            <option key={waiter._id} value={waiter._id}>{waiter.name}</option>
          ))}
        </Select>
        <Select placeholder="Select Payment Method" onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </Select>
        <Button onClick={() => { /* Implement filter logic */ }}>Filter</Button>
      </HStack>
      <DailySummary area={area} waiter={waiter} paymentMethod={paymentMethod} />
      <PopularItems area={area} waiter={waiter} />
    </Box>
  );
}

export default AnalyticsPage;
