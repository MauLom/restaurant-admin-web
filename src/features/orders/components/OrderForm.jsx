import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Button, Grid, Text, VStack, HStack, IconButton, useToast, Textarea, Wrap, WrapItem 
} from '@chakra-ui/react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import api from '../../../services/api';
import { UserContext } from '../../../context/UserContext';

function OrderForm({ table, onBack }) {
  const toast = useToast();
  const { user } = useContext(UserContext); // Obtenemos el usuario logueado (mesero)
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [comment, setComment] = useState('');

  // Obtener categorías dinámicamente al montar el componente
  useEffect(() => {
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
    fetchCategories();
  }, [toast]);

  // Obtener los items del menú filtrados por la categoría seleccionada (por su _id)
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

  // Función para agregar o quitar ítems de la orden
  const handleAddItem = (item, delta) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        const updatedQuantity = existingItem.quantity + delta;
        if (updatedQuantity <= 0) {
          return prevItems.filter(i => i._id !== item._id);
        }
        return prevItems.map(i => 
          i._id === item._id ? { ...i, quantity: updatedQuantity } : i
        );
      } else {
        return delta > 0 ? [...prevItems, { ...item, quantity: delta, note: '' }] : prevItems;
      }
    });
  };

  // Actualizar la nota para un ítem en la orden
  const handleNoteChange = (itemId, note) => {
    setOrderItems(prevItems =>
      prevItems.map(i => i._id === itemId ? { ...i, note } : i)
    );
  };

  // Calcular el total de la orden
  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Enviar la orden a la API, incluyendo el waiterId obtenido desde el UserContext
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
        waiterId: user?._id, // Se envía el ID del mesero
        items: orderItems.map(item => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          comments: item.note || '',
          quantity: item.quantity,
          area: item.category?.area,
        })),
        comment, // Comentarios generales de la orden
      };
      await api.post('/orders', orderPayload);
      toast({
        title: 'Orden creada',
        description: `La orden para la mesa ${table.number} se creó correctamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Reiniciamos los estados
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

  return (
    <VStack align="stretch" spacing={6}>
      <Button mb={4} onClick={onBack}>
        Volver a Mesas
      </Button>
      <Text fontSize="xl" fontWeight="bold">
        Orden para la mesa {table.number}
      </Text>
      
      {/* Sección de categorías */}
      <Box p={4}>
        <Text mb={2} fontWeight="semibold">Categorías:</Text>
        <Wrap spacing="12px">
          {categories.map(category => (
            <WrapItem key={category._id}>
              <Button
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory?._id === category._id ? "solid" : "outline"}
              >
                {category.name}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
      
      {/* Sección de menú */}
      <Box p={4}>
        <Text mb={2} fontWeight="semibold">Menú:</Text>
        <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
          {menuItems.map(item => (
            <VStack key={item._id} p={2} borderWidth="1px" borderRadius="md">
              <Button colorScheme="blue" onClick={() => handleAddItem(item, 1)}>
                {item.name} <br /> (${item.price.toFixed(2)})
              </Button>
              <HStack>
                <IconButton 
                  size="sm" 
                  colorScheme="red" 
                  icon={<FaMinus />} 
                  onClick={() => handleAddItem(item, -1)} 
                  aria-label="Disminuir cantidad"
                />
                <Text>{orderItems.find(i => i._id === item._id)?.quantity || 0}</Text>
                <IconButton 
                  size="sm" 
                  colorScheme="green" 
                  icon={<FaPlus />} 
                  onClick={() => handleAddItem(item, 1)} 
                  aria-label="Aumentar cantidad"
                />
                <IconButton 
                  size="sm" 
                  colorScheme="red" 
                  icon={<FaTrash />} 
                  onClick={() => setOrderItems(prev => prev.filter(i => i._id !== item._id))} 
                  aria-label="Eliminar ítem"
                />
              </HStack>
            </VStack>
          ))}
        </Grid>
      </Box>
      
      {/* Resumen de la orden */}
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text fontSize="lg" fontWeight="bold" mb={2}>Resumen de la Orden</Text>
        {orderItems.length === 0 ? (
          <Text>No se han seleccionado ítems.</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {orderItems.map(item => (
              <Box key={item._id} p={2} borderWidth="1px" borderRadius="md">
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
                />
              </Box>
            ))}
          </VStack>
        )}
      </Box>
      
      {/* Total y comentarios generales */}
      <Box p={4}>
        <Text fontWeight="bold">Total: ${calculateTotal().toFixed(2)}</Text>
      </Box>
      <Textarea
        placeholder="Comentarios generales para la orden"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button mt={4} colorScheme="teal" onClick={handleSubmitOrder}>
        Confirmar Orden
      </Button>
    </VStack>
  );
}

export default OrderForm;
