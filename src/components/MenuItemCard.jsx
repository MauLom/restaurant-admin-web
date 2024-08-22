import React from 'react';
import { Box, Image, Text, Button } from '@chakra-ui/react';

const MenuItemCard = ({ menuItem, onClick }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      onClick={() => onClick(menuItem)}
      cursor="pointer"
    >
      <Image src={menuItem.image} alt={menuItem.name} boxSize="150px" objectFit="cover" />
      <Text fontSize="xl" fontWeight="bold" mt={2}>{menuItem.name}</Text>
      <Text>${menuItem.price}</Text>
      <Text>{menuItem.available} available</Text>
      <Button colorScheme="teal" mt={4} width="full">Edit</Button>
    </Box>
  );
};

export default MenuItemCard;
