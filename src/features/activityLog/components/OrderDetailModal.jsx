import React, { useEffect, useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, ModalFooter,
  Button, Box, Text, VStack, HStack, Badge, Center, Spinner,
} from '@chakra-ui/react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import api from '../../../services/api';

const itemStatusColor = (status) => {
  if (status === 'ready') return 'green';
  if (status === 'delivered') return 'teal';
  if (status === 'sent to cashier') return 'blue';
  return 'orange';
};

// Read-only order detail surface for the activity log's "ver orden" link.
// Deliberately has no action buttons — it is an audit view, not OrderCard/CashierPage.
function OrderDetailModal({ orderId, isOpen, onClose }) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const toast = useCustomToast();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) return;
    setIsLoading(true);
    setOrder(null);
    api.get(`/orders/${orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => toast({ title: t('errorTitle'), status: 'error' }))
      .finally(() => setIsLoading(false));
  }, [isOpen, orderId, t, toast]);

  if (!currentTheme) return null;
  const c = currentTheme.colors;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent bg={c.surface} color={c.text}>
        <ModalHeader>{t('orderDetailTitle')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center py={10}><Spinner size="xl" color={c.primary[500]} /></Center>
          ) : !order ? (
            <Center py={10}><Text color="gray.400">{t('orderNotFound')}</Text></Center>
          ) : (
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Badge colorScheme={itemStatusColor(order.status)} fontSize="sm" px={2} py={1}>
                  {t(order.status) || order.status}
                </Badge>
                <Text fontSize="sm" color="gray.400">
                  {new Date(order.createdAt).toLocaleString()}
                </Text>
              </HStack>

              <VStack align="stretch" spacing={2}>
                {order.items.map((item) => (
                  <Box key={item._id} p={3} bg={c.background} borderRadius="md">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold" fontSize="sm">{item.name}</Text>
                        <Text fontSize="xs" opacity={0.7}>
                          {item.quantity} x ${item.price?.toFixed(2)}
                        </Text>
                      </VStack>
                      <Badge colorScheme={itemStatusColor(item.status)} fontSize="xs">
                        {t(item.status) || item.status}
                      </Badge>
                    </HStack>
                    {item.comments && (
                      <Text fontSize="xs" opacity={0.7} mt={1}>📝 {item.comments}</Text>
                    )}
                  </Box>
                ))}
              </VStack>

              <HStack justify="space-between" pt={2} borderTop="1px solid" borderColor={`${c.primary[500]}22`}>
                <Text fontWeight="bold">{t('orderTotal')}</Text>
                <Text fontWeight="bold">${order.total?.toFixed(2)}</Text>
              </HStack>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>{t('closeModalButton')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default OrderDetailModal;
