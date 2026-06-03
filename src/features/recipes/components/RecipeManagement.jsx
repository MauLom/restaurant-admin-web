import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/recipes');
      setRecipes(res.data);
    } catch {
      toast({ title: 'Error al cargar recetas', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

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

  const openCreate = () => {
    setEditingRecipe(null);
    formDisc.onOpen();
  };

  const openEdit = (recipe) => {
    setEditingRecipe(recipe);
    formDisc.onOpen();
  };

  const openDelete = (recipe) => {
    setDeletingRecipe(recipe);
    deleteDisc.onOpen();
  };

  const openDetail = (recipe) => {
    setSelectedRecipe(recipe);
    detailDisc.onOpen();
  };

  const displayed = recipes
    .filter(r => {
      const q = search.toLowerCase();
      const matchSearch = r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
      const matchArea = areaFilter === 'all' || r.area === areaFilter;
      return matchSearch && matchArea;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
        <Heading size="md" color={primary}>Libro de recetas</Heading>
        <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue" onClick={openCreate}>
          Nueva receta
        </Button>
      </HStack>

      {/* Búsqueda + filtros */}
      <HStack mb={5} spacing={3} flexWrap="wrap">
        <InputGroup size="sm" maxW="260px">
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray" />
          </InputLeftElement>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar receta..."
            borderRadius="lg"
          />
        </InputGroup>

        <ButtonGroup size="sm" isAttached variant="outline">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'kitchen', label: '🍳 Cocina' },
            { value: 'bar', label: '🍹 Barra' },
          ].map(opt => (
            <Button
              key={opt.value}
              onClick={() => setAreaFilter(opt.value)}
              bg={areaFilter === opt.value ? primary : 'transparent'}
              color={areaFilter === opt.value ? 'white' : textColor}
              borderColor={`${primary}66`}
              _hover={{ bg: `${primary}33` }}
            >
              {opt.label}
            </Button>
          ))}
        </ButtonGroup>
      </HStack>

      {/* Lista */}
      {loading ? (
        <Center py={16}><Spinner size="xl" color={primary} /></Center>
      ) : displayed.length === 0 ? (
        <Center py={16} flexDirection="column" gap={4}>
          <Text fontSize="4xl">📖</Text>
          <Text color={textColor} opacity={0.6}>
            {search || areaFilter !== 'all' ? 'No se encontraron recetas con ese filtro.' : 'Aún no hay recetas. ¡Agrega la primera!'}
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
            <RecipeCard key={r._id} recipe={r} onClick={() => openDetail(r)} />
          ))}
        </SimpleGrid>
      )}

      {/* Modales */}
      <RecipeDetail
        recipe={selectedRecipe}
        isOpen={detailDisc.isOpen}
        onClose={detailDisc.onClose}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <RecipeForm
        isOpen={formDisc.isOpen}
        onClose={formDisc.onClose}
        onSave={handleSave}
        initialData={editingRecipe}
      />

      <AlertDialog isOpen={deleteDisc.isOpen} leastDestructiveRef={cancelRef} onClose={deleteDisc.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Eliminar receta</AlertDialogHeader>
            <AlertDialogBody>
              ¿Seguro que quieres eliminar "{deletingRecipe?.name}"? Esta acción no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDisc.onClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={deleting} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default RecipeManagement;
