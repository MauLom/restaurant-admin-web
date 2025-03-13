import React, { useState, useEffect } from 'react';
import { Box, Text, HStack, Input, VStack, Divider } from '@chakra-ui/react';
import dayjs from 'dayjs'; // Import dayjs to handle dates
import api from '../../../services/api';

function AnalyticsPage() {
  // Set the initial default date range to the last 24 hours
  const initialStartDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const initialEndDate = dayjs().format('YYYY-MM-DD');

  const [salesData, setSalesData] = useState({ totalRevenue: 0, totalTips: 0, grandTotal: 0 });
  const [waiterTips, setWaiterTips] = useState({});
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

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
        // setPopularItems(response.data.popularItems);
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
      } catch (error) {
        console.error('Error fetching waiter tips:', error);
      }
    };

    fetchWaiterTips();
  }, [startDate, endDate]);

  return (
    <Box color={"black"} p={6} maxW="container.lg" mx="auto" bg="gray.50" borderRadius="lg" boxShadow="lg">
      <VStack spacing={6} align="stretch">
        {/* Date Range Selectors */}
        <HStack spacing={4} justify="space-between" width="100%">
          <Box>
            <Text fontWeight="bold" mb={1}>Start Date</Text>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              bg="white"
            />
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>End Date</Text>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              bg="white"
            />
          </Box>
        </HStack>

        <Divider />

        {/* Sales Summary */}
        <Box p={4} bg="white" borderRadius="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>Sales Summary</Text>
          <VStack spacing={2} align="start">
            <Text fontSize="lg"><strong>Total Revenue:</strong> ${salesData.totalRevenue}</Text>
            <Text fontSize="lg"><strong>Total Tips:</strong> ${salesData.totalTips}</Text>
            <Text fontSize="lg"><strong>Grand Total:</strong> ${salesData.grandTotal}</Text>
          </VStack>
        </Box>

        <Divider />

        {/* Waiter Tips */}
        <Box p={4} bg="white" borderRadius="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>Waiter Tips</Text>
          <VStack spacing={2} align="start">
            {Object.entries(waiterTips).length > 0 ? (
              Object.entries(waiterTips).map(([waiter, tips], index) => (
                <Text key={index}><strong>{waiter}:</strong> ${tips}</Text>
              ))
            ) : (
              <Text>No tips available for this period.</Text>
            )}
          </VStack>
        </Box>

        {/* Uncomment this if you want to display popular items */}
        {/* <Box p={4} bg="white" borderRadius="md" shadow="md">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>Popular Items</Text>
          <VStack spacing={2} align="start">
            {popularItems.length > 0 ? (
              popularItems.map((item, index) => (
                <Text key={index}>{item.name} - {item.quantity} ordered</Text>
              ))
            ) : (
              <Text>No popular items for this period.</Text>
            )}
          </VStack>
        </Box> */}
      </VStack>
    </Box>
  );
}

export default AnalyticsPage;
