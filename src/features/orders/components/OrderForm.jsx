import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, Grid, Text, VStack, HStack, IconButton, Textarea, Wrap, WrapItem, Select, useTheme
} from '@chakra-ui/react';
import { FaPlus, FaMinus, FaTrash, FaCashRegister } from 'react-icons/fa';
import api from '../../../services/api';
import { UserContext } from '../../../context/UserContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import { ItemSearchBar } from './ItemSearchBar'; // Asegúrate de importar el componente de búsqueda
import OrderMenuItem from './OrderMenuItem';
import SeatAllergenPanel from './SeatAllergenPanel';
import { useLanguage } from '../../../context/LanguageContext';
function OrderForm({ table, onBack }) {
  const toast = useCustomToast();
  const { t } = useLanguage();
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [comment, setComment] = useState('');
  const [inventory, setInventory] = useState([]);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [filteredItems, setFilteredItems] = useState([]);
  const [session, setSession] = useState(null);
  const [seatRestrictions, setSeatRestrictions] = useState([]);
  const [savingRestrictions, setSavingRestrictions] = useState(false);

  useEffect(() => {
    setFilteredItems(menuItems); // Inicialmente mostramos todos
  }, [menuItems]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!table.tableSessionId) return;
      try {
        const response = await api.get(`/tableSession/${table.tableSessionId}`);
        setSession(response.data.session);
        setSeatRestrictions(response.data.session.seatRestrictions || []);
      } catch (error) {
        console.warn('No se pudo cargar la sesión de mesa para las restricciones por asiento.');
      }
    };
    fetchSession();
  }, [table.tableSessionId]);



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
          ? [...prevItems, { ...item, quantity: delta, note: '' }]
          : prevItems;
      }
    });
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems(prevItems => prevItems.filter(i => i._id !== itemId));
  };

  const handleNoteChange = (itemId, note) => {
    setOrderItems(prevItems =>
      prevItems.map(i => i._id === itemId ? { ...i, note } : i)
    );
  };

  const handleSeatChange = (itemId, seatNumber) => {
    setOrderItems(prevItems =>
      prevItems.map(i => i._id === itemId ? { ...i, seatNumber: seatNumber ? Number(seatNumber) : null } : i)
    );
  };

  const toggleSeatAllergen = (seatNumber, allergen) => {
    setSeatRestrictions(prev => {
      const existing = prev.find(r => r.seatNumber === seatNumber);
      if (existing) {
        const hasAllergen = existing.allergens.includes(allergen);
        const updatedAllergens = hasAllergen
          ? existing.allergens.filter(a => a !== allergen)
          : [...existing.allergens, allergen];
        if (updatedAllergens.length === 0) {
          return prev.filter(r => r.seatNumber !== seatNumber);
        }
        return prev.map(r => r.seatNumber === seatNumber ? { ...r, allergens: updatedAllergens } : r);
      }
      return [...prev, { seatNumber, allergens: [allergen] }];
    });
  };

  const handleSaveSeatRestrictions = async () => {
    if (!session) return;
    setSavingRestrictions(true);
    try {
      await api.put(`/tableSession/${session._id}/seat-restrictions`, { seatRestrictions });
      toast({
        title: t('restrictionsSavedTitle'),
        description: t('restrictionsSavedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorSavingRestrictionsDescription'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSavingRestrictions(false);
    }
  };

  const getSeatConflict = (item, seatNumber) => {
    if (!seatNumber || !item.allergens) return null;
    const restriction = seatRestrictions.find(r => r.seatNumber === Number(seatNumber));
    if (!restriction) return null;
    const conflicts = item.allergens.filter(a => restriction.allergens.includes(a));
    return conflicts.length > 0 ? conflicts : null;
  };

  const getIngredientConflict = (item, seatNumber) => {
    if (!seatNumber || !item.ingredients || item.ingredients.length === 0) return null;
    const restriction = seatRestrictions.find(r => r.seatNumber === Number(seatNumber));
    if (!restriction || restriction.allergens.length === 0) return null;
    const conflicts = [];
    for (const ing of item.ingredients) {
      const inv = ing.inventoryItem;
      if (!inv || !Array.isArray(inv.allergens) || inv.allergens.length === 0) continue;
      const shared = inv.allergens.filter(a => restriction.allergens.includes(a));
      if (shared.length > 0) conflicts.push({ ingredientName: inv.name, allergens: shared });
    }
    return conflicts.length > 0 ? conflicts : null;
  };

  const handleFillAllergenNote = (itemId, seatNumber, ingredientConflicts) => {
    const restriction = seatRestrictions.find(r => r.seatNumber === Number(seatNumber));
    const allergenNames = (restriction?.allergens || []).map(a => t(`allergen_${a}`)).join(', ');
    const ingredientNames = ingredientConflicts.map(ic => ic.ingredientName).join(', ');
    const message = t('allergenPrewrittenNote')
      .replace('{allergens}', allergenNames)
      .replace('{ingredients}', ingredientNames);
    handleNoteChange(itemId, message);
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

    const conflictingItems = orderItems.filter(item => getSeatConflict(item, item.seatNumber));
    if (conflictingItems.length > 0) {
      toast({
        title: t('allergyConflictTitle'),
        description: t('allergyConflictBlockedDescription'),
        status: 'error',
        duration: 5000,
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
          seatNumber: item.seatNumber || undefined,
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
      const conflicts = error.response?.data?.conflicts;
      const description = error.response?.status === 409 && conflicts
        ? t('allergyConflictDescription').replace(
            '{details}',
            conflicts.map(c => `${c.itemName} (${t('seatLabel').replace('{number}', c.seatNumber)}: ${c.allergens.map(a => t(`allergen_${a}`)).join(', ')})`).join('; ')
          )
        : t('createOrderError');
      toast({
        title: t('errorTitle'),
        description,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSendToCashier = async () => {
    try {
      await api.put(`/orders/send-all-to-cashier/${table._id}`);
      toast({
        title: t('tableReadyForPayment'),
        description: t('cashierNotified'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const description = error.response?.status === 404
        ? t('noEligibleOrdersToSendDescription')
        : t('cashierNotificationError');
      toast({
        title: t('errorTitle'),
        description,
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
    <VStack align="stretch" spacing={6} bg="#1a202c" color="white" p={4} borderRadius="md">
      <Button mb={4} onClick={onBack} bg="gray.600" _hover={{ bg: 'gray.500' }} color="white">
        {t('backToTables')}
      </Button>
      <Text fontSize="xl" fontWeight="bold" color="teal.200">
        {t('orderForTable').replace('{tableNumber}', table.number)}
      </Text>

      {session && session.numberOfGuests > 0 && (
        <SeatAllergenPanel
          numberOfGuests={session.numberOfGuests}
          seatRestrictions={seatRestrictions}
          onToggleAllergen={toggleSeatAllergen}
          onSave={handleSaveSeatRestrictions}
          saving={savingRestrictions}
        />
      )}

      <Box p={4}>
        <Text mb={2} fontWeight="semibold">{t('categoriesLabel')}:</Text>
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
          <Text fontWeight="semibold">{t('menuLabel')}:</Text>
          <ItemSearchBar items={menuItems} onFilter={setFilteredItems} />
        </HStack>
        <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
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
                onRemoveItem={handleRemoveItem}
              />
            );
          })}
        </Grid>
      </Box>


      <Box p={4} borderWidth="1px" borderRadius="md" bg="#363636">
        <Text fontSize="lg" fontWeight="bold" mb={2}>{t('orderSummary')}</Text>
        {orderItems.length === 0 ? (
          <Text>{t('noItemsSelected')}</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {orderItems.map(item => {
              const conflict = getSeatConflict(item, item.seatNumber);
              const ingredientConflict = getIngredientConflict(item, item.seatNumber);
              return (
                <Box key={item._id} p={2} borderWidth="1px" borderRadius="md" bg="gray.700">
                  <HStack justify="space-between">
                    <Text fontWeight="semibold">{item.name}</Text>
                    <Text>
                      {item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </HStack>
                  {session && session.numberOfGuests > 0 && (
                    <Select
                      mt={2}
                      size="sm"
                      value={item.seatNumber || ''}
                      onChange={(e) => handleSeatChange(item._id, e.target.value)}
                      bg="gray.600"
                      color="white"
                    >
                      <option value="" style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}>
                        {t('noSeatAssignedOption')}
                      </option>
                      {Array.from({ length: session.numberOfGuests }, (_, i) => i + 1).map(seatNumber => (
                        <option
                          key={seatNumber}
                          value={seatNumber}
                          style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                        >
                          {t('seatLabel').replace('{number}', seatNumber)}
                        </option>
                      ))}
                    </Select>
                  )}
                  {conflict && (
                    <Text fontSize="xs" color="red.300" fontWeight="medium" mt={1}>
                      ⚠️ {t('allergyConflictWarning').replace('{allergens}', conflict.map(a => t(`allergen_${a}`)).join(', '))}
                    </Text>
                  )}
                  {ingredientConflict && !conflict && (
                    <Box mt={1}>
                      {ingredientConflict.map(ic => (
                        <Text key={ic.ingredientName} fontSize="xs" color="orange.300" fontWeight="medium">
                          ⚠️ {t('ingredientConflictWarning')
                            .replace('{ingredient}', ic.ingredientName)
                            .replace('{allergens}', ic.allergens.map(a => t(`allergen_${a}`)).join(', '))}
                        </Text>
                      ))}
                      <Button
                        mt={1}
                        size="xs"
                        bg="orange.600"
                        color="white"
                        _hover={{ bg: 'orange.500' }}
                        onClick={() => handleFillAllergenNote(item._id, item.seatNumber, ingredientConflict)}
                      >
                        {t('fillAllergenNoteButton')}
                      </Button>
                    </Box>
                  )}
                  <Textarea
                    mt={2}
                    placeholder={t('addNotePlaceholder')}
                    value={item.note}
                    onChange={(e) => handleNoteChange(item._id, e.target.value)}
                    bg="gray.600"
                    color="white"
                    _placeholder={{ color: 'gray.300' }}
                  />
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      <Box p={4}>
        <Text fontWeight="bold">Total: ${calculateTotal().toFixed(2)}</Text>
      </Box>
      <Textarea
        placeholder={t('generalCommentsPlaceholder')}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        bg="gray.700"
        color="white"
        _placeholder={{ color: 'gray.400' }}
      />
      <Box position={{ base: "fixed", md: "static" }} bottom="0" left="0" right="0" bg="gray.900" p={4} zIndex="10" boxShadow="dark-lg" pb={{ base: "100px", md: "15px" }}>
        <HStack justify="center" spacing={4}>
          <Button bg="teal.500" _hover={{ bg: 'teal.600' }} onClick={handleSubmitOrder} color="white">
            {t('confirmOrder')}
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
