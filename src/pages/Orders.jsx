import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Box, Heading, Flex, Spacer, Button, SimpleGrid, useDisclosure
} from '@chakra-ui/react';
import Breadcrumbs from '../components/Breadcrumbs';
import axios from 'axios';
import OrderCard from '../components/OrderCard';
import OrderModal from '../components/OrderModal';
import { UserContext } from '../context/UserContext';
import io from 'socket.io-client';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const socketRef = useRef(null);

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Orders', path: '/orders' },
  ];

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io('http://localhost:5000');

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchOrders();
    fetchItems();

    socketRef.current.on('orderCreated', (order) => {
      setOrders((prevOrders) => [...prevOrders, order]);
    });

    socketRef.current.on('orderUpdated', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socketRef.current.disconnect();
    };
  }, [API_URL]);

  const handleSaveOrder = async (newOrder) => {
    try {
      const response = await axios.post(`${API_URL}/orders/create`, newOrder);
      setOrders([...orders, response.data]);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const handleProcessOrder = async (orderId, paymentMethod) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    try {
      await axios.put(`${API_URL}/orders/update/${orderId}`, { 
        status: 'Processed',
        paymentMethod: paymentMethod 
      });

      await Promise.all(order.items.map(async item => {
        const inventoryItem = items.find(i => i._id === item.itemId);
        if (inventoryItem) {
          const newQuantity = inventoryItem.quantity - item.quantity;
          await axios.put(`${API_URL}/inventory/update/${item.itemId}`, { quantity: newQuantity });
        }
      }));

      setOrders(orders.map(o => (o._id === orderId ? { ...o, status: 'Processed', paymentMethod: paymentMethod } : o)));
      setItems(items.map(i => {
        const orderedItem = order.items.find(item => item.itemId === i._id);
        if (orderedItem) {
          return { ...i, quantity: i.quantity - orderedItem.quantity };
        }
        return i;
      }));
    } catch (error) {
      console.error('Error processing order:', error);
    }
  };

  const handleCardClick = (order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`${API_URL}/orders/update/${selectedOrder._id}`, selectedOrder);
      setOrders(orders.map(o => (o._id === selectedOrder._id ? selectedOrder : o)));
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'Pending');

  return (
    <Box>
      <Breadcrumbs items={breadcrumbItems} />
      <Flex mt={4} mb={4} align="center">
        <Heading>Gestion de ordenes</Heading>
        <Spacer />
        <Button colorScheme="teal" onClick={() => { setSelectedOrder(null); onOpen(); }}>Crear Orden</Button>
      </Flex>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {pendingOrders.map(order => (
          <OrderCard
            key={order._id}
            order={order}
            onProcess={handleProcessOrder}
            onClick={handleCardClick}
          />
        ))}
      </SimpleGrid>

      <OrderModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={selectedOrder ? handleSaveChanges : handleSaveOrder}
        items={items}
        order={selectedOrder}
        user={user}
      />
    </Box>
  );
};

export default Orders;
