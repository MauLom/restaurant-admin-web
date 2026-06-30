import React, { useState } from 'react';
import { Box, Text, VStack, HStack, Tag, IconButton, Checkbox, Tooltip, useColorMode } from '@chakra-ui/react';
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { useLanguage } from '../../../context/LanguageContext';
import { useCustomToast } from '../../../hooks/useCustomToast';
import AdminPinModal from './AdminPinModal';
import api from '../../../services/api';

function OrderCard({ order, selectedItems, onToggleItem, onOrderUpdated, onOrderDeleted }) {
  const { t } = useLanguage();
  const toast = useCustomToast();
  const { colorMode } = useColorMode();
  const [pinModalOpen, setPinModalOpen] = useState(false);
  // { type: 'deleteItem', id: string } | { type: 'deleteOrder' } | null
  const [pendingAction, setPendingAction] = useState(null);

  const handleDeleteItemClick = (itemSubdocId) => {
    setPendingAction({ type: 'deleteItem', id: itemSubdocId });
    setPinModalOpen(true);
  };

  const handleDeleteOrderClick = () => {
    setPendingAction({ type: 'deleteOrder' });
    setPinModalOpen(true);
  };

  const handlePinConfirm = async (adminToken) => {
    try {
      if (pendingAction?.type === 'deleteItem') {
        const response = await api.delete(
          `/orders/${order._id}/items/${pendingAction.id}`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        toast({ title: t('itemDeleted'), status: 'success', duration: 2000 });
        onOrderUpdated(response.data);
      } else if (pendingAction?.type === 'deleteOrder') {
        await api.delete(
          `/orders/${order._id}`,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        toast({ title: t('orderDeleted'), status: 'success', duration: 2000 });
        onOrderDeleted(order._id);
      }
    } catch (err) {
      const msg = err.response?.data?.error || t('errorTitle');
      toast({ title: msg, status: 'error', duration: 3000 });
    } finally {
      setPendingAction(null);
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
    return 'orange';
  };

  const orderStatusColor = (status) => {
    if (status === 'ready') return 'green';
    if (status === 'sent to cashier') return 'blue';
    return 'orange';
  };

  const deliveredTagProps = colorMode === 'light'
    ? { bg: 'green.600', color: 'black' }
    : { bg: 'green.200', color: 'black' };

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <HStack justify="space-between" mb={2}>
        <Text fontWeight="bold">{t('orderNumber').replace('{number}', order._id.slice(-4))}</Text>
        <HStack spacing={2}>
          <Tag {...(order.status === 'delivered' ? deliveredTagProps : { colorScheme: orderStatusColor(order.status) })}>
            {t(order.status) || order.status}
          </Tag>
          {!order.paid && (
            <Tooltip label={t('deleteOrder')}>
              <IconButton
                icon={<DeleteIcon />}
                size="xs"
                colorScheme="red"
                variant="ghost"
                aria-label={t('deleteOrder')}
                onClick={handleDeleteOrderClick}
              />
            </Tooltip>
          )}
        </HStack>
      </HStack>

      <Text fontSize="sm" opacity={0.7} mb={2}>
        {t('orderTotal')}: ${order.total.toFixed(2)}
      </Text>

      <VStack align="start" spacing={2}>
        {order.items.map((item) => {
          const isReady = item.status === 'ready';
          const isPreparing = item.status === 'preparing';
          const isDelivered = item.status === 'delivered';
          const isTerminal = item.status === 'sent to cashier';
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
                  <Tag size="sm" {...(item.status === 'delivered' ? deliveredTagProps : { colorScheme: itemStatusColor(item.status) })}>
                    {t(item.status) || item.status}
                  </Tag>

                  {(isReady || isDelivered) && (
                    <Checkbox
                      colorScheme="teal"
                      isChecked={isChecked}
                      onChange={() => onToggleItem(order._id, item._id)}
                    />
                  )}

                  {isReady && (
                    <IconButton
                      icon={<CheckIcon />}
                      size="xs"
                      colorScheme="green"
                      variant="ghost"
                      aria-label={t('deliverItem')}
                      title={t('deliverItem')}
                      onClick={() => handleDeliverItem(item._id)}
                    />
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
                        aria-label={t('itemDeleted')}
                        onClick={() => handleDeleteItemClick(item._id)}
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
        onClose={() => { setPinModalOpen(false); setPendingAction(null); }}
        onConfirm={handlePinConfirm}
      />
    </Box>
  );
}

export default OrderCard;
