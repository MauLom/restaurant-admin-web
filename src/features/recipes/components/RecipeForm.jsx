import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Input, Textarea, Select, FormControl, FormLabel, VStack, HStack, Box, Text,
  IconButton, Divider, NumberInput, NumberInputField, Collapse,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaChevronUp, FaChevronDown, FaCamera } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import ImageInput from './ImageInput';

const UNITS = [
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

const emptyIngredient = () => ({ name: '', quantity: '', unit: 'unidad', image: { url: '', isUpload: false } });
const emptyStep = (order) => ({ order, description: '', image: { url: '', isUpload: false } });

const EMPTY_FORM = {
  name: '',
  description: '',
  mainImage: { url: '', isUpload: false },
  area: 'kitchen',
  difficulty: 'medium',
  servings: 1,
  prepTime: 0,
  cookTime: 0,
  ingredients: [emptyIngredient()],
  steps: [emptyStep(1)],
};

function RecipeForm({ isOpen, onClose, onSave, initialData, ingredientImageMap = {} }) {
  const { currentTheme } = useTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [openIngImg, setOpenIngImg] = useState({});

  const primary = currentTheme.colors.primary[500];
  const surface = currentTheme.colors.interface?.surface || '#333';
  const textColor = currentTheme.colors.text;

  useEffect(() => {
    if (!isOpen) return;
    setOpenIngImg({});
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        mainImage: initialData.mainImage || { url: '', isUpload: false },
        area: initialData.area || 'kitchen',
        difficulty: initialData.difficulty || 'medium',
        servings: initialData.servings || 1,
        prepTime: initialData.prepTime || 0,
        cookTime: initialData.cookTime || 0,
        ingredients: initialData.ingredients?.length
          ? initialData.ingredients.map(i => ({
              name: i.name || '',
              quantity: i.quantity ?? '',
              unit: i.unit || 'unidad',
              image: i.image || { url: '', isUpload: false },
            }))
          : [emptyIngredient()],
        steps: initialData.steps?.length
          ? [...initialData.steps]
              .sort((a, b) => a.order - b.order)
              .map((s, i) => ({
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

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      servings: Number(form.servings) || 1,
      prepTime: Number(form.prepTime) || 0,
      cookTime: Number(form.cookTime) || 0,
      ingredients: form.ingredients
        .filter(i => i.name.trim())
        .map(i => ({ ...i, quantity: Number(i.quantity) || 0 })),
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
          {initialData ? 'Editar receta' : 'Nueva receta'}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack align="stretch" spacing={6}>

            {/* ── Información básica ── */}
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Nombre</FormLabel>
                <Input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Ej: Risotto de champiñones"
                  size="sm"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Descripción</FormLabel>
                <Textarea
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Descripción breve..."
                  size="sm"
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm">Imagen principal</FormLabel>
                <ImageInput
                  value={form.mainImage}
                  onChange={v => setField('mainImage', v)}
                  placeholder="https://... o sube una imagen"
                  previewMaxH="160px"
                />
              </FormControl>

              <HStack spacing={3} flexWrap="wrap">
                <FormControl flex="1" minW="130px">
                  <FormLabel fontSize="sm">Área</FormLabel>
                  <Select value={form.area} onChange={e => setField('area', e.target.value)} size="sm">
                    <option value="kitchen">🍳 Cocina</option>
                    <option value="bar">🍹 Barra</option>
                  </Select>
                </FormControl>
                <FormControl flex="1" minW="130px">
                  <FormLabel fontSize="sm">Dificultad</FormLabel>
                  <Select value={form.difficulty} onChange={e => setField('difficulty', e.target.value)} size="sm">
                    <option value="easy">Fácil</option>
                    <option value="medium">Media</option>
                    <option value="hard">Difícil</option>
                  </Select>
                </FormControl>
                <FormControl flex="1" minW="100px">
                  <FormLabel fontSize="sm">Porciones</FormLabel>
                  <NumberInput min={1} value={form.servings} onChange={v => setField('servings', v)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl flex="1" minW="100px">
                  <FormLabel fontSize="sm">Prep (min)</FormLabel>
                  <NumberInput min={0} value={form.prepTime} onChange={v => setField('prepTime', v)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl flex="1" minW="100px">
                  <FormLabel fontSize="sm">Cocción (min)</FormLabel>
                  <NumberInput min={0} value={form.cookTime} onChange={v => setField('cookTime', v)} size="sm">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>
            </VStack>

            <Divider borderColor={`${primary}33`} />

            {/* ── Ingredientes ── */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold" color={primary}>Ingredientes</Text>
                <Button size="xs" leftIcon={<FaPlus />} onClick={addIngredient} colorScheme="blue" variant="ghost">
                  Agregar
                </Button>
              </HStack>

              <VStack align="stretch" spacing={2}>
                {form.ingredients.map((ing, i) => (
                  <Box
                    key={i}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={`${primary}44`}
                    borderLeft="3px solid"
                    borderLeftColor={primary}
                    bg={i % 2 === 0 ? `${primary}0A` : 'blackAlpha.200'}
                    overflow="hidden"
                  >
                    {/* ── Fila principal compacta ── */}
                    <HStack spacing={2} px={3} py={2} flexWrap="wrap">
                      {/* Número */}
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={primary}
                        opacity={0.8}
                        minW="18px"
                        textAlign="center"
                      >
                        {i + 1}.
                      </Text>

                      {/* Nombre */}
                      <Input
                        flex="2"
                        minW="120px"
                        value={ing.name}
                        onChange={e => updateIngredient(i, 'name', e.target.value)}
                        placeholder="Ingrediente"
                        size="sm"
                        variant="filled"
                      />

                      {/* Cantidad */}
                      <NumberInput
                        flex="1"
                        minW="70px"
                        maxW="90px"
                        min={0}
                        value={ing.quantity}
                        onChange={v => updateIngredient(i, 'quantity', v)}
                        size="sm"
                      >
                        <NumberInputField placeholder="Cant." variant="filled" />
                      </NumberInput>

                      {/* Unidad */}
                      <Select
                        flex="1"
                        minW="100px"
                        maxW="130px"
                        value={ing.unit}
                        onChange={e => updateIngredient(i, 'unit', e.target.value)}
                        size="sm"
                        variant="filled"
                      >
                        {UNITS.map(u => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </Select>

                      {/* Toggle imagen */}
                      <IconButton
                        icon={<FaCamera />}
                        size="sm"
                        variant="ghost"
                        colorScheme={ing.image?.url ? 'green' : 'gray'}
                        opacity={ing.image?.url ? 1 : 0.4}
                        onClick={() => setOpenIngImg(prev => ({ ...prev, [i]: !prev[i] }))}
                        aria-label="Imagen"
                      />

                      {/* Eliminar */}
                      <IconButton
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        opacity={0.6}
                        _hover={{ opacity: 1 }}
                        onClick={() => removeIngredient(i)}
                        aria-label="Eliminar"
                        isDisabled={form.ingredients.length === 1}
                      />
                    </HStack>

                    {/* ── Imagen colapsable ── */}
                    <Collapse in={!!openIngImg[i]} animateOpacity>
                      <Box px={3} pb={2} borderTop="1px solid" borderColor={`${primary}22`}>
                        <ImageInput
                          value={ing.image}
                          onChange={v => updateIngredient(i, 'image', v)}
                          placeholder="URL de imagen del ingrediente..."
                          previewMaxH="80px"
                        />
                      </Box>
                    </Collapse>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Divider borderColor={`${primary}33`} />

            {/* ── Pasos ── */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="semibold" color={primary}>Pasos de preparación</Text>
                <Button size="xs" leftIcon={<FaPlus />} onClick={addStep} colorScheme="blue" variant="ghost">
                  Agregar paso
                </Button>
              </HStack>

              <VStack align="stretch" spacing={4}>
                {form.steps.map((step, i) => (
                  <Box
                    key={i}
                    p={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor={`${primary}22`}
                    bg={`${primary}08`}
                  >
                    <HStack mb={2} spacing={2}>
                      <Box
                        minW="28px"
                        h="28px"
                        borderRadius="full"
                        bg={primary}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" fontWeight="bold" color="white">{i + 1}</Text>
                      </Box>
                      <Textarea
                        flex="1"
                        value={step.description}
                        onChange={e => updateStep(i, 'description', e.target.value)}
                        placeholder={`Descripción del paso ${i + 1}...`}
                        size="sm"
                        rows={2}
                      />
                      <VStack spacing={1}>
                        <IconButton
                          icon={<FaChevronUp />}
                          size="xs"
                          variant="ghost"
                          onClick={() => moveStep(i, -1)}
                          isDisabled={i === 0}
                          aria-label="Subir paso"
                        />
                        <IconButton
                          icon={<FaChevronDown />}
                          size="xs"
                          variant="ghost"
                          onClick={() => moveStep(i, 1)}
                          isDisabled={i === form.steps.length - 1}
                          aria-label="Bajar paso"
                        />
                        <IconButton
                          icon={<FaTrash />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeStep(i)}
                          isDisabled={form.steps.length === 1}
                          aria-label="Eliminar paso"
                        />
                      </VStack>
                    </HStack>

                    <FormControl>
                      <FormLabel fontSize="xs" mb={1}>Imagen del resultado (opcional)</FormLabel>
                      <ImageInput
                        value={step.image}
                        onChange={v => updateStep(i, 'image', v)}
                        placeholder="URL de imagen del resultado..."
                        previewMaxH="80px"
                      />
                    </FormControl>
                  </Box>
                ))}
              </VStack>
            </Box>

          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={`${primary}33`} gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={saving}
            isDisabled={!form.name.trim()}
          >
            {initialData ? 'Guardar cambios' : 'Crear receta'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RecipeForm;
