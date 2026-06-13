import React from 'react';
import { Box } from '@chakra-ui/react';
import RecipeManagement from '../components/RecipeManagement';

function RecipeListPage() {
  return (
    <Box p={{ base: 4, md: 6 }}>
      <RecipeManagement />
    </Box>
  );
}

export default RecipeListPage;
