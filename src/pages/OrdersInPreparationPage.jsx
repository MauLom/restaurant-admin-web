import React, { useState, useEffect} from 'react';
import { Box, VStack, HStack, Text, Button, Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Flex, Heading, Center, Divider, Table, 
  Thead, Tbody,Tr, Th, Td,TableContainer,ListIcon, ListItem, List, TableCaption, Switch, Item} from '@chakra-ui/react';
import { ReactIcon, TimeIcon, } from '@chakra-ui/icons'
import { FaComment } from 'react-icons/fa';
import api from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';  // Import Socket.IO client
import dayjs from 'dayjs'; // Import dayjs to handle dates


function OrdersPreparationPage() {
  const [orders, setOrders] = useState([]);
  const [preparationAreas, setPreparationAreas] = useState(['kitchen', 'bar']); // Initial areas
  const { user } = useAuthContext();
  const [switchState, setSwitchState] = useState({}); // Almacena el estado de cada switch

  // Effect to fetch initial orders and handle real-time updates via Socket.IO
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders?kitchen=true');
        const filteredOrders = response.data.filter(order => order.status !== 'ready' && order.status !== 'paid');
        setOrders(filteredOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();

    if (user.role !== 'admin') {
      // Set specific areas based on the user's role
      if (user.role === 'bar') {
        setPreparationAreas(['bar']);
      } else if (user.role === 'kitchen') {
        setPreparationAreas(['kitchen']);
      }
    }

    // Setup WebSocket connection

    let socketURL = process.env.REACT_APP_API_URL;
    if(socketURL.includes("/api")) socketURL = socketURL.replace("/api", "");
    const socket = io(socketURL); 
    socket.on('new-order', (newOrder) => {
      console.log("Se recibe la emision de new-order");
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    socket.on('update-order', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    // Cleanup when component unmounts
    return () => {
      socket.disconnect();  // Clean up WebSocket connection
    };
  }, [user.role]);

  const handleMarkItemAsReady = async (orderId, itemId) => {
    try {
      setSwitchState(prevState => ({
        ...prevState,
        [orderId]: !prevState[orderId],
      }));
      
      const response = await api.put(`/orders/${orderId}/items/${itemId}`, { status: 'ready' });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.itemId === itemId ? { ...item, status: 'ready' } : item
                ),
                status: response.data.status,
              }
            : order
        )
      );
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const groupedOrders = preparationAreas.map((area) => ({
    area,
    orders: orders.filter((order) => order.items.some((item) => item.area === area)),
  }));

  const TimeSince = ({ createdAt }) => {
    const [elapsedTime, setElapsedTime] = useState(Date.now() - new Date(createdAt).getTime());

    useEffect(() => {
      const interval = setInterval(() => {
        const currentTime = new Date();
        const startTime = new Date(createdAt);
        const timeDiff = currentTime - startTime;

        if(timeDiff != 0)
          setElapsedTime(Math.floor(timeDiff));
      }, 1000); 

      return () => clearInterval(interval);
    }, [createdAt]);

    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  
    return(
      <HStack>
        <TimeIcon/>
        {
          (hours+minutes+seconds > 0) ?
            <Text>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text> :
            <Text>--:--:--</Text>
        }
      </HStack>
    );
  }
  
  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Orders in Preparation</Text>
      <Tabs variant="soft-rounded" colorScheme="teal">
        <TabList>
          {groupedOrders.map((group) => (
            <Tab key={group.area}>{group.area.charAt(0).toUpperCase() + group.area.slice(1)}</Tab>
          ))}
        </TabList>

        <TabPanels>
          {groupedOrders.map((group) => (
            <TabPanel key={group.area}>
              <HStack spacing={4}>
                <SimpleGrid width='full' spacing={50} marginTop={5}>
                  <Flex gap={10} flexFlow='wrap'>
                    {group.orders
                      .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((order) => (
                        <Box px={5} py={2} shadow='md' borderWidth={2} width={400} borderRadius={10}>
                          <Text textAlign='right'>{dayjs(order.createdAt).format("DD/MM/YYYY")}</Text>
                          <Heading fontSize='md' textAlign='center' pb={5}>Order #{order._id.substring(order._id.length - 4)}</Heading>
                          <Center height='50px' bg='red' py={10}>
                            <Flex width="100%" alignItems="center">
                              {/* Primer lado: order.tableId.number */}
                              <Box flex="1" textAlign="center">
                                <Text fontWeight='bold'>Table</Text>
                                <Text>{order.tableId.number}</Text>
                              </Box>

                              {/* Divider visible con altura completa */}
                              <Divider orientation='vertical' borderColor="white" height="50px" />

                              {/* Segundo lado: Otro contenido */}
                              <Box flex="1" textAlign="center">
                                <Text>{order.status}</Text>
                              </Box>
                            </Flex>
                          </Center>

                          <Flex justifyContent='space-between'>
                            <Text>{dayjs(order.createdAt).format("hh:mm:ss A")}</Text>
                            <TimeSince createdAt={order.createdAt}></TimeSince>
                          </Flex>
                          <TableContainer>
                            <Table variant='simple' size='lg'>
                              <TableCaption placement='top'>
                                <Text>Comentarios generales:</Text>
                                {
                                  <Text><ReactIcon as={FaComment}/> {order.comment.trim() != "" ? order.comment :"N/A"}</Text>
                                }
                              </TableCaption>
                              <Thead>
                                <Tr>
                                  <Th p={0}>Cant.</Th>
                                  <Th p={0}>Producto</Th>
                                  <Th p={0}>Completar</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                              {order.items
                                .filter((item) => item.area === group.area)
                                .map((item, index) => (
                                  <Tr>
                                    <Td px={0} py={10} textAlign='left'>x{item.quantity}</Td>
                                    <Td px={0} py={10}>
                                      <Text>{item.name}</Text>
                                      <List>
                                        {
                                          item.comments.split("|")
                                            .filter(comment => comment.trim() != "")
                                            .map((comment, index) => (
                                              <ListItem key={index}>
                                                <Text fontSize='md' pl={5} as='i'><ListIcon as={FaComment} />x1 {comment}</Text>
                                              </ListItem>
                                          ))
                                        }
                                      </List>
                                    </Td>
                                    <Td px={0} py={10} textAlign='right'>
                                      <Switch 
                                        colorScheme='green' size='lg' 
                                        isDisabled={switchState[order._id]}
                                        onChange={()=> handleMarkItemAsReady(order._id, item.itemId)}
                                      />
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                          <VStack m={5}>
                            <Button
                              colorScheme="green"
                              // onClick={() => handleMarkItemAsReady(order._id, item.itemId)}
                              isDisabled={order.status === 'ready'}
                              >
                              Mark as Ready
                            </Button>
                          </VStack>
                        </Box>

                      /* <Box key={order._id} p={4} bg="gray.800" color="white" borderRadius="md" width="full">
                        <Text fontSize="lg">Order #{order._id.substring(order._id.length - 4)}</Text>
                        <VStack spacing={2} mt={2}>
                          {order.items
                            .filter((item) => item.area === group.area)
                            .map((item, index) => (
                              <HStack key={index} justifyContent="space-between" width="full">
                                <Text>{item.name} (x{item.quantity})</Text>
                                <HStack>
                                  <Text>{item.status}</Text>
                                  <Button
                                    colorScheme="green"
                                    onClick={() => handleMarkItemAsReady(order._id, item.itemId)}
                                    isDisabled={item.status === 'ready'}
                                  >
                                    Mark as Ready
                                  </Button>
                                </HStack>
                              </HStack>
                            ))}
                        </VStack>
                        {order.status === 'ready' && (
                          <Text fontSize="sm" color="green.500">Order fully ready!</Text>
                        )}
                      </Box> */
                    ))}
                  </Flex>
                </SimpleGrid>
              </HStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default OrdersPreparationPage;
