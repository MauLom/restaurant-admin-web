import React, { useState, useEffect } from 'react';
import { Box, Flex, Select } from '@chakra-ui/react';
import CategorySelector from '../components/CategorySelector';
import ItemSelector from '../components/ItemSelector';
import OrderSummary from '../components/OrderSummary';
import api from '../services/api';

function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [physicalSections, setPhysicalSections] = useState([]);
  const [selectedPhysicalSection, setSelectedPhysicalSection] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  // Fetch physical sections on load
  useEffect(() => {
    const fetchPhysicalSections = async () => {
      try {
        const response = await api.get('/sections');
        setPhysicalSections(response.data);
      } catch (error) {
        console.error('Error fetching physical sections:', error);
      }
    };

    fetchPhysicalSections();
  }, []);

  // Fetch tables when a physical section is selected
  useEffect(() => {
    const fetchTables = async () => {
      if (selectedPhysicalSection) {
        try {
          const response = await api.get(`/sections/${selectedPhysicalSection}/tables`);
          setTables(response.data.tables);
        } catch (error) {
          console.error('Error fetching tables:', error);
        }
      }
    };

    fetchTables();
  }, [selectedPhysicalSection]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAddItem = (itemId, quantityChange, itemDetails) => {
    setOrderItems((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.itemId === itemId);
      let newItems;
      if (itemIndex > -1) {
        newItems = [...prevItems];
        const updatedItem = { ...newItems[itemIndex] };
        updatedItem.quantity += quantityChange;
        if (updatedItem.quantity <= 0) {
          newItems.splice(itemIndex, 1);
        } else {
          newItems[itemIndex] = updatedItem;
        }
      } else {
        newItems = [...prevItems, { 
          itemId, 
          name: itemDetails.name, 
          price: itemDetails.price, 
          quantity: quantityChange 
        }];
      }

      // Update the total after modifying order items
      setTotal(newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0));
      return newItems;
    });
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems((prevItems) => {
      const newItems = prevItems.filter(item => item.itemId !== itemId);
      
      // Update the total after removing an item
      setTotal(newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0));
      
      return newItems;
    });
  };

  const handleSubmitOrder = async () => {
    if (!selectedTable || orderItems.length === 0) {
      alert('Please select a table and add items to the order.');
      return;
    }

    try {
      console.log('Submitting order:', orderItems)
      const response = await api.post('/orders', {
        tableId: selectedTable,
        items: orderItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        section: 'kitchen',  // Replace this with dynamic section assignment if needed
        physicalSection: selectedPhysicalSection,
        total,
      });

      if (response.status === 201) {
        alert('Order created successfully!');
        // Reset order
        setOrderItems([]);
        setTotal(0);
        setSelectedTable('');
        setSelectedPhysicalSection('');
      } else {
        alert('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  return (
    <Flex height="100vh">
      <Box flex="3" p={4}>
        {/* Physical Section Select */}
        <Select
          placeholder="Select Section"
          value={selectedPhysicalSection}
          onChange={(e) => setSelectedPhysicalSection(e.target.value)}
          mb={4}
          sx={{
            bg: 'white', // Background color
            color: 'black', // Font color
            _hover: {
              bg: 'gray.200', // Background color on hover
            },
            _focus: {
              borderColor: 'blue.500', // Border color on focus
            },
          }}
        >
          {physicalSections.map(section => (
            <option key={section._id} value={section._id}>
              {section.name}
            </option>
          ))}
        </Select>

        {/* Table Select */}
        <Select
          placeholder="Select Table"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          mb={4}
          isDisabled={!selectedPhysicalSection}  
          sx={{
            bg: 'white', // Background color
            color: 'black', // Font color
            _hover: {
              bg: 'gray.200', // Background color on hover
            },
            _focus: {
              borderColor: 'blue.500', // Border color on focus
            },
          }}
        >
          {tables.map(table => (
            <option key={table._id} value={table._id}>
              {`Table ${table.number}`}
            </option>
          ))}
        </Select>

        <CategorySelector onSelect={handleCategorySelect} />
        <ItemSelector selectedCategory={selectedCategory} onAddItem={handleAddItem} />
      </Box>
      <Box flex="1" p={4} bg="gray.900">
        <OrderSummary 
          orderItems={orderItems} 
          total={total} 
          onRemoveItem={handleRemoveItem} 
          onSubmit={handleSubmitOrder} 
        />
      </Box>
    </Flex>
  );
}

export default OrderPage;
