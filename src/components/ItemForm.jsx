import React from 'react';
import {
  FormControl, FormLabel, Input, Button, Stack, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';

const ItemForm = ({ newItem, setNewItem, categories, handleAddItem, handleRemoveCategory }) => {
  return (
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
  );
};

export default ItemForm;
