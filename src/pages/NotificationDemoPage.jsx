import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import PushNotification from '../components/PushNotification';
import WebSocketDemo from '../components/WebSocketDemo';
import LongPollingDemo from '../components/LongPollingDemo';

function NotificationDemoPage() {
  return (
    <Box p={4}>
      <VStack spacing={4}>
        <PushNotification />
        <WebSocketDemo />
        <LongPollingDemo />
      </VStack>
    </Box>
  );
}

export default NotificationDemoPage;
