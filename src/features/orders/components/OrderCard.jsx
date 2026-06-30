import React, { useState } from 'react';
import { Box, Text, VStack, HStack, Tag, IconButton, Checkbox } from '@chakra-ui/react';
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import AdminPinModal from './AdminPinModal';
import api from '../../../services/api';

function OrderCard({ order, selectedItems, onToggleItem, onOrderUpdated }) {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleDeleteClick = (itemSubdocId) => {
    setPendingDeleteId(itemSubdocId);
    setPinModalOpen(true);
  };

  const handlePinConfirm = async (adminToken) => {
    try {
      const response = await api.delete(
        `/orders/${order._id}/items/${pendingDeleteId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      toast({ title: t('itemDeleted'), status: 'success', duration: 2000 });
      onOrderUpdated(response.data);
    } catch (err) {
      const msg = err.response?.data?.error || t('errorTitle');
      toast({ title: msg, status: 'error', duration: 3000 });
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleDeliverItem = async (itemSubdocId) => {
    try {
      const response = await api.put(`/orders/${order._id}/items/${itemSubdocId}/deliver`);
      toast({ title: t('itemDelivered'), status: 'success', duration: 2000 });
      onOrderUpdated(response.data);
    } catch (err) {
      const msg = err.response?.data?.error || t('errorTitle');
      toast({ title: msg, status: 'error', duration: 3000 });
    }
  };

  const itemStatusColor = (status) => {
    if (status === 'ready') return 'green';
    if (status === 'sent to cashier') return 'blue';
    if (status === 'delivered') return 'purple';
    return 'orange';
  };

  const orderStatusColor = (status) => {
    if (status === 'ready') return 'green';
    if (status === 'sent to cashier') return 'blue';
    if (status === 'delivered') return 'purple';
    return 'orange';
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold">{t('orderNumber').replace('{number}', order._id.slice(-4))}</Text>
        <Tag colorScheme={orderStatusColor(order.status)}>
          {t(order.status) || order.status}
        </Tag>
      </HStack>

      <Text fontSize="sm" opacity={0.7} mb={2}>
        {t('orderTotal')}: ${order.total.toFixed(2)}
      </Text>

      <VStack align="start" spacing={2}>
        {order.items.map((item) => {
          const isReady = item.status === 'ready';
          const isPreparing = item.status === 'preparing';
          const isTerminal = item.status === 'sent to cashier' || item.status === 'delivered';
          const isChecked = selectedItems?.has(item._id);

          return (
            <Box
              key={item._id}
              p={2}
              bg={isTerminal ? 'gray.700' : 'gray.800'}
              borderRadius="md"
              width="100%"
              opacity={isTerminal ? 0.6 : 1}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={0}>
                  <Text fontWeight="semibold" fontSize="sm">{item.name}</Text>
                  <Text fontSize="xs" opacity={0.7}>{item.quantity} x ${item.price.toFixed(2)}</Text>
                </VStack>

                <HStack spacing={2}>
                  <Tag size="sm" colorScheme={itemStatusColor(item.status)}>
                    {t(item.status) || item.status}
                  </Tag>

                  {isReady && (
                    <>
                      <Checkbox
                        colorScheme="teal"
                        isChecked={isChecked}
                        onChange={() => onToggleItem(order._id, item._id)}
                      />
                      <IconButton
                        icon={<CheckIcon />}
                        size="xs"
                        colorScheme="green"
                        variant="ghost"
                        aria-label={t('deliverItem')}
                        title={t('deliverItem')}
                        onClick={() => handleDeliverItem(item._id)}
                      />
                    </>
                  )}

                  {isPreparing && (
                    <>
                      <IconButton
                        icon={<CheckIcon />}
                        size="xs"
                        colorScheme="green"
                        variant="ghost"
                        aria-label={t('deliverItem')}
                        title={t('deliverItem')}
                        onClick={() => handleDeliverItem(item._id)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        aria-label="Eliminar ítem"
                        onClick={() => handleDeleteClick(item._id)}
                      />
                    </>
                  )}
                </HStack>
              </HStack>

              {item.comments && (
                <Text fontSize="xs" opacity={0.7} mt={1}>📝 {item.comments}</Text>
              )}
            </Box>
          );
        })}
      </VStack>

      <AdminPinModal
        isOpen={pinModalOpen}
        onClose={() => { setPinModalOpen(false); setPendingDeleteId(null); }}
        onConfirm={handlePinConfirm}
      />
    </Box>
  );
}

export default OrderCard;
