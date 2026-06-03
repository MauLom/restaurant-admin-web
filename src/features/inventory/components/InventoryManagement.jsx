import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Button, Text, Input, NumberInput, NumberInputField,
  Select, IconButton, Wrap, WrapItem, Tag, TagLabel, TagCloseButton,
  Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow,
  Badge, Divider, Tooltip, Collapse,
} from '@chakra-ui/react';
import { FaEdit, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

const PREDEFINED_TAGS = [
  'Carnes rojas', 'Aves', 'Pescados', 'Mariscos',
  'Verduras', 'Frutas', 'Lácteos', 'Huevos',
  'Granos y cereales', 'Panadería', 'Condimentos', 'Especias',
  'Aceites y grasas', 'Bebidas', 'Alcohol', 'Salsas',
];

const EMPTY_FORM = {
  name: '', quantity: '', unit: '', equivalentMl: '',
  equivalentGr: '', cost: '', minStock: '', tags: [],
};

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState(EMPTY_FORM);
  const [editingItemId, setEditingItemId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const toast = useCustomToast();
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/inventory')
      .then(r => setInventory(r.data))
      .catch(e => console.error('Error fetching inventory:', e));
  }, []);

  const lowStockItems = inventory.filter(
    item => item.minStock > 0 && item.quantity < item.minStock
  );

  const isLow = (item) => item.minStock > 0 && item.quantity < item.minStock;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !newItem.tags.includes(tag)) {
      setNewItem(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setCustomTag('');
  };

  const removeTag = (tag) => {
    setNewItem(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleAddOrUpdateItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.unit) {
      toast({ title: t('invalidInputTitle'), description: t('invalidInputDescription'), status: 'error', duration: 3000, isClosable: true });
      return;
    }

    const payload = {
      ...newItem,
      quantity: parseFloat(newItem.quantity) || 0,
      cost: parseFloat(newItem.cost) || 0,
      minStock: parseFloat(newItem.minStock) || 0,
      equivalentMl: ['ml', 'l', 'bottle'].includes(newItem.unit) ? parseFloat(newItem.equivalentMl) || 0 : 0,
      equivalentGr: ['g', 'kg', 'unit'].includes(newItem.unit) ? parseFloat(newItem.equivalentGr) || 0 : 0,
    };

    try {
      if (editingItemId) {
        const res = await api.put(`/inventory/${editingItemId}`, payload);
        setInventory(prev => prev.map(i => i._id === editingItemId ? res.data : i));
        setEditingItemId(null);
        toast({ title: 'Producto actualizado', status: 'success', duration: 3000, isClosable: true });
      } else {
        const res = await api.post('/inventory', payload);
        setInventory(prev => [...prev, res.data]);
        toast({ title: t('itemAddedTitle'), description: t('itemAddedDescription'), status: 'success', duration: 3000, isClosable: true });
      }
      setNewItem(EMPTY_FORM);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({ title: t('errorTitle'), description: t('errorDescription'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item._id);
    setNewItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      equivalentMl: item.equivalentMl,
      equivalentGr: item.equivalentGr,
      cost: item.cost,
      minStock: item.minStock || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
    });
    setShowForm(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prev => prev.filter(i => i._id !== id));
      toast({ title: t('itemDeletedTitle'), description: t('itemDeletedDescription'), status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({ title: t('errorTitle'), description: t('errorDescription'), status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewItem(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <Box p={4} color="white">

      {/* ── Header con alerta de stock bajo ── */}
      <HStack justify="space-between" mb={4} align="center">
        <Text fontSize="2xl">{t('inventoryManagement')}</Text>
        <HStack spacing={3}>
          {lowStockItems.length > 0 && (
            <Popover trigger="hover" placement="bottom-end">
              <PopoverTrigger>
                <Box position="relative" cursor="pointer">
                  <IconButton
                    icon={<FaExclamationTriangle />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    aria-label="Stock bajo"
                  />
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    position="absolute"
                    top="-4px"
                    right="-4px"
                    fontSize="10px"
                    minW="18px"
                    textAlign="center"
                  >
                    {lowStockItems.length}
                  </Badge>
                </Box>
              </PopoverTrigger>
              <PopoverContent bg="gray.800" border="1px solid" borderColor="red.500" maxW="280px">
                <PopoverArrow bg="gray.800" />
                <PopoverBody p={3}>
                  <Text fontSize="sm" fontWeight="bold" color="red.300" mb={2}>
                    Stock bajo en {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'}:
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {lowStockItems.map(item => (
                      <HStack key={item._id} justify="space-between">
                        <Text fontSize="sm">{item.name}</Text>
                        <Text fontSize="sm" color="red.400" fontWeight="bold">
                          {item.quantity} / {item.minStock} {item.unit}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}
          <Button
            leftIcon={<FaPlus />}
            colorScheme="green"
            size="sm"
            onClick={() => { setShowForm(v => !v); if (showForm && !editingItemId) handleCancelEdit(); }}
          >
            {showForm && !editingItemId ? 'Cancelar' : t('addItem')}
          </Button>
        </HStack>
      </HStack>

      {/* ── Lista de items ── */}
      <VStack spacing={3} align="stretch" mb={6}>
        {inventory.length === 0 && (
          <Text opacity={0.5} textAlign="center" py={8}>No hay items en el inventario.</Text>
        )}
        {inventory.map(item => (
          <Box
            key={item._id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={isLow(item) ? 'red.500' : 'whiteAlpha.300'}
            bg={isLow(item) ? 'red.900' : 'whiteAlpha.50'}
          >
            <HStack justify="space-between" width="100%" flexWrap="wrap" gap={2}>
              <VStack align="start" spacing={0}>
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontWeight="semibold">{item.name}</Text>
                  {item.tags?.map(tag => (
                    <Badge key={tag} colorScheme="blue" fontSize="10px">{tag}</Badge>
                  ))}
                </HStack>
                <HStack spacing={3} mt={1}>
                  <Text fontSize="sm">
                    {t('quantity')}:{' '}
                    <Text
                      as="span"
                      fontWeight="bold"
                      color={isLow(item) ? 'red.300' : 'white'}
                    >
                      {item.quantity}
                    </Text>
                    {' '}{item.unit}
                  </Text>
                  {item.minStock > 0 && (
                    <Tooltip label="Stock mínimo configurado">
                      <Text fontSize="sm" opacity={0.6}>
                        mín: {item.minStock}
                      </Text>
                    </Tooltip>
                  )}
                  {item.cost > 0 && (
                    <Text fontSize="sm" opacity={0.6}>Costo: ${item.cost.toFixed(2)}</Text>
                  )}
                </HStack>
              </VStack>
              <HStack>
                {isLow(item) && (
                  <Tooltip label="Stock por debajo del mínimo">
                    <Box color="red.400"><FaExclamationTriangle /></Box>
                  </Tooltip>
                )}
                <IconButton icon={<FaEdit />} onClick={() => handleEditItem(item)} size="sm" colorScheme="yellow" aria-label="Editar" />
                <Button colorScheme="red" size="sm" onClick={() => handleDeleteItem(item._id)}>
                  {t('delete')}
                </Button>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* ── Formulario ── */}
      <Collapse in={showForm} animateOpacity>
        <Box p={5} borderWidth="1px" borderRadius="xl" borderColor="whiteAlpha.300" bg="whiteAlpha.50">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {editingItemId ? 'Editar producto' : t('addNewItem')}
          </Text>
          <VStack spacing={4} align="stretch">
            <Input placeholder={t('itemNamePlaceholder')} value={newItem.name} name="name" onChange={handleInputChange} />

            <HStack spacing={3} flexWrap="wrap">
              <NumberInput min={0} flex="1">
                <NumberInputField
                  placeholder={t('quantityPlaceholder')}
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                />
              </NumberInput>
              <Select
                name="unit"
                value={newItem.unit}
                onChange={handleInputChange}
                placeholder="Unidad de medida"
                flex="1"
                bg="gray.700"
                color="white"
              >
                <option style={{ backgroundColor: '#2D3748' }} value="ml">Mililitros (ml)</option>
                <option style={{ backgroundColor: '#2D3748' }} value="l">Litros (l)</option>
                <option style={{ backgroundColor: '#2D3748' }} value="g">Gramos (g)</option>
                <option style={{ backgroundColor: '#2D3748' }} value="kg">Kilogramos (kg)</option>
                <option style={{ backgroundColor: '#2D3748' }} value="unit">Unidad</option>
                <option style={{ backgroundColor: '#2D3748' }} value="bottle">Botella</option>
              </Select>
            </HStack>

            {['ml', 'l', 'bottle'].includes(newItem.unit) && (
              <NumberInput min={0}>
                <NumberInputField placeholder="Contenido por unidad (ml)" name="equivalentMl" value={newItem.equivalentMl} onChange={handleInputChange} />
              </NumberInput>
            )}
            {['g', 'kg', 'unit'].includes(newItem.unit) && (
              <NumberInput min={0}>
                <NumberInputField placeholder="Peso aprox. por unidad (g)" name="equivalentGr" value={newItem.equivalentGr} onChange={handleInputChange} />
              </NumberInput>
            )}

            <HStack spacing={3}>
              <NumberInput min={0} flex="1">
                <NumberInputField placeholder="Costo del producto" name="cost" value={newItem.cost} onChange={handleInputChange} />
              </NumberInput>
              <NumberInput min={0} flex="1">
                <NumberInputField
                  placeholder="Stock mínimo (alerta)"
                  name="minStock"
                  value={newItem.minStock}
                  onChange={handleInputChange}
                />
              </NumberInput>
            </HStack>

            <Divider borderColor="whiteAlpha.200" />

            {/* Tags */}
            <Box>
              <Text fontSize="sm" mb={2} opacity={0.8}>Categorías / Etiquetas</Text>
              <Wrap mb={3}>
                {PREDEFINED_TAGS.map(tag => (
                  <WrapItem key={tag}>
                    <Tag
                      cursor="pointer"
                      colorScheme={newItem.tags.includes(tag) ? 'blue' : 'gray'}
                      variant={newItem.tags.includes(tag) ? 'solid' : 'subtle'}
                      onClick={() => toggleTag(tag)}
                      size="sm"
                    >
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>

              {newItem.tags.filter(t => !PREDEFINED_TAGS.includes(t)).length > 0 && (
                <Wrap mb={2}>
                  {newItem.tags.filter(t => !PREDEFINED_TAGS.includes(t)).map(tag => (
                    <WrapItem key={tag}>
                      <Tag colorScheme="purple" size="sm">
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => removeTag(tag)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}

              <HStack>
                <Input
                  size="sm"
                  placeholder="Etiqueta personalizada..."
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                  maxW="220px"
                />
                <IconButton icon={<FaPlus />} size="sm" onClick={addCustomTag} aria-label="Agregar etiqueta" />
              </HStack>
            </Box>

            <HStack>
              <Button colorScheme="green" onClick={handleAddOrUpdateItem} flex="1">
                {editingItemId ? 'Guardar cambios' : t('addItem')}
              </Button>
              {editingItemId && (
                <Button variant="ghost" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              )}
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default InventoryManagement;
