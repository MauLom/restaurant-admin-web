import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, Grid, Text, VStack, HStack, IconButton, Textarea, Wrap, WrapItem
} from '@chakra-ui/react';
import { FaPlus, FaMinus, FaTrash, FaCashRegister } from 'react-icons/fa';
import api from '../../../services/api';
import { UserContext } from '../../../context/UserContext';
import { Badge } from '@chakra-ui/react';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { ItemSearchBar } from './ItemSearchBar'; // Asegúrate de importar el componente de búsqueda
function OrderForm({ table, onBack }) {
  const toast = useCustomToast();
  const { user } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [comment, setComment] = useState('');
  const [inventory, setInventory] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    setFilteredItems(menuItems); // Inicialmente mostramos todos
  }, [menuItems]);



  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/inventory');
        setInventory(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo cargar el inventario',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await api.get('/menu/categories');
        setCategories(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las categorías del menú',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    const fetchThreshold = async () => {
      try {
        const response = await api.get('/settings/lowStockThreshold');
        setLowStockThreshold(response.data.value);
      } catch (error) {
        console.warn("No se pudo cargar el umbral de stock, se usará el valor por defecto.");
      }
    };
    fetchThreshold();
    fetchInventory();
    fetchCategories();
  }, [toast]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchItems = async () => {
        try {
          const response = await api.get(`/menu/items?category=${selectedCategory._id}`);
          setMenuItems(response.data);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los items del menú',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      };
      fetchItems();
    } else {
      setMenuItems([]);
    }
  }, [selectedCategory, toast]);

  const handleAddItem = (item, delta) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      const stock = getItemStock(item.name);

      if (existingItem) {
        const updatedQuantity = existingItem.quantity + delta;

        if (stock !== null && updatedQuantity > stock) {
          toast({
            title: 'Stock insuficiente',
            description: `Solo hay ${stock} unidad(es) disponibles de "${item.name}".`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return prevItems;
        }

        if (updatedQuantity <= 0) {
          return prevItems.filter(i => i._id !== item._id);
        }

        return prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: updatedQuantity } : i
        );
      } else {
        if (delta > 0 && stock !== null && delta > stock) {
          toast({
            title: 'Stock insuficiente',
            description: `Solo hay ${stock} unidad(es) disponibles de "${item.name}".`,
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return prevItems;
        }

        return delta > 0
          ? [...prevItems, { ...item, quantity: delta, note: '' }]
          : prevItems;
      }
    });
  };

  const handleNoteChange = (itemId, note) => {
    setOrderItems(prevItems =>
      prevItems.map(i => i._id === itemId ? { ...i, note } : i)
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'La orden está vacía',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const orderPayload = {
        tableId: table._id,
        waiterId: user?._id,
        items: orderItems.map(item => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          comments: item.note || '',
          quantity: item.quantity,
          area: item.category?.area,
        })),
        tableSessionId: table.tableSessionId,
        comment,
      };
      await api.post('/orders', orderPayload);
      toast({
        title: 'Orden creada',
        description: `La orden para la mesa ${table.number} se creó correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setOrderItems([]);
      setComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la orden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendToCashier = async () => {
    try {
      await api.put(`/tables/${table._id}`, { status: 'ready_for_payment' });
      toast({
        title: 'Mesa lista para cobro',
        description: 'El cajero ha sido notificado.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo notificar al cajero',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const isItemAvailable = (itemName) => {
    const found = inventory.find(inv => inv.name.toLowerCase() === itemName.toLowerCase());
    return found ? found.quantity > 0 : true;
  };

  const getItemStock = (itemName) => {
    const found = inventory.find(inv => inv.name.toLowerCase() === itemName.toLowerCase());
    return found ? found.quantity : null;
  };

  const isLowStock = (itemName) => {
    const found = inventory.find(inv => inv.name.toLowerCase() === itemName.toLowerCase());
    return found ? found.quantity > 0 && found.quantity <= lowStockThreshold : false;
  };

  return (
    <VStack align="stretch" spacing={6} bg="#1a202c" color="white" p={4} borderRadius="md">
      <Button mb={4} onClick={onBack} bg="gray.600" _hover={{ bg: 'gray.500' }} color="white">
        Volver a Mesas
      </Button>
      <Text fontSize="xl" fontWeight="bold" color="teal.200">
        Orden para la mesa {table.number}
      </Text>

      <Box p={4}>
        <Text mb={2} fontWeight="semibold">Categorías:</Text>
        <Wrap spacing="12px">
          {categories.map(category => (
            <WrapItem key={category._id}>
              <Button
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory?._id === category._id ? "solid" : "outline"}
                colorScheme="teal"
              >
                {category.name}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      <Box p={4}>
        <HStack justify="space-between" align="center" mb={2}>
          <Text fontWeight="semibold">Menú:</Text>
          <ItemSearchBar items={menuItems} onFilter={setFilteredItems} />
        </HStack>
        <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
          {filteredItems.map(item => {
            const available = isItemAvailable(item.name);
            const stock = getItemStock(item.name);
            const selectedQty = orderItems.find(i => i._id === item._id)?.quantity || 0;
            const canAddMore = stock === null || selectedQty < stock;

            return (
              <VStack key={item._id} p={2} borderWidth="1px" borderRadius="md" opacity={available ? 1 : 0.5} bg="gray.700">
                {isLowStock(item.name) && (
                  <Badge colorScheme="yellow" mb={1}>
                    Pocas unidades
                  </Badge>
                )}

                <Button
                  colorScheme={available ? "blue" : "gray"}
                  onClick={() => available && handleAddItem(item, 1)}
                  isDisabled={!available}
                >
                  {item.name} <br /> (${item.price.toFixed(2)})
                </Button>

                {!available && (
                  <Text fontSize="xs" color="red.300">
                    No disponible en inventario
                  </Text>
                )}

                <HStack>
                  <IconButton
                    size="sm"
                    colorScheme="red"
                    icon={<FaMinus />}
                    onClick={() => handleAddItem(item, -1)}
                    aria-label="Disminuir cantidad"
                    isDisabled={selectedQty === 0}
                  />
                  <Text>{selectedQty}</Text>
                  <IconButton
                    size="sm"
                    colorScheme="green"
                    icon={<FaPlus />}
                    onClick={() => handleAddItem(item, 1)}
                    aria-label="Aumentar cantidad"
                    isDisabled={!canAddMore}
                  />
                  <IconButton
                    size="sm"
                    colorScheme="red"
                    icon={<FaTrash />}
                    onClick={() => setOrderItems(prev => prev.filter(i => i._id !== item._id))}
                    aria-label="Eliminar ítem"
                    isDisabled={selectedQty === 0}
                  />
                </HStack>
              </VStack>
            );
          })}
        </Grid>
      </Box>


      <Box p={4} borderWidth="1px" borderRadius="md" bg="#363636">
        <Text fontSize="lg" fontWeight="bold" mb={2}>Resumen de la Orden</Text>
        {orderItems.length === 0 ? (
          <Text>No se han seleccionado ítems.</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {orderItems.map(item => (
              <Box key={item._id} p={2} borderWidth="1px" borderRadius="md" bg="gray.700">
                <HStack justify="space-between">
                  <Text fontWeight="semibold">{item.name}</Text>
                  <Text>
                    {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                  </Text>
                </HStack>
                <Textarea
                  mt={2}
                  placeholder="Agregar nota (ej. sin cacahuates)"
                  value={item.note}
                  onChange={(e) => handleNoteChange(item._id, e.target.value)}
                  bg="gray.600"
                  color="white"
                  _placeholder={{ color: 'gray.300' }}
                />
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      <Box p={4}>
        <Text fontWeight="bold">Total: ${calculateTotal().toFixed(2)}</Text>
      </Box>
      <Textarea
        placeholder="Comentarios generales para la orden"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        bg="gray.700"
        color="white"
        _placeholder={{ color: 'gray.400' }}
      />
      <Box position={{ base: "fixed", md: "static" }} bottom="0" left="0" right="0" bg="gray.900" p={4} zIndex="10" boxShadow="dark-lg" pb={{ base: "100px", md: "15px" }}>
        <HStack justify="center" spacing={4}>
          <Button bg="teal.500" _hover={{ bg: 'teal.600' }} onClick={handleSubmitOrder} color="white">
            Confirmar Orden
          </Button>
          <Button bg="orange.500" _hover={{ bg: 'orange.600' }} onClick={handleSendToCashier} leftIcon={<FaCashRegister />} color="white">
            Enviar al Cajero
          </Button>
        </HStack>
      </Box>
    </VStack>
  );
}

export default OrderForm;
