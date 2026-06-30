import React from 'react';
import { Box, Text, VStack, HStack, Tag } from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';

function OrderCard({ order }) {
  const { t } = useLanguage();

  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <HStack justify="space-between">
        <Text fontWeight="bold">{t('orderNumber').replace('{number}', order._id.slice(-4))}</Text>
        <Tag colorScheme={order.status === 'ready' ? 'green' : 'orange'}>
          {order.status === 'ready' ? t('statusReadyText') : t('statusPreparingText')}
        </Tag>
      </HStack>

      <Text fontSize="sm" color="gray.400" mt={1}>
        {t('orderTotal')}: ${order.total.toFixed(2)}
      </Text>

      <VStack align="start" mt={2} spacing={2}>
        {order.items.map((item, idx) => (
          <Box
            key={idx}
            p={2}
            bg={item.paid ? 'gray.700' : 'gray.800'}
            borderRadius="md"
            width="100%"
          >
            <HStack justify="space-between">
              <Text fontWeight="semibold">{item.name}</Text>
              <Text fontSize="sm">{item.quantity} × ${item.price.toFixed(2)}</Text>
            </HStack>
            {item.paid && (
              <Tag size="sm" colorScheme="blue" mt={1}>{t('paid')}</Tag>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

export default OrderCard;
