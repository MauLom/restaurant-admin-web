import React, { useState, useEffect, useRef } from 'react';
import {
  Box, VStack, HStack, Button, Text, Input, NumberInput, NumberInputField,
  Select, IconButton, Wrap, WrapItem, Tag, TagLabel, TagCloseButton,
  Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverArrow,
  Badge, Divider, Tooltip, Collapse, useTheme,
  Tabs, Tab, TabList, TabPanel, TabPanels,
  FormControl, FormLabel,
  Alert, AlertIcon,
  Spinner, Center,
} from '@chakra-ui/react';
import { FaEdit, FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';
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
  name: '', type: 'raw', quantity: '', unit: '',
  equivalentMl: '', equivalentGr: '', cost: '',
  minStock: '', supplier: '', tags: [], recipe: [],
};

function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [newItem, setNewItem] = useState(EMPTY_FORM);
  const [editingItemId, setEditingItemId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useCustomToast();
  const { t } = useLanguage();
  const theme = useTheme();
  const formRef = useRef(null);

  useEffect(() => {
    api.get('/inventory')
      .then(r => setInventory(r.data))
      .catch(e => console.error('Error fetching inventory:', e))
      .finally(() => setIsLoading(false));
  }, []);

  const rawItems = inventory.filter(i => i.type === 'raw' || !i.type);
  const preparedItems = inventory.filter(i => i.type === 'prepared');
  const lowStockItems = inventory.filter(i => i.minStock > 0 && i.quantity < i.minStock);
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

  // Recipe row handlers (for prepared items)
  const addRecipeRow = () => {
    setNewItem(prev => ({
      ...prev,
      recipe: [...prev.recipe, { inventoryItem: '', quantity: '', unit: '' }],
    }));
  };

  const updateRecipeRow = (idx, field, value) => {
    setNewItem(prev => {
      const recipe = [...prev.recipe];
      recipe[idx] = { ...recipe[idx], [field]: value };
      return { ...prev, recipe };
    });
  };

  const removeRecipeRow = (idx) => {
    setNewItem(prev => ({ ...prev, recipe: prev.recipe.filter((_, i) => i !== idx) }));
  };

  const handleAddOrUpdateItem = async () => {
    if (!newItem.name) {
      toast({ title: t('invalidInputTitle'), description: t('nameRequiredError'), status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (!newItem.quantity) {
      toast({ title: t('invalidInputTitle'), description: t('quantityRequiredError'), status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (!newItem.unit) {
      toast({ title: t('invalidInputTitle'), description: t('unitRequiredError'), status: 'error', duration: 3000, isClosable: true });
      return;
    }

    const payload = {
      ...newItem,
      quantity: parseFloat(newItem.quantity) || 0,
      cost: parseFloat(newItem.cost) || 0,
      minStock: parseFloat(newItem.minStock) || 0,
      equivalentMl: ['ml', 'l', 'bottle'].includes(newItem.unit) ? parseFloat(newItem.equivalentMl) || 0 : 0,
      equivalentGr: ['g', 'kg', 'unit'].includes(newItem.unit) ? parseFloat(newItem.equivalentGr) || 0 : 0,
      recipe: newItem.type === 'prepared'
        ? newItem.recipe
            .filter(r => r.inventoryItem && r.quantity && r.unit)
            .map(r => ({ inventoryItem: r.inventoryItem, quantity: parseFloat(r.quantity) || 0, unit: r.unit }))
        : [],
    };

    setIsSaving(true);
    try {
      if (editingItemId) {
        const res = await api.put(`/inventory/${editingItemId}`, payload);
        setInventory(prev => prev.map(i => i._id === editingItemId ? res.data : i));
        setEditingItemId(null);
        toast({ title: t('productUpdatedToast'), status: 'success', duration: 3000, isClosable: true });
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item) => {
    const itemTab = item.type === 'prepared' ? 1 : 0;
    setActiveTab(itemTab);
    setEditingItemId(item._id);
    setNewItem({
      name: item.name,
      type: item.type || 'raw',
      quantity: item.quantity,
      unit: item.unit,
      equivalentMl: item.equivalentMl,
      equivalentGr: item.equivalentGr,
      cost: item.cost,
      minStock: item.minStock || '',
      supplier: item.supplier || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      recipe: Array.isArray(item.recipe)
        ? item.recipe.map(r => ({
            inventoryItem: r.inventoryItem?._id || r.inventoryItem || '',
            quantity: r.quantity,
            unit: r.unit,
          }))
        : [],
    });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleDeleteItem = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prev => prev.filter(i => i._id !== id));
      toast({ title: t('itemDeletedTitle'), description: t('itemDeletedDescription'), status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({ title: t('errorTitle'), description: t('errorDescription'), status: 'error', duration: 3000, isClosable: true });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setNewItem(EMPTY_FORM);
    setShowForm(false);
  };

  const openAddForm = (type) => {
    setEditingItemId(null);
    setNewItem({ ...EMPTY_FORM, type });
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleTabChange = (idx) => {
    setActiveTab(idx);
    if (showForm && !editingItemId) {
      setNewItem(prev => ({ ...prev, type: idx === 0 ? 'raw' : 'prepared', recipe: [] }));
    }
  };

  const renderItemCard = (item) => (
    <Box
      key={item._id}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={isLow(item) ? 'red.500' : 'whiteAlpha.300'}
      bg={isLow(item) ? 'red.900' : 'whiteAlpha.50'}
    >
      <HStack justify="space-between" width="100%" flexWrap="wrap" gap={2}>
        <VStack align="start" spacing={0} flex="1">
          <HStack spacing={2} flexWrap="wrap">
            <Text fontWeight="semibold">{item.name}</Text>
            {item.tags?.map(tag => (
              <Badge key={tag} colorScheme="blue" fontSize="10px">{tag}</Badge>
            ))}
          </HStack>
          <HStack spacing={3} mt={1} flexWrap="wrap">
            {item.minStock > 0 ? (
              <Tooltip label={isLow(item) ? t('stockBelowMinimum') : t('availableStockRatio')}>
                <Text fontSize="sm">
                  <Text as="span" fontWeight="bold" color={isLow(item) ? 'red.300' : 'white'}>
                    {item.quantity}
                  </Text>
                  <Text as="span" opacity={0.5}> / {item.minStock}</Text>
                  {' '}{item.unit}
                </Text>
              </Tooltip>
            ) : (
              <Text fontSize="sm">
                <Text as="span" fontWeight="bold">{item.quantity}</Text>
                {' '}{item.unit}
              </Text>
            )}
            {item.cost > 0 && (
              <Text fontSize="sm" opacity={0.6}>{t('costDisplay').replace('{amount}', item.cost.toFixed(2))}</Text>
            )}
            {item.supplier && (
              <Text fontSize="sm" opacity={0.6}>{t('supplierDisplay').replace('{name}', item.supplier)}</Text>
            )}
          </HStack>
          {item.type === 'prepared' && item.recipe?.length > 0 && (
            <Text fontSize="xs" opacity={0.5} mt={1}>
              {item.recipe.map(r => `${r.quantity}${r.unit} ${r.inventoryItem?.name ?? '—'}`).join(' · ')}
            </Text>
          )}
        </VStack>
        <HStack>
          {isLow(item) && (
            <Tooltip label={t('stockWarning')}>
              <Box color="red.400"><FaExclamationTriangle /></Box>
            </Tooltip>
          )}
          <IconButton icon={<FaEdit />} onClick={() => handleEditItem(item)} size="sm" colorScheme="yellow" aria-label={t('editProductForm')} isDisabled={!!deletingId || isSaving} />
          <Button colorScheme="red" size="sm" onClick={() => handleDeleteItem(item._id)} isLoading={deletingId === item._id} isDisabled={!!deletingId || isSaving}>
            {t('delete')}
          </Button>
        </HStack>
      </HStack>
    </Box>
  );

  if (isLoading) {
    return <Center py={16}><Spinner size="xl" color="green.400" /></Center>;
  }

  return (
    <Box p={4} color="white">

      {/* Header */}
      <HStack justify="space-between" mb={4} align="center">
        <Text fontSize="2xl">{t('inventoryManagement')}</Text>
        {lowStockItems.length > 0 && (
          <Popover trigger="hover" placement="bottom-end">
            <PopoverTrigger>
              <Box position="relative" cursor="pointer">
                <IconButton
                  icon={<FaExclamationTriangle />}
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  aria-label={t('lowStockAlert')}
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
                  {t('lowStockAlert')} ({lowStockItems.length}):
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
      </HStack>

      {/* Tabs: Materias Primas / Preparados */}
      <Tabs index={activeTab} onChange={handleTabChange} colorScheme="green" variant="enclosed">
        <TabList>
          <Tab>{t('rawIngredients')}</Tab>
          <Tab>{t('preparedIngredients')}</Tab>
        </TabList>

        <TabPanels>
          {/* Tab 0 — Materias Primas */}
          <TabPanel px={0}>
            <HStack justify="flex-end" mb={3}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                size="sm"
                onClick={() => showForm && !editingItemId ? handleCancelEdit() : openAddForm('raw')}
              >
                {showForm && !editingItemId && newItem.type === 'raw' ? t('cancelButton') : t('addRawIngredient')}
              </Button>
            </HStack>
            <VStack spacing={3} align="stretch">
              {rawItems.length === 0 && (
                <Text opacity={0.5} textAlign="center" py={8}>{t('noRawIngredients')}</Text>
              )}
              {rawItems.map(renderItemCard)}
            </VStack>
          </TabPanel>

          {/* Tab 1 — Preparados */}
          <TabPanel px={0}>
            <HStack justify="flex-end" mb={3}>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="purple"
                size="sm"
                onClick={() => showForm && !editingItemId ? handleCancelEdit() : openAddForm('prepared')}
              >
                {showForm && !editingItemId && newItem.type === 'prepared' ? t('cancelButton') : t('addPreparedIngredient')}
              </Button>
            </HStack>
            <Alert status="info" bg="whiteAlpha.100" borderRadius="md" mb={3}>
              <AlertIcon />
              <Text fontSize="sm">{t('preparedItemInfo')}</Text>
            </Alert>
            <VStack spacing={3} align="stretch">
              {preparedItems.length === 0 && (
                <Text opacity={0.5} textAlign="center" py={8}>{t('noPreparedIngredients')}</Text>
              )}
              {preparedItems.map(renderItemCard)}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Form */}
      <Box ref={formRef} />
      <Collapse in={showForm} animateOpacity>
        <Box p={5} mt={4} borderWidth="1px" borderRadius="xl" borderColor="whiteAlpha.300" bg="whiteAlpha.50">
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              {editingItemId ? t('editProductForm') : (newItem.type === 'prepared' ? t('addPreparedIngredient') : t('addRawIngredient'))}
            </Text>
            <Badge colorScheme={newItem.type === 'prepared' ? 'purple' : 'green'} fontSize="sm" px={2} py={1}>
              {newItem.type === 'prepared' ? t('preparedBadge') : t('rawBadge')}
            </Badge>
          </HStack>

          <VStack spacing={4} align="stretch">
            {/* Nombre */}
            <FormControl isRequired>
              <FormLabel fontSize="sm" mb={1}>{t('itemNameInput')}</FormLabel>
              <Input value={newItem.name} name="name" onChange={handleInputChange} />
            </FormControl>

            {/* Cantidad + Unidad */}
            <HStack spacing={3} align="flex-end" flexWrap="wrap">
              <FormControl isRequired flex="1" minW="120px">
                <FormLabel fontSize="sm" mb={1}>{t('quantityPlaceholder')}</FormLabel>
                <NumberInput
                  min={0}
                  value={newItem.quantity}
                  onChange={val => setNewItem(prev => ({ ...prev, quantity: val }))}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl isRequired flex="1" minW="160px">
                <FormLabel fontSize="sm" mb={1}>{t('unitOfMeasureSelect')}</FormLabel>
                <Select
                  name="unit"
                  value={newItem.unit}
                  onChange={handleInputChange}
                  placeholder="—"
                >
                  <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="ml">Mililitros (ml)</option>
                  <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="l">Litros (l)</option>
                  <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="g">Gramos (g)</option>
                  <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="kg">Kilogramos (kg)</option>
                  <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="unit">Unidad</option>
                  <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="bottle">Botella</option>
                </Select>
              </FormControl>
            </HStack>

            {/* Equivalencias */}
            {['ml', 'l', 'bottle'].includes(newItem.unit) && (
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>{t('contentPerUnitInput')}</FormLabel>
                <NumberInput
                  min={0}
                  value={newItem.equivalentMl}
                  onChange={val => setNewItem(prev => ({ ...prev, equivalentMl: val }))}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            )}
            {['g', 'kg', 'unit'].includes(newItem.unit) && (
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>{t('approximateWeightInput')}</FormLabel>
                <NumberInput
                  min={0}
                  value={newItem.equivalentGr}
                  onChange={val => setNewItem(prev => ({ ...prev, equivalentGr: val }))}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            )}

            {/* Costo + Stock mínimo */}
            <HStack spacing={3} flexWrap="wrap">
              <FormControl flex="1" minW="140px">
                <FormLabel fontSize="sm" mb={1}>{t('productCostInput')}</FormLabel>
                <NumberInput
                  min={0}
                  value={newItem.cost}
                  onChange={val => setNewItem(prev => ({ ...prev, cost: val }))}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl flex="1" minW="140px">
                <FormLabel fontSize="sm" mb={1}>{t('minimumStockInput')}</FormLabel>
                <NumberInput
                  min={0}
                  value={newItem.minStock}
                  onChange={val => setNewItem(prev => ({ ...prev, minStock: val }))}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </HStack>

            {/* Proveedor (solo para raw) */}
            {newItem.type === 'raw' && (
              <FormControl>
                <FormLabel fontSize="sm" mb={1}>{t('supplierInput')}</FormLabel>
                <Input value={newItem.supplier} name="supplier" onChange={handleInputChange} />
              </FormControl>
            )}

            {/* Receta (solo para prepared) */}
            {newItem.type === 'prepared' && (
              <Box>
                <Divider borderColor="whiteAlpha.200" mb={3} />
                <FormLabel fontSize="sm" mb={2}>{t('recipeComposition')}</FormLabel>
                <VStack spacing={2} align="stretch">
                  {newItem.recipe.map((row, idx) => (
                    <HStack key={idx} spacing={2} flexWrap="wrap">
                      <Select
                        placeholder={t('selectInventoryItem')}
                        value={row.inventoryItem}
                        onChange={e => updateRecipeRow(idx, 'inventoryItem', e.target.value)}
                        flex="2"
                        minW="160px"
                        size="sm"
                      >
                        {rawItems.map(item => (
                          <option key={item._id} value={item._id}
                            style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                          >
                            {item.name} ({item.unit})
                          </option>
                        ))}
                      </Select>
                      <NumberInput
                        min={0}
                        value={row.quantity}
                        onChange={val => updateRecipeRow(idx, 'quantity', val)}
                        flex="1"
                        minW="80px"
                        size="sm"
                      >
                        <NumberInputField placeholder="Qty" />
                      </NumberInput>
                      <Select
                        value={row.unit}
                        onChange={e => updateRecipeRow(idx, 'unit', e.target.value)}
                        placeholder="—"
                        flex="1"
                        minW="100px"
                        size="sm"
                      >
                        <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="ml">ml</option>
                        <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="l">l</option>
                        <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="g">g</option>
                        <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="kg">kg</option>
                        <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="unit">unit</option>
                        <option style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }} value="bottle">bottle</option>
                      </Select>
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        aria-label="Remove ingredient"
                        onClick={() => removeRecipeRow(idx)}
                      />
                    </HStack>
                  ))}
                  <Button
                    leftIcon={<FaPlus />}
                    size="sm"
                    variant="ghost"
                    colorScheme="purple"
                    onClick={addRecipeRow}
                    alignSelf="flex-start"
                  >
                    {t('addRecipeIngredient')}
                  </Button>
                </VStack>
                <Divider borderColor="whiteAlpha.200" mt={3} />
              </Box>
            )}

            <Divider borderColor="whiteAlpha.200" />

            {/* Tags */}
            <Box>
              <FormLabel fontSize="sm" mb={2}>{t('tagsLabel')}</FormLabel>
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
                  placeholder={t('customTagInput')}
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                  maxW="220px"
                />
                <IconButton icon={<FaPlus />} size="sm" onClick={addCustomTag} aria-label="Agregar etiqueta" />
              </HStack>
            </Box>

            {/* Actions */}
            <HStack>
              <Button colorScheme="green" onClick={handleAddOrUpdateItem} flex="1" isLoading={isSaving} isDisabled={!!deletingId}>
                {editingItemId ? t('saveChangesButton') : t('addItem')}
              </Button>
              <Button variant="ghost" onClick={handleCancelEdit} isDisabled={isSaving}>
                {t('cancelButton')}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
}

export default InventoryManagement;
