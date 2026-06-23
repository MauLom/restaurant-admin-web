import React, { useState, useEffect } from 'react';
import { Input, HStack, Tooltip, IconButton } from '@chakra-ui/react';
import { FaQuestionCircle } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';

export function ItemSearchBar({ items, onFilter }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      onFilter(items);
      return;
    }

    const terms = debouncedQuery.split(',').map(term => term.trim().toLowerCase());

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
  }, [debouncedQuery, items, onFilter]);

  return (
    <HStack mb={4}>
      <Input
        placeholder={t('searchItemsPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        bg="gray.700"
        color="white"
        _placeholder={{ color: 'gray.400' }}
        size="sm"
      />
      <Tooltip
        label={
          <>
            <div><strong>{t('searchExamplesTitle')}:</strong></div>
            <div>• `agua` → Nombre contiene agua</div>
            <div>• `bebidas` → Categoría bebidas</div>
            <div>• `{'>'}50` → Precio menor a 50</div>
            <div>• `bebidas, {'>'}50` → Bebidas menores a 50</div>
          </>
        }
        aria-label={t('searchInstructions')}
        placement="top"
        hasArrow
        shouldWrapChildren
      >
        <IconButton
          icon={<FaQuestionCircle />}
          variant="ghost"
          size="sm"
          aria-label={t('searchHelpButton')}
          color="gray.300"
          _hover={{ color: "white" }}
        />
      </Tooltip>
    </HStack>
  );
}
