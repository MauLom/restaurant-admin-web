import React, { useState, useEffect } from 'react';
import { Box,  Text, HStack, Input } from '@chakra-ui/react';
import api from '../services/api';

function AnalyticsPage() {
  const [salesData, setSalesData] = useState({ totalRevenue: 0, totalTips: 0, grandTotal: 0 });
  const [popularItems, setPopularItems] = useState([]);
  const [waiterTips, setWaiterTips] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Fetch sales summary
    const fetchSalesSummary = async () => {
      try {
        const response = await api.get(`/analytics/sales-summary?startDate=${startDate}&endDate=${endDate}`);
        setSalesData(response.data);
      } catch (error) {
        console.error('Error fetching sales summary:', error);
      }
    };

    fetchSalesSummary();
  }, [startDate, endDate]);

  useEffect(() => {
    // Fetch popular items
    const fetchPopularItems = async () => {
      try {
        const response = await api.get(`/analytics/popular-items?startDate=${startDate}&endDate=${endDate}`);
        // console.log("response.data.popularItems", response.data.popularItems)
        setPopularItems(response.data.popularItems);
      } catch (error) {
        console.error('Error fetching popular items:', error);
      }
    };

    fetchPopularItems();
  }, [startDate, endDate]);

  useEffect(() => {
    // Fetch waiter tips
    const fetchWaiterTips = async () => {
      try {
        const response = await api.get(`/analytics/waiter-tips?startDate=${startDate}&endDate=${endDate}`);
        setWaiterTips(response.data);
        console.log("response.data", response.data)
      } catch (error) {
        console.error('Error fetching waiter tips:', error);
      }
    };

    fetchWaiterTips();
  }, [startDate, endDate]);

  return (
    <Box p={4}>
      <HStack spacing={4}>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </HStack>
      <Box mt={4}>
        <Text fontSize="2xl">Sales Summary</Text>
        <Text>Total Revenue: ${salesData.totalRevenue}</Text>
        <Text>Total Tips: ${salesData.totalTips}</Text>
        <Text>Grand Total: ${salesData.grandTotal}</Text>
      </Box>
      {/* <Box mt={4}>
        <Text fontSize="2xl">Popular Items</Text>
        {popularItems.map((item, index) => (
          <Text key={index}>{item.name} - {item.quantity} ordered</Text>
        ))}
      </Box> */}
      <Box mt={4}>
        <Text fontSize="2xl">Waiter Tips</Text>
        {Object.entries(waiterTips).map(([waiter, tips], index) => (
          <Text key={index}>{waiter}: ${tips}</Text>
        ))}
      </Box>
    </Box>
  );
}

export default AnalyticsPage;
