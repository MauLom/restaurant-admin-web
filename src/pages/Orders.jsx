import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Box, Heading, Flex, Spacer, SimpleGrid, Button, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter,
  AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
} from '@chakra-ui/react';
import Breadcrumbs from '../components/Breadcrumbs';
import axios from 'axios';
import OrderCard from '../components/OrderCard';
import OrderModal from '../components/OrderModal'; // New modal for adding new items
import { UserContext } from '../context/UserContext';
import io from 'socket.io-client';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [readyForDeliveryOrders, setReadyForDeliveryOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState(null); // Track the action type
  const { user } = useContext(UserContext);
  const socketRef = useRef(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure(); // Modal for adding new items
  const cancelRef = useRef();

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Orders', path: '/orders' },
  ];

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    socketRef.current = io(API_URL.replace("/api", ""));

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders`);
        const fetchedOrders = response.data;
        sortOrdersByStatus(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();

    socketRef.current.on('orderCreated', (order) => {
      handleNewOrder(order);
    });

    socketRef.current.on('orderUpdated', (updatedOrder) => {
      handleUpdatedOrder(updatedOrder);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [API_URL]);

  const sortOrdersByStatus = (ordersList) => {
    setPendingOrders(ordersList.filter(order => order.status === 'In Preparation'));
    setReadyForDeliveryOrders(ordersList.filter(order => order.status === 'Ready for Delivery'));
    setDeliveredOrders(ordersList.filter(order => order.status === 'Delivered' || order.status === 'Updated'));
  };

  const handleNewOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
    if (order.status === 'In Preparation') {
      setPendingOrders((prev) => [...prev, order]);
    }
  };

  const handleUpdatedOrder = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    sortOrdersByStatus([...orders.map(order =>
      order._id === updatedOrder._id ? updatedOrder : order)]);
  };

  // Function to handle updating order status
  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/orders/status/${orderId}`, { status });
      const response = await axios.get(`${API_URL}/orders`);
      sortOrdersByStatus(response.data); // Update the orders in state
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Handle adding new items to a delivered order
  const handleAddNewItems = async (order) => {
    // Fetch the menu items to display in the modal for selection
    const menuItemsResponse = await axios.get(`${API_URL}/menu`);
    const menuItems = menuItemsResponse.data;

    setSelectedOrder({ ...order, menuItems });
    onOpenModal(); // Open modal to add new items
  };

  // Function to save new items and update the order
  const handleSaveNewItems = async (newItems) => {
    try {
      await axios.put(`${API_URL}/orders/update/${selectedOrder._id}`, {
        items: newItems,
        status: 'Updated', // Mark order as updated so kitchen sees only the new items
      });
      onCloseModal(); // Close modal after saving
      const response = await axios.get(`${API_URL}/orders`);
      sortOrdersByStatus(response.data);
    } catch (error) {
      console.error('Error adding new items to order:', error);
    }
  };

  // Open the modal and set the action type
  const openModal = (order, actionType) => {
    setSelectedOrder(order);
    setActionType(actionType);
    onOpen();
  };

  // Handle confirmation of the action in the modal
  const handleConfirmAction = () => {
    if (actionType === 'Ready for Delivery') {
      handleUpdateStatus(selectedOrder._id, 'Ready for Delivery');
    } else if (actionType === 'Delivered') {
      handleUpdateStatus(selectedOrder._id, 'Delivered');
    }
    onClose();
  };

  return (
    <Box>
      <Flex as="nav" bg="gray.100" p={4} borderBottom="1px solid #e2e2e2">
        <Breadcrumbs items={breadcrumbItems} />
      </Flex>
      <Flex mt={4} mb={4} align="center" p={4}>
        <Heading as="h1" size="xl" mb={2}>Ordenes en preparacion</Heading>
        <Spacer />
      </Flex>

      {/* Pending Orders for the Kitchen */}
      <Heading as="h2" size="lg" mb={4}>Odenes pendientes</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {pendingOrders.map(order => (
          <OrderCard
            key={order._id}
            order={order}
            onUpdateStatus={() => openModal(order, 'Ready for Delivery')}  // Open modal for ready for delivery
          />
        ))}
      </SimpleGrid>

      {/* Orders Ready for Delivery */}
      <Heading as="h2" size="lg" mt={8} mb={4}>Listas para entregar</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {readyForDeliveryOrders.map(order => (
          <OrderCard
            key={order._id}
            order={order}
            onUpdateStatus={() => openModal(order, 'Delivered')}  // Open modal for delivered
          />
        ))}
      </SimpleGrid>

      <Flex mt={4} mb={4} align="center" p={4}>
        <Heading as="h1" size="xl" mb={2}>Ordenes entregadas</Heading>
        <Spacer />
      </Flex>
      <Heading as="h2" size="lg" mt={8} mb={4}>Ordenes entregadas</Heading>
      <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
        {deliveredOrders.map(order => (
          <OrderCard
            key={order._id}
            order={order}
            onClick={() => handleAddNewItems(order)}  // Open modal for adding new items
            onUpdateStatus={handleUpdateStatus}  // This function is for updating the order status
          />
        ))}
      </SimpleGrid>

      {/* Confirmation Modal */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {actionType === 'Ready for Delivery' ? 'Move Order to Ready for Delivery' : 'Move Order to Delivered'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {actionType === 'Ready for Delivery'
                ? 'Confirmas mover esta orden a "Lista para entregar"?'
                : 'Confirmas marcar esta orden como "Entregada"?'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme={actionType === 'Ready for Delivery' ? 'blue' : 'green'} onClick={handleConfirmAction} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal to Add New Items */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        order={selectedOrder}
        onSave={handleSaveNewItems}
        user={user}
      />
    </Box>
  );
};

export default Orders;
