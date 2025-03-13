import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import PushNotification from '../../../shared/components/PushNotification.jsx';
import WebSocket from '../../../shared/components/WebSocket.jsx';
import LongPolling from '../../../shared/components/LongPolling.jsx';

function NotificationPage() {
  return (
    <Box p={4}>
      <VStack spacing={4}>
        <PushNotification />
        <WebSocket />
        <LongPolling />
      </VStack>
    </Box>
  );
}

export default NotificationPage;
