// pages/ManageMenu.jsx (This can be a renamed version of Inventory.jsx)
import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Button, IconButton, useDisclosure, Text } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ItemModal from '../components/ItemModal';

const ManageMenu = () => {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/inventory`);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    fetchItems();
  }, [API_URL]);

  const handleSave = async (item) => {
    if (currentItem) {
      try {
        await axios.put(`${API_URL}/inventory/update/${currentItem._id}`, item);
        setItems(items.map(i => (i._id === currentItem._id ? { ...i, ...item } : i)));
      } catch (error) {
        console.error('Error updating item:', error);
      }
    } else {
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
    try {
      await axios.delete(`${API_URL}/inventory/delete/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <Box>
      <Heading>Manage Menu</Heading>
      <Button colorScheme="teal" onClick={() => { setCurrentItem(null); onOpen(); }}>Add New Item</Button>
      <SimpleGrid columns={3} spacing={4} mt={4}>
        {items.map((item) => (
          <Box key={item._id} p={4} borderWidth="1px" borderRadius="lg">
            <Heading size="md">{item.name}</Heading>
            <Text>Price: ${item.sellPrice.toFixed(2)}</Text>
            <IconButton icon={<EditIcon />} onClick={() => handleEdit(item)} />
            <IconButton icon={<DeleteIcon />} colorScheme="red" onClick={() => handleDelete(item._id)} />
          </Box>
        ))}
      </SimpleGrid>

      <ItemModal isOpen={isOpen} onClose={onClose} onSave={handleSave} item={currentItem} />
    </Box>
  );
};

export default ManageMenu;
