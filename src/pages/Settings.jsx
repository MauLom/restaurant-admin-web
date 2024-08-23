// pages/Settings.jsx
import React, { useState } from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Inventory from './ManageMenu'; // Use this for Products Management
import SettingsSidebar from '../components/SettingsSidebar';
import Menu from './Menu';

const Settings = () => {
  const [selectedTab, setSelectedTab] = useState('appearance');

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'appearance':
        return <Heading size="md">Appearance Settings</Heading>;
      case 'restaurant':
        return <Heading size="md">Restaurant Settings</Heading>;
      case 'products':
        return <Inventory />; // Embed Products Management here
      case 'notifications':
        return <Heading size="md">Notifications Settings</Heading>;
      case 'security':
        return <Heading size="md">Security Settings</Heading>;
      case 'menu':
        return <Menu />
      default:
        return null;
    }
  };

  return (
    <Box display="flex">
      {/* New Settings Sidebar */}
      <SettingsSidebar
        onSelectTab={setSelectedTab}
        selectedTab={selectedTab}
      />

      {/* Main Content Area */}
      <Box p={8} flex="1">
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default Settings;
