import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Input, Textarea, Select, FormControl, FormLabel, VStack, HStack, Box, Text,
  IconButton, Divider, NumberInput, NumberInputField, Badge, Tooltip,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaChevronUp, FaChevronDown, FaDollarSign } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import ImageInput from './ImageInput';
import { calcIngredientCost, calcTotalCost, formatCost, calcMargin } from '../costUtils';

export const UNITS = [
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'taza', label: 'taza(s)' },
  { value: 'cucharada', label: 'cucharada(s)' },
  { value: 'cucharadita', label: 'cucharadita(s)' },
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'oz', label: 'oz' },
  { value: 'lb', label: 'lb' },
  { value: 'unidad', label: 'unidad(es)' },
  { value: 'pizca', label: 'pizca(s)' },
  { value: 'rebanada', label: 'rebanada(s)' },
  { value: 'diente', label: 'diente(s)' },
  { value: 'manojo', label: 'manojo(s)' },
  { value: 'al_gusto', label: 'al gusto' },
];

const emptyIngredient = () => ({
  name: '', quantity: '', unit: 'unidad',
  image: { url: '', isUpload: false }, inventoryItemId: '',
});
const emptyStep = (order) => ({ order, description: '', image: { url: '', isUpload: false } });

const EMPTY_FORM = {
  name: '', description: '',
  mainImage: { url: '', isUpload: false },
  area: 'kitchen', difficulty: 'medium',
  servings: 1, prepTime: 0, cookTime: 0, price: '',
  ingredients: [emptyIngredient()],
  steps: [emptyStep(1)],
};

function RecipeForm({ isOpen, onClose, onSave, initialData, ingredientImageMap = {}, inventoryItems = [] }) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [openIngImg, setOpenIngImg] = useState({});

  const primary = currentTheme.colors.primary[500];
  const surface = currentTheme.colors.interface?.surface || '#333';
  const textColor = currentTheme.colors.text;

  // Build inventory lookup map for cost calculation
  const inventoryMap = useMemo(() => {
    const map = {};
    inventoryItems.forEach(item => { map[item._id] = item; });
    return map;
  }, [inventoryItems]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        mainImage: initialData.mainImage || { url: '', isUpload: false },
        area: initialData.area || 'kitchen',
        difficulty: initialData.difficulty || 'medium',
        price: initialData.price || '',
        servings: initialData.servings || 1,
        prepTime: initialData.prepTime || 0,
        cookTime: initialData.cookTime || 0,
        ingredients: initialData.ingredients?.length
          ? initialData.ingredients.map(i => ({
              name: i.name || '',
              quantity: i.quantity ?? '',
              unit: i.unit || 'unidad',
              image: i.image || { url: '', isUpload: false },
              inventoryItemId: i.inventoryItemId || '',
            }))
          : [emptyIngredient()],
        steps: initialData.steps?.length
          ? [...initialData.steps].sort((a, b) => a.order - b.order).map((s, i) => ({
              order: i + 1,
              description: s.description || '',
              image: s.image || { url: '', isUpload: false },
            }))
          : [emptyStep(1)],
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [isOpen, initialData]);

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const updateIngredient = (i, field, value) =>
    setForm(f => {
      const arr = [...f.ingredients];
      const updated = { ...arr[i], [field]: value };
      if (field === 'name') {
        const key = value.trim().toLowerCase();
        const mapped = ingredientImageMap[key];
        if (mapped && !arr[i].image?.url) {
          updated.image = mapped;
        }
      }
      arr[i] = updated;
      return { ...f, ingredients: arr };
    });

  const addIngredient = () =>
    setForm(f => ({ ...f, ingredients: [...f.ingredients, emptyIngredient()] }));

  const removeIngredient = (i) =>
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, idx) => idx !== i) }));

  const updateStep = (i, field, value) =>
    setForm(f => {
      const arr = [...f.steps];
      arr[i] = { ...arr[i], [field]: value };
      return { ...f, steps: arr };
    });

  const addStep = () =>
    setForm(f => ({ ...f, steps: [...f.steps, emptyStep(f.steps.length + 1)] }));

  const removeStep = (i) =>
    setForm(f => ({
      ...f,
      steps: f.steps.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })),
    }));

  const moveStep = (i, dir) => {
    const j = i + dir;
    setForm(f => {
      const arr = [...f.steps];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...f, steps: arr.map((s, idx) => ({ ...s, order: idx + 1 })) };
    });
  };

  const totalCost = calcTotalCost(form.ingredients, inventoryMap);
  const salePrice = parseFloat(form.price) || 0;
  const margin = calcMargin(salePrice, totalCost);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      servings: Number(form.servings) || 1,
      prepTime: Number(form.prepTime) || 0,
      cookTime: Number(form.cookTime) || 0,
      ingredients: form.ingredients
        .filter(i => i.name.trim())
        .map(i => ({
          ...i,
          quantity: Number(i.quantity) || 0,
          inventoryItemId: i.inventoryItemId || null,
        })),
      steps: form.steps.filter(s => s.description.trim()),
    };
    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={surface} color={textColor} borderRadius="2xl" mx={4}>
        <ModalHeader borderBottom="1px solid" borderColor={`${primary}33`} color={primary}>
          {initialData ? t('editRecipeTitle') : t('newRecipeTitle')}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack align="stretch" spacing={6}>

            {/* ── Información básica ── */}
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('nameLabel')}</FormLabel>
                <Input value={form.name} onChange={e => setField('name', e.target.value)}
                  placeholder={t('nameExamplePlaceholder')} size="sm" />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">{t('descriptionLabel')}</FormLabel>
                <Textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  placeholder={t('recipeDescriptionPlaceholder')} size="sm" rows={2} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">{t('mainImageLabel')}</FormLabel>
                <ImageInput value={form.mainImage} onChange={v => setField('mainImage', v)}
                  placeholder="https://... o sube una imagen" previewMaxH="160px" />
              </FormControl>

              <HStack spacing={3} flexWrap="wrap">
                <FormControl flex="1" minW="130px">
                  <FormLabel fontSize="sm">{t('areaLabel')}</FormLabel>
                  <Select value={form.area} onChange={e => setField('area', e.target.value)} size="sm">
                    <option value="kitchen">🍳 {t('areaKitchen')}</option>
                    <option value="bar">🍹 {t('areaBar')}</option>
                  </Select>
                </FormControl>
                <FormControl flex="1" minW="130px">
                  <FormLabel fontSize="sm">{t('difficultyLabel')}</FormLabel>
                  <Select value={form.difficulty} onChange={e => setField('difficulty', e.target.value)} size="sm">
                    <option value="easy">{t('difficultyEasy')}</option>
                    <option value="medium">{t('difficultyMedium')}</option>
                    <option value="hard">{t('difficultyHard')}</option>
                  </Select>
                </FormControl>
                <FormControl flex="1" minW="90px">
                  <FormLabel fontSize="sm">{t('servingsCountLabel')}</FormLabel>
                  <NumberInput min={1} value={form.servings} onChange={v => setField('servings', v)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl flex="1" minW="90px">
                  <FormLabel fontSize="sm">{t('prepTimeLabel')}</FormLabel>
                  <NumberInput min={0} value={form.prepTime} onChange={v => setField('prepTime', v)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl flex="1" minW="90px">
                  <FormLabel fontSize="sm">{t('cookingTimeLabel')}</FormLabel>
                  <NumberInput min={0} value={form.cookTime} onChange={v => setField('cookTime', v)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl flex="1" minW="100px">
                  <FormLabel fontSize="sm">{t('salePriceLabel')}</FormLabel>
                  <NumberInput min={0} value={form.price} onChange={v => setField('price', v)} size="sm">
                    <NumberInputField placeholder="$0.00" />
                  </NumberInput>
                </FormControl>
              </HStack>
            </VStack>

            <Divider borderColor={`${primary}33`} />

            {/* ── Ingredientes ── */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <HStack spacing={2}>
                  <Text fontWeight="semibold" color={primary}>{t('ingredientsLabel')}</Text>
                  {totalCost != null && (
                    <Badge colorScheme="green" fontSize="11px" px={2} py={0.5} borderRadius="full">
                      <HStack spacing={1}>
                        <FaDollarSign size="10px" />
                        <Text>{t('totalCost')}: {formatCost(totalCost)}</Text>
                      </HStack>
                    </Badge>
                  )}
                </HStack>
                <Button size="xs" leftIcon={<FaPlus />} onClick={addIngredient} colorScheme="blue" variant="ghost">
                  {t('addIngredientButton')}
                </Button>
              </HStack>

              <VStack align="stretch" spacing={4}>
                {form.ingredients.map((ing, i) => {
                  const invItem = inventoryMap[ing.inventoryItemId];
                  const ingCost = calcIngredientCost(invItem, ing.quantity, ing.unit);
                  return (
                    <Box key={i} p={3} borderRadius="lg" border="1px solid" borderColor={`${primary}22`} bg={`${primary}08`}>
                      <HStack align="flex-start" spacing={2} mb={2} flexWrap="wrap">
                        <FormControl flex="2" minW="120px">
                          <FormLabel fontSize="xs" mb={1}>{t('ingredientName')}</FormLabel>
                          <Input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)}
                            placeholder={t('ingredientNamePlaceholder')} size="sm" />
                        </FormControl>
                        <FormControl flex="1" minW="80px">
                          <FormLabel fontSize="xs" mb={1}>{t('quantityLabel')}</FormLabel>
                          <NumberInput min={0} value={ing.quantity} onChange={v => updateIngredient(i, 'quantity', v)} size="sm">
                            <NumberInputField placeholder="0" />
                          </NumberInput>
                        </FormControl>
                        <FormControl flex="1" minW="110px">
                          <FormLabel fontSize="xs" mb={1}>{t('unitLabel')}</FormLabel>
                          <Select value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} size="sm">
                            {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                          </Select>
                        </FormControl>
                        <Box pt={6}>
                          <IconButton icon={<FaTrash />} size="sm" colorScheme="red" variant="ghost"
                            onClick={() => removeIngredient(i)} aria-label="Eliminar"
                            isDisabled={form.ingredients.length === 1} />
                        </Box>
                      </HStack>

                      {/* Vínculo a inventario */}
                      <FormControl mb={2}>
                        <FormLabel fontSize="xs" mb={1}>
                          {t('linkToInventory')}
                        </FormLabel>
                        <HStack>
                          <Select
                            value={ing.inventoryItemId}
                            onChange={e => updateIngredient(i, 'inventoryItemId', e.target.value)}
                            size="sm"
                            placeholder={t('linkInventoryPlaceholder')}
                          >
                            {inventoryItems.map(inv => (
                              <option key={inv._id} value={inv._id}>
                                {inv.name} ({inv.unit}{inv.cost ? ` · $${inv.cost}` : ''})
                              </option>
                            ))}
                          </Select>
                          {ingCost != null && (
                            <Tooltip label={`Costo estimado para ${ing.quantity} ${ing.unit}`}>
                              <Badge colorScheme="green" whiteSpace="nowrap" px={2} py={1} borderRadius="md">
                                ~{formatCost(ingCost)}
                              </Badge>
                            </Tooltip>
                          )}
                          {ing.inventoryItemId && ingCost == null && (
                            <Tooltip label={t('incompatibleUnitsTooltip')}>
                              <Badge colorScheme="orange" px={2} py={1} borderRadius="md">N/A</Badge>
                            </Tooltip>
                          )}
                        </HStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="xs" mb={1}>{t('ingredientImageLabel')}</FormLabel>
                        <ImageInput value={ing.image} onChange={v => updateIngredient(i, 'image', v)}
                          placeholder="URL de imagen..." previewMaxH="80px" />
                      </FormControl>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            {/* ── Panel de precio / costo / margen ── */}
            {(totalCost != null || salePrice > 0) && (
              <Box p={4} borderRadius="xl" border="1px solid" borderColor={`${primary}33`} bg={`${primary}08`}>
                <Text fontWeight="semibold" color={primary} mb={3} fontSize="sm">{t('priceAnalysisLabel')}</Text>
                <HStack spacing={6} flexWrap="wrap">
                  {totalCost != null && (
                    <Box>
                      <Text fontSize="xs" opacity={0.6} mb={0.5}>{t('costIngredientsLabel')}</Text>
                      <Text fontWeight="bold" color="red.400">{formatCost(totalCost)}</Text>
                      {form.servings > 1 && (
                        <Text fontSize="xs" opacity={0.5}>{formatCost(totalCost / form.servings)} / porción</Text>
                      )}
                    </Box>
                  )}
                  {salePrice > 0 && (
                    <Box>
                      <Text fontSize="xs" opacity={0.6} mb={0.5}>{t('salePriceAnalysis')}</Text>
                      <Text fontWeight="bold" color="blue.400">{formatCost(salePrice)}</Text>
                      {form.servings > 1 && (
                        <Text fontSize="xs" opacity={0.5}>{formatCost(salePrice / form.servings)} / porción</Text>
                      )}
                    </Box>
                  )}
                  {margin && (
                    <Box>
                      <Text fontSize="xs" opacity={0.6} mb={0.5}>{t('profitLabelForm')}</Text>
                      <Text fontWeight="bold" color={margin.profit >= 0 ? 'green.400' : 'red.400'}>
                        {formatCost(margin.profit)}
                      </Text>
                      <Text fontSize="xs" opacity={0.7} color={margin.marginPct >= 0 ? 'green.400' : 'red.400'}>
                        {margin.marginPct.toFixed(1)}% margen
                      </Text>
                    </Box>
                  )}
                  {totalCost != null && salePrice <= 0 && (
                    <Tooltip label="Basado en costo × 3 (regla general de restauración)">
                      <Button
                        size="xs" variant="ghost" colorScheme="blue"
                        onClick={() => setField('price', (totalCost * 3).toFixed(2))}
                      >
                        {t('suggestedPriceButton')}
                      </Button>
                    </Tooltip>
                  )}
                </HStack>
              </Box>
            )}

            <Divider borderColor={`${primary}33`} />

            {/* ── Pasos ── */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold" color={primary}>{t('preparationStepsLabel')}</Text>
                <Button size="xs" leftIcon={<FaPlus />} onClick={addStep} colorScheme="blue" variant="ghost">
                  {t('addStepButton')}
                </Button>
              </HStack>

              <VStack align="stretch" spacing={4}>
                {form.steps.map((step, i) => (
                  <Box key={i} p={3} borderRadius="lg" border="1px solid" borderColor={`${primary}22`} bg={`${primary}08`}>
                    <HStack mb={2} spacing={2}>
                      <Box minW="28px" h="28px" borderRadius="full" bg={primary}
                        display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="xs" fontWeight="bold" color="white">{i + 1}</Text>
                      </Box>
                      <Textarea flex="1" value={step.description}
                        onChange={e => updateStep(i, 'description', e.target.value)}
                        placeholder={`Descripción del paso ${i + 1}...`} size="sm" rows={2} />
                      <VStack spacing={1}>
                        <IconButton icon={<FaChevronUp />} size="xs" variant="ghost"
                          onClick={() => moveStep(i, -1)} isDisabled={i === 0} aria-label="Subir" />
                        <IconButton icon={<FaChevronDown />} size="xs" variant="ghost"
                          onClick={() => moveStep(i, 1)} isDisabled={i === form.steps.length - 1} aria-label="Bajar" />
                        <IconButton icon={<FaTrash />} size="xs" colorScheme="red" variant="ghost"
                          onClick={() => removeStep(i)} isDisabled={form.steps.length === 1} aria-label="Eliminar" />
                      </VStack>
                    </HStack>
                    <FormControl>
                      <FormLabel fontSize="xs" mb={1}>{t('stepResultImageLabel')}</FormLabel>
                      <ImageInput value={step.image} onChange={v => updateStep(i, 'image', v)}
                        placeholder="URL de imagen del resultado..." previewMaxH="80px" />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </Box>

          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={`${primary}33`} gap={3} flexWrap="wrap">
          {totalCost != null && (
            <Badge colorScheme="red" variant="subtle" fontSize="xs" px={2} py={1} borderRadius="full">
              Costo: {formatCost(totalCost)}{form.servings > 1 ? ` · ${formatCost(totalCost / form.servings)}/porc.` : ''}
            </Badge>
          )}
          {salePrice > 0 && (
            <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={1} borderRadius="full">
              Venta: {formatCost(salePrice)}
            </Badge>
          )}
          {margin && (
            <Badge colorScheme={margin.marginPct >= 0 ? 'green' : 'red'} fontSize="xs" px={2} py={1} borderRadius="full">
              {margin.marginPct.toFixed(1)}% margen
            </Badge>
          )}
          <Button variant="ghost" onClick={onClose}>{t('cancelFormButton')}</Button>
          <Button colorScheme="blue" onClick={handleSave} isLoading={saving} isDisabled={!form.name.trim()}>
            {initialData ? t('saveRecipeChangesButton') : t('createRecipeButton')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RecipeForm;
