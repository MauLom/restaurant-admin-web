import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td,
  Button, IconButton, Flex, Spacer, Input, HStack, SimpleGrid, useDisclosure
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Breadcrumbs from '../components/Breadcrumbs';
import axios from 'axios';
import ItemModal from '../components/ItemModal';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [search, setSearch] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Inventory', path: '/inventory' },
  ];

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch items from the API
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchItems();
  }, [API_URL]);

  const handleSave = async (item) => {
    if (currentItem) {
      // Update existing item
      try {
        await axios.put(`${API_URL}/inventory/update/${currentItem._id}`, item);
        setItems(items.map(i => (i._id === currentItem._id ? { ...i, ...item } : i)));
      } catch (error) {
        console.error('Error updating item:', error);
      }
    } else {
      // Add new item
      try {
        const response = await axios.post(`${API_URL}/inventory/add`, item);
        setItems([...items, response.data]);
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
    onClose();
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    onOpen();
  };

  const handleDelete = async (id) => {
    // Handle delete logic
    try {
      await axios.delete(`${API_URL}/inventory/delete/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAdd = () => {
    setCurrentItem(null);
    onOpen();
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Breadcrumbs items={breadcrumbItems} />
      <Flex mt={4} mb={4} align="center">
        <Heading>Inventory Management</Heading>
        <Spacer />
        <Button colorScheme="teal" onClick={handleAdd}>Add New Item</Button>
      </Flex>
      <HStack mb={4}>
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}>
          {viewMode === 'table' ? <ViewIcon /> : <ViewOffIcon />}
        </Button>
      </HStack>
      {viewMode === 'table' ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Item Name</Th>
              <Th>Quantity</Th>
              <Th>Sell Price</Th>
              <Th>Cost</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.map(item => (
              <Tr key={item._id}>
                <Td>{item.name}</Td>
                <Td>{item.quantity}</Td>
                <Td>${item.sellPrice.toFixed(2)}</Td>
                <Td>${item.costAmount?.toFixed(2)}</Td>
                <Td>
                  <IconButton
                    icon={<EditIcon />}
                    mr={2}
                    onClick={() => handleEdit(item)}
                    aria-label="Edit item"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    onClick={() => handleDelete(item._id)}
                    aria-label="Delete item"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
          {filteredItems.map(item => (
            <Box
              key={item._id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="lg"
              w="full"
              maxW="sm"
            >
              <Heading as="h3" size="md" mb={2}>{item.name}</Heading>
              <Box>Quantity: {item.quantity}</Box>
              <Box>Sell Price: ${item.sellPrice.toFixed(2)}</Box>
              <Box>Cost: ${item.costAmount?.toFixed(2)}</Box>
              <Flex mt={2}>
                <IconButton
                  icon={<EditIcon />}
                  mr={2}
                  onClick={() => handleEdit(item)}
                  aria-label="Edit item"
                />
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  onClick={() => handleDelete(item._id)}
                  aria-label="Delete item"
                />
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}
      <ItemModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={handleSave}
        item={currentItem}
      />
    </Box>
  );
};

export default Inventory;
