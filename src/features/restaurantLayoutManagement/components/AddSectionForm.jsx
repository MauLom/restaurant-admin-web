// src/components/AddSectionForm.jsx
import React, { useState } from 'react';
import { Box, Input, Button, VStack } from '@chakra-ui/react';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
function AddSectionForm({ onSectionAdded }) {
  const { t } = useLanguage();
  const [sectionName, setSectionName] = useState('');
  const toast = useCustomToast();

  const handleAddSection = async () => {
    try {
      const response = await api.post('/sections', { name: sectionName });
      setSectionName('');
      toast({
        title: t('sectionCreated'),
        description: t('sectionCreatedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onSectionAdded(response.data);
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorCreatingSection'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" mb={4}>
      <VStack spacing={4}>
        <Input
          placeholder={t('sectionNamePlaceholder')}
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
        />
        <Button colorScheme="blue" onClick={handleAddSection} isDisabled={!sectionName}>
          {t('addSection')}
        </Button>
      </VStack>
    </Box>
  );
}

export default AddSectionForm;
