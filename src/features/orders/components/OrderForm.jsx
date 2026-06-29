import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, Flex, Grid, Icon, IconButton, Text, VStack, HStack, Textarea, Wrap, WrapItem
} from '@chakra-ui/react';
import { FaCashRegister, FaShoppingBasket, FaMinus, FaPlus } from 'react-icons/fa';
import api from '../../../services/api';
import { UserContext } from '../../../context/UserContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { ItemSearchBar } from './ItemSearchBar'; // Asegúrate de importar el componente de búsqueda
import OrderMenuItem from './OrderMenuItem';
import { useLanguage } from '../../../context/LanguageContext';
function OrderForm({ table, onBack }) {
  const toast = useCustomToast();
  const { t } = useLanguage();
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
          title: t('errorTitle'),
          description: t('inventoryLoadError'),
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
          title: t('errorTitle'),
          description: t('categoriesLoadError'),
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
  }, [toast, t]);

  useEffect(() => {
    if (selectedCategory) {
      const fetchItems = async () => {
        try {
          const response = await api.get(`/menu/items?category=${selectedCategory._id}`);
          setMenuItems(response.data);
        } catch (error) {
          toast({
            title: t('errorTitle'),
            description: t('itemsLoadError'),
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
  }, [selectedCategory, toast, t]);

  const handleAddItem = (item, delta) => {
    setOrderItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      const stock = getItemStock(item.name);

      if (existingItem) {
        const updatedQuantity = existingItem.quantity + delta;

        if (stock !== null && updatedQuantity > stock) {
          toast({
            title: t('insufficientStock'),
            description: t('insufficientStockDesc').replace('{stock}', stock).replace('{itemName}', item.name),
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
            title: t('insufficientStock'),
            description: t('insufficientStockDesc').replace('{stock}', stock).replace('{itemName}', item.name),
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
          return prevItems;
        }

        return delta > 0
          ? [...prevItems, { ...item, quantity: delta }]
          : prevItems;
      }
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: t('errorTitle'),
        description: t('orderEmptyError'),
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
          comments: '',
          quantity: item.quantity,
          area: item.category?.area,
        })),
        tableSessionId: table.tableSessionId,
        comment,
      };
      await api.post('/orders', orderPayload);
      toast({
        title: t('orderCreated'),
        description: t('orderCreatedDesc').replace('{tableNumber}', table.number),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setOrderItems([]);
      setComment('');
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('createOrderError'),
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
        title: t('tableReadyForPayment'),
        description: t('cashierNotified'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('cashierNotificationError'),
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



  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align="flex-start"
      gap={4}
      bg="#1a202c"
      color="white"
      p={4}
      borderRadius="md"
    >
      {/* Columna izquierda: categorías + menú */}
      <Box flex="1" minW="0" w="full">
        <HStack justify="space-between" align="center" mb={4}>
          <Button size="sm" onClick={onBack} bg="gray.600" _hover={{ bg: 'gray.500' }} color="white">
            {t('backToTables')}
          </Button>
          <Text fontSize="lg" fontWeight="bold" color="teal.200">
            {t('orderForTable').replace('{tableNumber}', table.number)}
          </Text>
        </HStack>

        <Text mb={2} fontWeight="semibold">{t('categoriesLabel')}:</Text>
        <Wrap spacing="10px" mb={6}>
          {categories.map(category => (
            <WrapItem key={category._id}>
              <Button
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory?._id === category._id ? "solid" : "outline"}
                colorScheme="teal"
                size="lg"
                minW="110px"
                h="60px"
                borderRadius="lg"
              >
                {category.name}
              </Button>
            </WrapItem>
          ))}
        </Wrap>

        <HStack justify="space-between" align="center" mb={2}>
          <Text fontWeight="semibold">{t('menuLabel')}:</Text>
          <ItemSearchBar items={menuItems} onFilter={setFilteredItems} />
        </HStack>
        <Grid templateColumns="repeat(auto-fill, minmax(130px, 1fr))" gap={3}>
          {filteredItems.map(item => {
            const available = isItemAvailable(item.name);
            const stock = getItemStock(item.name);
            const selectedQty = orderItems.find(i => i._id === item._id)?.quantity || 0;
            const canAddMore = stock === null || selectedQty < stock;

            return (
              <OrderMenuItem
                key={item._id}
                item={item}
                stock={stock}
                available={available}
                selectedQty={selectedQty}
                canAddMore={canAddMore}
                inventory={inventory}
                lowStockThreshold={lowStockThreshold}
                onAddItem={handleAddItem}
              />
            );
          })}
        </Grid>
      </Box>

      {/* Columna derecha: resumen de la orden, fijo en pantallas medianas+ */}
      <Flex
        direction="column"
        w={{ base: 'full', md: '340px' }}
        flexShrink={0}
        position={{ base: 'static', md: 'sticky' }}
        top="4"
        alignSelf="flex-start"
        maxH={{ base: 'none', md: 'calc(100vh - 140px)' }}
        bg="#22272f"
        borderWidth="1px"
        borderColor="gray.700"
        borderRadius="md"
        p={4}
      >
        <Text fontSize="lg" fontWeight="bold" mb={3}>{t('orderSummary')}</Text>

        <Box flex="1" minH="0" overflowY="auto" mb={3}>
          {orderItems.length === 0 ? (
            <VStack justify="center" minH="180px" h="full" color="gray.500" spacing={3}>
              <Icon as={FaShoppingBasket} boxSize={10} />
              <Text>{t('noItemsSelected')}</Text>
            </VStack>
          ) : (
            <VStack spacing={2} align="stretch">
              {orderItems.map(item => {
                const stock = getItemStock(item.name);
                const canAddMore = stock === null || item.quantity < stock;

                return (
                  <HStack key={item._id} justify="space-between" p={2} borderRadius="md" bg="gray.700">
                    <HStack spacing={2}>
                      <IconButton
                        size="xs"
                        colorScheme="red"
                        icon={<FaMinus />}
                        onClick={() => handleAddItem(item, -1)}
                        aria-label={t('decreaseQuantity')}
                      />
                      <Text minW="20px" textAlign="center">{item.quantity}</Text>
                      <IconButton
                        size="xs"
                        colorScheme="green"
                        icon={<FaPlus />}
                        onClick={() => handleAddItem(item, 1)}
                        aria-label={t('increaseQuantity')}
                        isDisabled={!canAddMore}
                      />
                      <Text fontWeight="semibold" noOfLines={1}>{item.name}</Text>
                    </HStack>
                    <Text fontWeight="bold" whiteSpace="nowrap">
                      ${(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          )}
        </Box>

        <Box borderTopWidth="1px" borderColor="gray.700" pt={3}>
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="semibold" color="gray.300">{t('total')}</Text>
            <Text fontSize="xl" fontWeight="bold">${calculateTotal().toFixed(2)}</Text>
          </HStack>

          <Textarea
            placeholder={t('generalCommentsPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.400' }}
            size="sm"
            mb={3}
          />

          <VStack spacing={2}>
            <Button w="full" bg="teal.500" _hover={{ bg: 'teal.600' }} onClick={handleSubmitOrder} color="white">
              {t('confirmOrder')}
            </Button>
            <Button w="full" bg="orange.500" _hover={{ bg: 'orange.600' }} onClick={handleSendToCashier} leftIcon={<FaCashRegister />} color="white">
              Enviar al Cajero
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default OrderForm;
