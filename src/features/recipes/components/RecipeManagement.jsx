import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box, SimpleGrid, Button, ButtonGroup, HStack, Heading, Text, Spinner, Center,
  Input, InputGroup, InputLeftElement, IconButton,
  useDisclosure,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from '@chakra-ui/react';
import { FaPlus, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import api from '../../../services/api';
import RecipeCard from './RecipeCard';
import RecipeDetail from './RecipeDetail';
import RecipeForm from './RecipeForm';

function RecipeManagement() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const toast = useCustomToast();
  const primary = currentTheme.colors.primary[500];
  const textColor = currentTheme.colors.text;

  const [recipes, setRecipes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const RECIPES_PER_PAGE = 15;

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
      toast({ title: t('errorLoadingData'), status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (payload) => {
    try {
      if (editingRecipe) {
        const res = await api.put(`/recipes/${editingRecipe._id}`, payload);
        setRecipes(prev => prev.map(r => r._id === editingRecipe._id ? res.data : r));
        toast({ title: t('recipeUpdated'), status: 'success', duration: 2500 });
      } else {
        const res = await api.post('/recipes', payload);
        setRecipes(prev => [...prev, res.data]);
        toast({ title: t('recipeCreated'), status: 'success', duration: 2500 });
      }
    } catch {
      toast({ title: t('errorSavingRecipe'), status: 'error', duration: 3000 });
      throw new Error('save failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingRecipe) return;
    setDeleting(true);
    try {
      await api.delete(`/recipes/${deletingRecipe._id}`);
      setRecipes(prev => prev.filter(r => r._id !== deletingRecipe._id));
      toast({ title: t('recipeDeleted'), status: 'success', duration: 2500 });
      deleteDisc.onClose();
    } catch {
      toast({ title: t('errorDeleting'), status: 'error', duration: 3000 });
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
      const matchSearch = r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
      const matchArea = areaFilter === 'all' || r.area === areaFilter;
      return matchSearch && matchArea;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.max(1, Math.ceil(displayed.length / RECIPES_PER_PAGE));
  const paginatedRecipes = displayed.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, areaFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <Box>
      <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
        <Heading size="md" color={primary}>{t('recipesTitle')}</Heading>
        <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue" onClick={openCreate}>
          {t('newRecipeButton')}
        </Button>
      </HStack>

      <HStack mb={5} spacing={3} flexWrap="wrap">
        <InputGroup size="sm" maxW="260px">
          <InputLeftElement pointerEvents="none"><FaSearch color="gray" /></InputLeftElement>
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('searchRecipe')} borderRadius="lg" />
        </InputGroup>
        <ButtonGroup size="sm" isAttached variant="outline">
          {[
            { value: 'all', label: t('allRecipes') },
            { value: 'kitchen', label: `🍳 ${t('kitchenArea')}` },
            { value: 'bar', label: `🍹 ${t('barArea')}` },
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
              ? t('noRecipesWithFilter')
              : t('noRecipesYet')}
          </Text>
          {!search && areaFilter === 'all' && (
            <Button leftIcon={<FaPlus />} size="sm" colorScheme="blue" onClick={openCreate}>
              {t('addFirstRecipe')}
            </Button>
          )}
        </Center>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
            {paginatedRecipes.map(r => (
              <RecipeCard key={r._id} recipe={r} inventoryMap={inventoryMap} onClick={() => openDetail(r)} />
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <HStack justify="center" mt={6} spacing={4}>
              <IconButton
                icon={<FaChevronLeft />}
                size="sm"
                variant="outline"
                aria-label={t('previousPage')}
                isDisabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              />
              <Text color={textColor} fontSize="sm">
                {t('pageOfTotal').replace('{current}', currentPage).replace('{total}', totalPages)}
              </Text>
              <IconButton
                icon={<FaChevronRight />}
                size="sm"
                variant="outline"
                aria-label={t('nextPage')}
                isDisabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              />
            </HStack>
          )}
        </>
      )}

      <RecipeDetail recipe={selectedRecipe} isOpen={detailDisc.isOpen} onClose={detailDisc.onClose}
        onEdit={openEdit} onDelete={openDelete} inventoryMap={inventoryMap} />

      <RecipeForm isOpen={formDisc.isOpen} onClose={formDisc.onClose} onSave={handleSave}
        initialData={editingRecipe} inventoryItems={inventoryItems}
        ingredientImageMap={ingredientImageMap} />

      <AlertDialog isOpen={deleteDisc.isOpen} leastDestructiveRef={cancelRef} onClose={deleteDisc.onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>{t('deleteRecipeTitle')}</AlertDialogHeader>
            <AlertDialogBody>
              {t('deleteRecipeConfirm').replace('{name}', deletingRecipe?.name)}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDisc.onClose}>{t('cancelButton')}</Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={deleting} ml={3}>{t('deleteButton')}</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default RecipeManagement;
