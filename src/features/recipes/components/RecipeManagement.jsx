import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, SimpleGrid, Button, ButtonGroup, HStack, Heading, Text, Spinner, Center,
  Input, InputGroup, InputLeftElement,
  useDisclosure,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from '@chakra-ui/react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import api from '../../../services/api';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import RecipeForm from './RecipeForm';

function RecipeManagement() {
  const { currentTheme } = useTheme();
  const toast = useCustomToast();
  const primary = currentTheme.colors.primary[500];
  const textColor = currentTheme.colors.text;

  const [recipes, setRecipes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const cancelRef = useRef();

  const detailDisc = useDisclosure();
  const formDisc = useDisclosure();
  const deleteDisc = useDisclosure();

  // Build inventory map for cost calculations
  const inventoryMap = useMemo(() => {
    const map = {};
    inventoryItems.forEach(item => { map[item._id] = item; });
    return map;
  }, [inventoryItems]);

  // Ingredient image map: if ingredient appears in another recipe, suggest its image
  const ingredientImageMap = useMemo(() => {
    const map = {};
    if (!Array.isArray(recipes)) return map;
    recipes.forEach(r => {
      r.ingredients?.forEach(ing => {
        const key = ing.name?.trim().toLowerCase();
        if (key && ing.image?.url && !map[key]) map[key] = ing.image;
      });
    });
    return map;
  }, [recipes]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipesRes, inventoryRes] = await Promise.all([
        api.get('/recipes'),
        api.get('/inventory'),
      ]);
      setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : []);
      setInventoryItems(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
    } catch {
      toast({ title: 'Error al cargar datos', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (payload) => {
    try {
      if (editingRecipe) {
        const res = await api.put(`/recipes/${editingRecipe._id}`, payload);
        setRecipes(prev => prev.map(r => r._id === editingRecipe._id ? res.data : r));
        toast({ title: 'Receta actualizada', status: 'success', duration: 2500 });
      } else {
        const res = await api.post('/recipes', payload);
        setRecipes(prev => [...prev, res.data]);
        toast({ title: 'Receta creada', status: 'success', duration: 2500 });
      }
    } catch {
      toast({ title: 'Error al guardar la receta', status: 'error', duration: 3000 });
      throw new Error('save failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingRecipe) return;
    setDeleting(true);
    try {
      await api.delete(`/recipes/${deletingRecipe._id}`);
      setRecipes(prev => prev.filter(r => r._id !== deletingRecipe._id));
      toast({ title: 'Receta eliminada', status: 'success', duration: 2500 });
      deleteDisc.onClose();
    } catch {
      toast({ title: 'Error al eliminar', status: 'error', duration: 3000 });
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => { setEditingRecipe(null); formDisc.onOpen(); };
  const openEdit = (recipe) => { setEditingRecipe(recipe); formDisc.onOpen(); };
  const openDelete = (recipe) => { setDeletingRecipe(recipe); deleteDisc.onOpen(); };
  const openDetail = (recipe) => { setSelectedRecipe(recipe); detailDisc.onOpen(); };

  const displayed = recipes
    .filter(r => {
      const q = search.toLowerCase();
      return (r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
        && (areaFilter === 'all' || r.area === areaFilter);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box>
      <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
        <Heading size="md" color={primary}>Libro de recetas</Heading>
        <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue" onClick={openCreate}>
          Nueva receta
        </Button>
      </HStack>

      <HStack mb={5} spacing={3} flexWrap="wrap">
        <InputGroup size="sm" maxW="260px">
          <InputLeftElement pointerEvents="none"><FaSearch color="gray" /></InputLeftElement>
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar receta..." borderRadius="lg" />
        </InputGroup>
        <ButtonGroup size="sm" isAttached variant="outline">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'kitchen', label: '🍳 Cocina' },
            { value: 'bar', label: '🍹 Barra' },
          ].map(opt => (
            <Button key={opt.value} onClick={() => setAreaFilter(opt.value)}
              bg={areaFilter === opt.value ? primary : 'transparent'}
              color={areaFilter === opt.value ? 'white' : textColor}
              borderColor={`${primary}66`} _hover={{ bg: `${primary}33` }}>
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
      </HStack>

      {loading ? (
        <Center py={16}><Spinner size="xl" color={primary} /></Center>
      ) : displayed.length === 0 ? (
        <Center py={16} flexDirection="column" gap={4}>
          <Text fontSize="4xl">📖</Text>
          <Text color={textColor} opacity={0.6}>
            {search || areaFilter !== 'all'
              ? 'No se encontraron recetas con ese filtro.'
              : 'Aún no hay recetas. ¡Agrega la primera!'}
          </Text>
          {!search && areaFilter === 'all' && (
            <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue" onClick={openCreate}>
              Agregar primera receta
            </Button>
          )}
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
          {displayed.map(r => (
            <RecipeCard key={r._id} recipe={r} inventoryMap={inventoryMap} onClick={() => openDetail(r)} />
          ))}
        </SimpleGrid>
      )}

      <RecipeDetail recipe={selectedRecipe} isOpen={detailDisc.isOpen} onClose={detailDisc.onClose}
        onEdit={openEdit} onDelete={openDelete} inventoryMap={inventoryMap} />

      <RecipeForm isOpen={formDisc.isOpen} onClose={formDisc.onClose} onSave={handleSave}
        initialData={editingRecipe} inventoryItems={inventoryItems}
        ingredientImageMap={ingredientImageMap} />

      <AlertDialog isOpen={deleteDisc.isOpen} leastDestructiveRef={cancelRef} onClose={deleteDisc.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Eliminar receta</AlertDialogHeader>
            <AlertDialogBody>
              ¿Seguro que quieres eliminar "{deletingRecipe?.name}"? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDisc.onClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={deleting} ml={3}>Eliminar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default RecipeManagement;
