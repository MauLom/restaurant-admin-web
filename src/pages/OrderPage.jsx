import React, { useContext, useState, useEffect } from 'react';
import { Box, Flex, Select, useBreakpointValue } from '@chakra-ui/react';
import CategorySelector from '../components/CategorySelector';
import ItemSelector from '../components/ItemSelector';
import OrderSummary from '../components/OrderSummary';
import api from '../services/api';
import { UserContext } from '../context/UserContext';  

function OrderPage() {
  const { user } = useContext(UserContext);  
  const waiterId = user?._id; 

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [comment, setComment] = useState('');
  const [physicalSections, setPhysicalSections] = useState([]);
  const [selectedPhysicalSection, setSelectedPhysicalSection] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');

  const isMobile = useBreakpointValue({ base: true, md: false });

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

  const handleAddItem = (itemId, quantityChange, itemDetails, comments) => {
    setOrderItems((prevItems) => {
      const itemIndex = prevItems.findIndex(item => item.itemId === itemId);
      let newItems;
      if (itemIndex > -1) {
        newItems = [...prevItems];
        const updatedItem = { ...newItems[itemIndex] };
        updatedItem.quantity += quantityChange;

        if(quantityChange > 0) {
          updatedItem.comments.push(comments);
        } else {
          updatedItem.comments.pop();
        }

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
          quantity: quantityChange,
          comments: [comments]
        }];
      }

      setTotal(newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0));
      return newItems;
    });
  };

  const handleRemoveItem = (itemId) => {
    setOrderItems((prevItems) => {
      const newItems = prevItems.filter(item => item.itemId !== itemId);
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
      const response = await api.post('/orders', {
        tableId: selectedTable,
        waiterId,  // Include the waiterId in the order
        items: orderItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          comments: item.comments
        })),
        section: 'kitchen',  // Replace this with dynamic section assignment if needed
        physicalSection: selectedPhysicalSection,
        total,
        comment: comment
      });

      if (response.status === 201) {
        alert('Order created successfully!');
        setOrderItems([]);
        setTotal(0);
        setComment('');
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

  const setOrderComment = (comment) => {
    setComment(comment)
  };

  return (
    <Flex height="100vh" direction={isMobile ? 'column' : 'row'}>
      {isMobile && (
        <Box flex="1" p={4} bg="gray.900">
          <OrderSummary 
            orderItems={orderItems} 
            total={total} 
            oderComment={comment}
            setOrderComment={setOrderComment}
            onRemoveItem={handleRemoveItem} 
            onSubmit={handleSubmitOrder} 
          />
        </Box>
      )}

      <Box flex="3" p={4}>
        <Select
          placeholder="Select Section"
          value={selectedPhysicalSection}
          onChange={(e) => setSelectedPhysicalSection(e.target.value)}
          mb={4}
          sx={{
            bg: 'white',
            color: 'black',
            _hover: { bg: 'gray.200' },
            _focus: { borderColor: 'blue.500' },
          }}
        >
          {physicalSections.map(section => (
            <option key={section._id} value={section._id}>
              {section.name}
            </option>
          ))}
        </Select>

        <Select
          placeholder="Select Table"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          mb={4}
          isDisabled={!selectedPhysicalSection}
          sx={{
            bg: 'white',
            color: 'black',
            _hover: { bg: 'gray.200' },
            _focus: { borderColor: 'blue.500' },
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

      {!isMobile && (
        <Box flex="1" p={4} bg="gray.900">
          <OrderSummary 
            orderItems={orderItems} 
            total={total} 
            oderComment={comment}
            setOrderComment={setOrderComment}
            onRemoveItem={handleRemoveItem} 
            onSubmit={handleSubmitOrder} 
          />
        </Box>
      )}
    </Flex>
  );
}

export default OrderPage;
