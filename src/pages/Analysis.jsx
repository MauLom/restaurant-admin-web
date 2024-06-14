import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, FormControl, FormLabel,
  Input, Button, Stack, Tag, TagLabel, TagCloseButton, Flex, useToast, Select,
  Text
} from '@chakra-ui/react';
import CategoryCard from '../components/CategoryCard';
import axios from 'axios';

const Analysis = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', category: '', soldAmount: 0, sellPrice: 0, quantitySold: 0 });
  const [categories, setCategories] = useState([]);
  const [savedAnalysisId, setSavedAnalysisId] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchSavedAnalyses = async () => {
      try {
        const response = await axios.get(`${API_URL}/analysis`);
        setSavedAnalyses(response.data);
      } catch (error) {
        toast({
          title: 'Error fetching analyses.',
          description: "An error occurred while fetching saved analyses.",
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchSavedAnalyses();
  }, [API_URL, toast]);

  const handleAddItem = () => {
    setItems([...items, newItem]);
    if (!categories.includes(newItem.category)) {
      setCategories([...categories, newItem.category]);
    }
    setNewItem({ name: '', category: '', soldAmount: 0, sellPrice: 0, quantitySold: 0 });
  };

  const calculateTotalIncome = () => {
    return items.reduce((total, item) => total + (item.sellPrice * item.quantitySold), 0);
  };

  const calculateRestockCost = () => {
    return items.reduce((total, item) => total + (item.soldAmount * item.quantitySold), 0);
  };

  const calculateProfit = () => {
    return calculateTotalIncome() - calculateRestockCost();
  };

  const handleRemoveCategory = (category) => {
    setCategories(categories.filter(cat => cat !== category));
    setItems(items.filter(item => item.category !== category));
  };

  const handleSaveAnalysis = async () => {
    try {
      const response = await axios.post(`${API_URL}/analysis/save`, { items });
      setSavedAnalysisId(response.data._id);
      toast({
        title: 'Análisis guardado.',
        description: "Tu análisis ha sido guardado exitosamente.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al guardar el análisis.',
        description: "Ocurrió un error al guardar tu análisis.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteAnalysis = async () => {
    if (!savedAnalysisId) return;

    try {
      await axios.delete(`${API_URL}/analysis/delete/${savedAnalysisId}`);
      setItems([]);
      setCategories([]);
      setSavedAnalysisId(null);
      toast({
        title: 'Análisis eliminado.',
        description: "Tu análisis ha sido eliminado exitosamente.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error al eliminar el análisis.',
        description: "Ocurrió un error al eliminar tu análisis.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectAnalysis = (analysis) => {
    setSelectedAnalysis(analysis);
    setItems(analysis.items);
    setCategories([...new Set(analysis.items.map(item => item.category))]);
  };

  return (
    <Box p={4}>
      <Heading as="h2" mb={4}>Análisis</Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Edición de items</Tab>
          <Tab>Balance</Tab>
          <Tab>Instrucciones</Tab>
          <Tab>Ver análisis guardados</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Stack spacing={4}>
              <FormControl id="itemName">
                <FormLabel>Nombre</FormLabel>
                <Input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </FormControl>
              <FormControl id="itemCategory">
                <FormLabel>Categoría</FormLabel>
                <Input type="text" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} />
                <Stack direction="row" mt={2}>
                  {categories.map((category, index) => (
                    <Tag key={index} size="md" colorScheme="teal" borderRadius="full">
                      <TagLabel>{category}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveCategory(category)} />
                    </Tag>
                  ))}
                </Stack>
              </FormControl>
              <FormControl id="soldAmount">
                <FormLabel>Precio costo</FormLabel>
                <Input type="number" value={newItem.soldAmount} onChange={(e) => setNewItem({ ...newItem, soldAmount: parseFloat(e.target.value) })} />
              </FormControl>
              <FormControl id="sellPrice">
                <FormLabel>Precio Venta</FormLabel>
                <Input type="number" value={newItem.sellPrice} onChange={(e) => setNewItem({ ...newItem, sellPrice: parseFloat(e.target.value) })} />
              </FormControl>
              <FormControl id="quantitySold">
                <FormLabel>Cantidad vendida</FormLabel>
                <Input type="number" value={newItem.quantitySold} onChange={(e) => setNewItem({ ...newItem, quantitySold: parseFloat(e.target.value) })} />
              </FormControl>
              <Button onClick={handleAddItem}>Agregar item</Button>
            </Stack>
          </TabPanel>
          <TabPanel>
            <Box>
              <Heading size="md" mb={4}>Detalle</Heading>
              <Text>Ingreso total: ${calculateTotalIncome().toFixed(2)}</Text>
              <Text>Costo de Restock: ${calculateRestockCost().toFixed(2)}</Text>
              <Text>Profit: ${calculateProfit().toFixed(2)}</Text>
              {/* Add your graph here */}
            </Box>
          </TabPanel>
          <TabPanel>
            <Box>
              <Heading size="md" mb={4}>Instrucciones</Heading>
              {categories.map((category, index) => (
                <CategoryCard
                  key={index}
                  category={category}
                  items={items.filter(item => item.category === category)}
                />
              ))}
            </Box>
          </TabPanel>
          <TabPanel>
            <Box>
              <Heading size="md" mb={4}>Análisis guardados</Heading>
              <Select placeholder="Seleccionar análisis" onChange={(e) => handleSelectAnalysis(savedAnalyses.find(analysis => analysis._id === e.target.value))}>
                {savedAnalyses.map((analysis) => (
                  <option key={analysis._id} value={analysis._id}>
                    {new Date(analysis.createdAt).toLocaleDateString()} - {analysis._id}
                  </option>
                ))}
              </Select>
              {selectedAnalysis && (
                <Box mt={4}>
                  <Heading size="md" mb={4}>Detalle del análisis</Heading>
                  <Box>
                    <Text>Ingreso total: ${calculateTotalIncome().toFixed(2)}</Text>
                    <Text>Costo de Restock: ${calculateRestockCost().toFixed(2)}</Text>
                    <Text>Profit: ${calculateProfit().toFixed(2)}</Text>
                    {categories.map((category, index) => (
                      <CategoryCard
                        key={index}
                        category={category}
                        items={items.filter(item => item.category === category)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Flex mt={4} justifyContent="space-between">
        <Button colorScheme="blue" onClick={handleSaveAnalysis}>Guardar análisis</Button>
        <Button colorScheme="red" onClick={handleDeleteAnalysis} isDisabled={!savedAnalysisId}>Eliminar análisis</Button>
      </Flex>
    </Box>
  );
};

export default Analysis;
