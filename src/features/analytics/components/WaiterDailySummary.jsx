import React, { useEffect, useState, useContext } from 'react';
import {
    Box, Text, VStack, HStack, Spinner, Accordion, AccordionItem, AccordionButton,
    AccordionPanel, AccordionIcon, Divider, Heading
} from '@chakra-ui/react';
import api from '../../../services/api';
import { UserContext } from '../../../context/UserContext';
import { Input } from '@chakra-ui/react';
import dayjs from 'dayjs';


function WaiterDailySummary() {
    const { user } = useContext(UserContext);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));


    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get(`/analytics/waiter-daily-summary?date=${selectedDate}`);
                setSummary(res.data);
            } catch (error) {
                console.error('Error fetching waiter summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [selectedDate]);

    if (loading) return <Spinner size="xl" color="teal.500" />;

    if (!summary) return <Text>Sin datos disponibles.</Text>;

    return (
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
            <Heading size="md" mb={2}>👤 Resumen del día — {user?.alias || user?.username}</Heading>
            <Text mb={4} fontSize="sm" color="gray.500">{new Date().toLocaleDateString()}</Text>
            <Box mb={4}>
                <Text fontWeight="bold" mb={1}>Seleccionar fecha</Text>
                <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setLoading(true);
                    }}
                    max={dayjs().format('YYYY-MM-DD')}
                    bg="white"
                    width="fit-content"
                />
            </Box>

            <VStack spacing={2} align="start" mb={4}>
                <Text><strong>🧾 Órdenes atendidas:</strong> {summary.totalOrders}</Text>
                <Text><strong>🧍‍♂️ Comensales:</strong> {summary.totalGuests}</Text>
                <Text><strong>💰 Ventas:</strong> ${summary.totalRevenue.toFixed(2)}</Text>
                <Text><strong>💸 Propinas:</strong> ${summary.totalTips.toFixed(2)}</Text>
            </VStack>

            <Divider my={4} />

            <Heading size="sm" mb={2}>Órdenes por mesa</Heading>

            <Accordion allowMultiple>
                {summary.tables.map((table, index) => (
                    <AccordionItem key={index}>
                        <h2>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    🪑 Mesa {table.tableNumber} — Total: ${table.subtotal.toFixed(2)} / Propina: ${table.tip.toFixed(2)}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <VStack align="start">
                                {table.orders.map((order, idx) => (
                                    <Box key={idx} p={2} borderWidth="1px" borderRadius="md" w="100%">
                                        <Text><strong>ID:</strong> {order.orderId.slice(-6)}</Text>
                                        <Text><strong>Total:</strong> ${order.total.toFixed(2)}</Text>
                                        <Text><strong>Propina:</strong> ${order.tip.toFixed(2)}</Text>
                                    </Box>
                                ))}
                            </VStack>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </Box>
    );
}

export default WaiterDailySummary;
