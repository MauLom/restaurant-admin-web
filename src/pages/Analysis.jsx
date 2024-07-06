import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Flex, Button, useToast
} from '@chakra-ui/react';
import axios from 'axios';
import SavedAnalyses from '../components/SaveAnalysis';
import Instructions from '../components/Instructions';
import Balance from '../components/Balance';
import ProcessedOrders from '../components/ProcessedOrders';
import Breadcrumbs from '../components/Breadcrumbs';

const Analysis = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedAnalysisId, setSavedAnalysisId] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [processedOrders, setProcessedOrders] = useState([]);
  const toast = useToast();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchSavedAnalyses();
  }, []);

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

  const fetchProcessedOrders = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/orders?status=Processed&date=${date}`);
      setProcessedOrders(response.data);
      processOrders(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching processed orders.',
        description: "An error occurred while fetching processed orders.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const processOrders = (orders) => {
    const items = [];
    const categories = new Set();

    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.itemId;
        items.push({
          ...itemId,
          sellPrice: itemId.sellPrice || 0,
          costAmount: itemId.costAmount || 0,
          soldAmount: itemId.soldAmount || 0,
          quantity: item.quantity || 0,
        });
        categories.add(itemId.category);
      });
    });

    setItems(items);
    setCategories([...categories]);
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

  const handleDateChange = (date) => {
    fetchProcessedOrders(date);
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Analysis', path: '/analysis' },
  ];

  return (
    <Box p={4}>
      <Breadcrumbs items={breadcrumbItems} />
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
            <ProcessedOrders processedOrders={processedOrders} onDateChange={handleDateChange} />
          </TabPanel>
          <TabPanel>
            <Balance orders={processedOrders} />
          </TabPanel>
          <TabPanel>
            <Instructions categories={categories} items={items} />
          </TabPanel>
          <TabPanel>
            <SavedAnalyses
              savedAnalyses={savedAnalyses}
              selectedAnalysis={selectedAnalysis}
              setSelectedAnalysis={setSelectedAnalysis}
              handleSelectAnalysis={handleSelectAnalysis}
              items={items}
              categories={categories}
            />
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
