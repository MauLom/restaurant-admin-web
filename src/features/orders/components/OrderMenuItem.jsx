import React from 'react';
import { Badge, Box, Text } from "@chakra-ui/react";
import { useLanguage } from '../../../context/LanguageContext';

function OrderMenuItem({
  item,
  available,
  selectedQty,
  canAddMore,
  servingsAvailable,
  lowStockThreshold,
  onAddItem,
}) {
  const { t } = useLanguage();
  const isSelected = selectedQty > 0;
  const isClickable = available && canAddMore;

  // Low stock: recipe is linked (servingsAvailable !== null) and few servings remain
  const isLowStock = () => {
    return servingsAvailable !== null && servingsAvailable !== undefined
      && servingsAvailable > 0 && servingsAvailable <= lowStockThreshold;
  };

  const handleClick = () => {
    if (isClickable) {
      onAddItem(item, 1);
    }
  };

  return (
    <Box
      position="relative"
      onClick={handleClick}
      cursor={isClickable ? 'pointer' : 'not-allowed'}
      bg="gray.700"
      borderWidth="2px"
      borderColor={isSelected ? 'green.400' : 'transparent'}
      borderRadius="md"
      p={3}
      opacity={available ? 1 : 0.5}
      transition="border-color 0.15s ease"
      _hover={isClickable ? { borderColor: isSelected ? 'green.400' : 'gray.500' } : undefined}
    >
      {isSelected && (
        <Box
          position="absolute"
          top="-8px"
          right="-8px"
          bg="green.400"
          color="white"
          borderRadius="full"
          minW="22px"
          h="22px"
          px={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="bold"
        >
          {selectedQty}
        </Box>
      )}

      <Text fontWeight="semibold" noOfLines={2} mb={1}>
        {item.name}
      </Text>

      {available ? (
        <Text fontSize="sm" color="gray.300">${item.price.toFixed(2)}</Text>
      ) : (
        <Text fontSize="sm" color="red.300">{t('notAvailable')}</Text>
      )}

      {available && isLowStock() && (
        <Badge colorScheme="yellow" fontSize="2xs" mt={1}>
          {t('lowStock')}
        </Badge>
      )}
    </Box>
  );
}

export default OrderMenuItem;
