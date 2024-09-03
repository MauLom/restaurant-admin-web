import React, { useState, useEffect } from 'react';
import { Box, VStack, Input, Button, useToast } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api'; // Assuming you have an api.js service

function UserProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: ''
  });
  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Fetch the user's profile from the backend
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile({
          name: response.data.user.name,
          email: response.data.user.email,
          password: '' // Password is kept empty for security reasons
        });
      } catch (error) {
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingProfile'),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchProfile();
  }, [toast, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSaveProfile = async () => {
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

    try {
      // Update the user's profile on the backend
      await api.put('/users/profile', {
        name: profile.name,
        email: profile.email,
        ...(profile.password && { password: profile.password })
      });

      toast({
        title: t('profileUpdatedTitle'),
        description: t('profileUpdatedDescription'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorUpdatingProfile'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
