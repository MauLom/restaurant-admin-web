import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

const Card = ({ icon, title, onClick }) => {
  return (
    <Box
      as="button"
      onClick={onClick}
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      _hover={{ bg: "gray.100" }}
      w="full"
      maxW="sm"
      m={2}
    >
      <VStack spacing={4}>
        {icon}
        <Text fontSize="xl">{title}</Text>
      </VStack>
    </Box>
  );
};

export default Card;
