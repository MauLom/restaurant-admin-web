import React, { useState } from 'react';
import { Box, Button, VStack, HStack, Switch, Text, useToast } from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';

function UserSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
  });

  const toast = useToast();
  const { t } = useLanguage();

  const handleToggle = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
  };

  const handleSaveSettings = () => {
    toast({
      title: t('settingsUpdatedTitle'),
      description: t('settingsUpdatedDescription'),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
