import React, { useState, useEffect } from 'react';
import { Box, Button, VStack, HStack, Switch, Text, useToast } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api'; // Assuming you have an api.js service

function UserSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
  });

  const toast = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Fetch the user's settings from the backend
    const fetchSettings = async () => {
      try {
        const response = await api.get('/users/settings');
        setSettings({
          notifications: response.data.notifications,
          darkMode: response.data.darkMode,
        });
      } catch (error) {
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingSettings'),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchSettings();
  }, [toast, t]);

  const handleToggle = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
  };

  const handleSaveSettings = async () => {
    try {
      // Update the user's settings on the backend
      await api.put('/users/settings', settings);

      toast({
        title: t('settingsUpdatedTitle'),
        description: t('settingsUpdatedDescription'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: t('errorTitle'),
        description: t('errorUpdatingSettings'),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="start">
        <HStack justify="space-between" width="100%">
          <Text>{t('enableNotifications')}</Text>
          <Switch isChecked={settings.notifications} onChange={() => handleToggle('notifications')} />
        </HStack>
        <HStack justify="space-between" width="100%">
          <Text>{t('darkMode')}</Text>
          <Switch isChecked={settings.darkMode} onChange={() => handleToggle('darkMode')} />
        </HStack>
        <Button colorScheme="blue" onClick={handleSaveSettings}>
          {t('saveSettings')}
        </Button>
      </VStack>
    </Box>
  );
}

export default UserSettings;
