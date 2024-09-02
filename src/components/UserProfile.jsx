import React, { useState } from 'react';
import { Box, VStack, Input, Button, useToast } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

function UserProfile() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: ''
  });

  const toast = useToast();
  const { t } = useLanguage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSaveProfile = () => {
    if (!profile.name || !profile.email) {
      toast({
        title: t('invalidInputTitle'),
        description: t('invalidUserProfileInputDescription'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: t('profileUpdatedTitle'),
      description: t('profileUpdatedDescription'),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="start">
        <Input
          placeholder={t('namePlaceholder')}
          value={profile.name}
          name="name"
          onChange={handleInputChange}
        />
        <Input
          placeholder={t('emailPlaceholder')}
          value={profile.email}
          name="email"
          onChange={handleInputChange}
        />
        <Input
          placeholder={t('passwordPlaceholder')}
          type="password"
          value={profile.password}
          name="password"
          onChange={handleInputChange}
        />
        <Button colorScheme="blue" onClick={handleSaveProfile}>
          {t('saveProfile')}
        </Button>
      </VStack>
    </Box>
  );
}

export default UserProfile;
