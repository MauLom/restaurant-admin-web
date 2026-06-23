import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, VStack, HStack, Button, Text, Input, NumberInput, NumberInputField,
  Badge, IconButton, Heading, Divider, Spinner, Center, Tooltip,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer,
} from '@chakra-ui/react';
import { FaPlus, FaMinus, FaPrint, FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { useCustomToast } from '../../../hooks/useCustomToast';

function generatePrintHTML(groupedOrders, date) {
  const supplierBlocks = groupedOrders.map(group => {
    const rows = group.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.currentQty} ${item.unit}</td>
        <td style="text-align:center">${item.minStock} ${item.unit}</td>
        <td style="text-align:center"><strong>${item.orderQty} ${item.unit}</strong></td>
        <td></td>
      </tr>
    `).join('');
    return `
      <h2>${group.supplier}</h2>
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Stock actual</th>
            <th>Stock mínimo</th>
            <th>Cantidad a pedir</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Pedido a proveedores – ${date}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 30px; color: #111; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .subtitle { font-size: 13px; color: #555; margin-bottom: 24px; }
    h2 { font-size: 15px; margin: 24px 0 8px; border-bottom: 2px solid #333; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
    th { background: #f0f0f0; border: 1px solid #ccc; padding: 7px 10px; text-align: left; }
    td { border: 1px solid #ddd; padding: 7px 10px; }
    .footer { margin-top: 40px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>Lista de pedido a proveedores</h1>
  <div class="subtitle">Fecha: ${date}</div>
  ${supplierBlocks}
  <div class="footer">Generado por el sistema de gestión del restaurante</div>
</body>
</html>`;
}

function PurchaseOrders() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState({});
  const toast = useCustomToast();
  const { t } = useLanguage();

  useEffect(() => {
    api.get('/inventory')
      .then(r => {
        setInventory(r.data);
        // Auto-add all low-stock items with suggested quantities
        const initial = {};
        r.data.forEach(item => {
          if (item.minStock > 0 && item.quantity < item.minStock) {
            initial[item._id] = Math.max(1, item.minStock - item.quantity);
          }
        });
        setOrderItems(initial);
      })
      .catch(() => toast({ title: t('inventoryLoadError'), status: 'error', duration: 3000 }))
      .finally(() => setLoading(false));
  }, [toast]);

  const itemsMap = useMemo(() => {
    const map = {};
    inventory.forEach(i => { map[i._id] = i; });
    return map;
  }, [inventory]);

  const lowStockItems = useMemo(
    () => inventory.filter(i => i.minStock > 0 && i.quantity < i.minStock),
    [inventory]
  );

  const inOrderIds = Object.keys(orderItems);

  const groupedOrders = useMemo(() => {
    const groups = {};
    inOrderIds.forEach(id => {
      const item = itemsMap[id];
      if (!item) return;
      const supplier = item.supplier?.trim() || 'Sin proveedor';
      if (!groups[supplier]) groups[supplier] = [];
      groups[supplier].push({
        id,
        name: item.name,
        unit: item.unit,
        currentQty: item.quantity,
        minStock: item.minStock,
        orderQty: orderItems[id],
      });
    });
    return Object.entries(groups)
      .map(([supplier, items]) => ({ supplier, items: items.sort((a, b) => a.name.localeCompare(b.name)) }))
      .sort((a, b) => a.supplier.localeCompare(b.supplier));
  }, [inOrderIds, itemsMap, orderItems]);

  const toggleItem = (item) => {
    if (orderItems[item._id] !== undefined) {
      setOrderItems(prev => { const n = { ...prev }; delete n[item._id]; return n; });
    } else {
      const suggested = Math.max(1, (item.minStock || 1) - item.quantity);
      setOrderItems(prev => ({ ...prev, [item._id]: suggested }));
    }
  };

  const updateQty = (id, val) => {
    const num = parseFloat(val) || 0;
    if (num <= 0) {
      setOrderItems(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setOrderItems(prev => ({ ...prev, [id]: num }));
    }
  };

  const handlePrint = () => {
    if (groupedOrders.length === 0) {
      toast({ title: t('emptyOrderWarning'), status: 'warning', duration: 2500 });
      return;
    }
    const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const html = generatePrintHTML(groupedOrders, date);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (loading) return <Center py={16}><Spinner size="xl" /></Center>;

  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={5} flexWrap="wrap" gap={3}>
        <Heading size="md">{t('purchaseOrdersHeading')}</Heading>
        <Button leftIcon={<FaPrint />} colorScheme="blue" size="sm" onClick={handlePrint}>
          {t('printOrderButton')}
        </Button>
      </HStack>

      {/* Items con stock bajo — para agregar/quitar del pedido */}
      {lowStockItems.length > 0 && (
        <Box mb={6}>
          <Text fontSize="sm" fontWeight="semibold" mb={3} opacity={0.7}>
            {t('lowStockInstruction')}
          </Text>
          <HStack flexWrap="wrap" spacing={2}>
            {lowStockItems.map(item => {
              const inOrder = orderItems[item._id] !== undefined;
              return (
                <Tooltip key={item._id} label={`${item.quantity} / ${item.minStock} ${item.unit} mín.`}>
                  <Badge
                    cursor="pointer"
                    colorScheme={inOrder ? 'green' : 'red'}
                    variant={inOrder ? 'solid' : 'outline'}
                    px={3} py={1} borderRadius="full" fontSize="12px"
                    onClick={() => toggleItem(item)}
                  >
                    {inOrder ? '✓ ' : '+ '}{item.name}
                    {item.supplier ? ` (${item.supplier})` : ''}
                  </Badge>
                </Tooltip>
              );
            })}
          </HStack>
        </Box>
      )}

      {lowStockItems.length === 0 && (
        <Box mb={6} p={4} borderRadius="lg" bg="green.900" border="1px solid" borderColor="green.600">
          <Text color="green.200" fontSize="sm">✓ {t('allItemsAboveMinimum')}</Text>
        </Box>
      )}

      <Divider mb={5} />

      {/* Lista del pedido agrupada por proveedor */}
      {groupedOrders.length === 0 ? (
        <Center py={10} flexDirection="column" gap={3}>
          <Text fontSize="3xl">📋</Text>
          <Text opacity={0.5}>{t('noItemsInOrder')}</Text>
        </Center>
      ) : (
        <VStack align="stretch" spacing={6}>
          {groupedOrders.map(group => (
            <Box key={group.supplier}>
              <HStack mb={2}>
                <Text fontWeight="bold" fontSize="md">{group.supplier}</Text>
                <Badge colorScheme="gray">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</Badge>
              </HStack>
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{t('tableHeaderProduct')}</Th>
                      <Th isNumeric>{t('tableHeaderStock')}</Th>
                      <Th isNumeric>{t('tableHeaderMinimum')}</Th>
                      <Th isNumeric>{t('tableHeaderOrderQty')}</Th>
                      <Th></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {group.items.map(item => (
                      <Tr key={item.id}>
                        <Td fontWeight="medium">{item.name}</Td>
                        <Td isNumeric>
                          <Text color="red.400">{item.currentQty} {item.unit}</Text>
                        </Td>
                        <Td isNumeric>{item.minStock} {item.unit}</Td>
                        <Td isNumeric>
                          <HStack justify="flex-end" spacing={1}>
                            <IconButton
                              icon={<FaMinus />} size="xs" variant="ghost"
                              onClick={() => updateQty(item.id, item.orderQty - 1)}
                              aria-label={t('decreaseQtyButton')}
                            />
                            <NumberInput
                              value={item.orderQty} min={1} size="sm"
                              onChange={v => updateQty(item.id, v)}
                              w="70px"
                            >
                              <NumberInputField textAlign="center" px={1} />
                            </NumberInput>
                            <Text fontSize="sm" opacity={0.7}>{item.unit}</Text>
                            <IconButton
                              icon={<FaPlus />} size="xs" variant="ghost"
                              onClick={() => updateQty(item.id, item.orderQty + 1)}
                              aria-label={t('increaseQtyButton')}
                            />
                          </HStack>
                        </Td>
                        <Td>
                          <IconButton
                            icon={<FaTrash />} size="xs" colorScheme="red" variant="ghost"
                            onClick={() => toggleItem(itemsMap[item.id])}
                            aria-label={t('removeOrderButton')}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default PurchaseOrders;
