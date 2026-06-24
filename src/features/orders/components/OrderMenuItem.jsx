import React from 'react';
import { Badge, Button, HStack, IconButton, VStack, Text } from "@chakra-ui/react";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { useLanguage } from '../../../context/LanguageContext';

function OrderMenuItem({
  item,
  stock,
  available,
  selectedQty,
  canAddMore,
  inventory,
  lowStockThreshold,
  onAddItem,
  onRemoveItem,
}) {
  const { t } = useLanguage();
  const isLowStock = () => {
    const found = inventory.find(inv => inv.name.toLowerCase() === item.name.toLowerCase());
    return found ? found.quantity > 0 && found.quantity <= lowStockThreshold : false;
  };

  const handleRemoveItem = () => {
    onRemoveItem(item._id);
  };

  return (
    <VStack
      key={item._id}
      p={2}
      borderWidth="1px"
      borderRadius="md"
      opacity={available ? 1 : 0.5}
      bg="gray.700"
      spacing={2}
    >
      {isLowStock() && (
        <Badge colorScheme="yellow" mb={1}>
          {t('lowStock')}
        </Badge>
      )}

      <Button
        colorScheme={available ? "teal" : "gray"}
        onClick={() => available && onAddItem(item, 1)}
        isDisabled={!available}
        w="full"
      >
        {item.name} <br /> (${item.price.toFixed(2)})
      </Button>

      {!available && (
        <Text fontSize="xs" color="red.300">
          {t('notAvailable')}
        </Text>
      )}

      <HStack spacing={2} w="full" justify="center">
        <IconButton
          size="sm"
          colorScheme="red"
          icon={<FaMinus />}
          onClick={() => onAddItem(item, -1)}
          aria-label={t('decreaseQuantity')}
          isDisabled={selectedQty === 0}
        />
        <Text minW="30px" textAlign="center">
          {selectedQty}
        </Text>
        <IconButton
          size="sm"
          colorScheme="green"
          icon={<FaPlus />}
          onClick={() => onAddItem(item, 1)}
          aria-label={t('increaseQuantity')}
          isDisabled={!canAddMore}
        />
        <IconButton
          size="sm"
          colorScheme="red"
          icon={<FaTrash />}
          onClick={handleRemoveItem}
          aria-label="Eliminar ítem"
          isDisabled={selectedQty === 0}
        />
      </HStack>
    </VStack>
  );
}

export default OrderMenuItem;