import React, { useState } from 'react';
import { Input, HStack, Tooltip, IconButton } from '@chakra-ui/react';
import { FaQuestionCircle } from 'react-icons/fa';

export function ItemSearchBar({ items, onFilter }) {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    filterItems(value);
  };

  const filterItems = (searchQuery) => {
    if (!searchQuery) {
      onFilter(items);
      return;
    }

    const terms = searchQuery.split(',').map(term => term.trim().toLowerCase());

    const filtered = items.filter(item => {
      return terms.every(term => {
        if (term.startsWith('>')) {
          const price = parseFloat(term.substring(1));
          return item.price <= price;
        } else if (term.startsWith('<')) {
          const price = parseFloat(term.substring(1));
          return item.price >= price;
        } else if (!isNaN(term)) {
          const price = parseFloat(term);
          return item.price === price;
        } else {
          return (
            item.name.toLowerCase().includes(term) ||
            (item.category?.name?.toLowerCase().includes(term))
          );
        }
      });
    });

    onFilter(filtered);
  };

  return (
    <HStack mb={4}>
      <Input
        placeholder="Buscar nombre, categoría, >precio, <precio"
        value={query}
        onChange={handleInputChange}
        bg="gray.700"
        color="white"
        _placeholder={{ color: 'gray.400' }}
        size="sm"
      />
      <Tooltip
        label={
          <>
            <div><strong>Ejemplos de búsqueda:</strong></div>
            <div>• `agua` → Nombre contiene agua</div>
            <div>• `bebidas` → Categoría bebidas</div>
            <div>• `&gt;50` → Precio menor a 50</div>
            <div>• `bebidas, &gt;50` → Bebidas menores a 50</div>
          </>
            }
        aria-label="Instrucciones de búsqueda"
        placement="top"
        hasArrow
        shouldWrapChildren
      >
        <IconButton
          icon={<FaQuestionCircle />}
          variant="ghost"
          size="sm"
          aria-label="Ayuda búsqueda"
          color="gray.300"
          _hover={{ color: "white" }}
        />
      </Tooltip>
    </HStack>
  );
}
