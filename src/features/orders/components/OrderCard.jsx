import React, { useState } from 'react';
import {
    Box,
    Text,
    VStack,
    HStack,
    Tag,
    Button,
    useToast,
    Input,
} from '@chakra-ui/react';
import api from '../../../services/api';
import PaymentMethodSelector from './PaymentMethodSelector';

function OrderCard({ order, onPaid }) {
    const toast = useToast();
    const [tip, setTip] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState([{ method: '', amount: order.total + parseFloat(tip) }]);

    console.log("paymentMethods on orderCard", paymentMethods);
    console.log("order", order);
    console.log("orderStatus", order.status);
    console.log("orderPaid", order.paid);
    console.log("order?.total + parseFloat(tip)", order?.total + parseFloat(tip));
    console.log("The reduce part", paymentMethods.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0))
    console.log("evaluated", paymentMethods.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0) !== order?.total + parseFloat(tip));
    const handlePayOrder = async () => {
        try {
            await api.post(`/orders/pay/${order._id}`, {
                tip: parseFloat(tip),
                paymentMethods,
            });

            toast({
                title: 'Orden pagada',
                description: `La orden fue pagada correctamente.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            if (onPaid) onPaid();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo procesar el pago de esta orden.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box borderWidth="1px" borderRadius="md" p={4}>
            <HStack justify="space-between">
                <Text fontWeight="bold">Orden #{order._id.slice(-4)}</Text>
                <Tag colorScheme={order.status === 'ready' ? 'green' : 'orange'}>
                    {order.status.toUpperCase()}
                </Tag>
            </HStack>

            <Text fontSize="sm" color="gray.500">Total: ${order.total.toFixed(2)}</Text>

            <VStack align="start" mt={2}>
                {order.items.map((item, idx) => (
                    <Text key={idx}>• {item.quantity} x {item.name}</Text>
                ))}
            </VStack>

            {order.status === 'ready' && !order.paid && (
                <>
                    <Input
                        type="number"
                        mt={3}
                        placeholder="Propina opcional"
                        value={tip}
                        onChange={(e) => setTip(e.target.value)}
                        size="sm"
                    />
                    <PaymentMethodSelector
                        paymentMethods={paymentMethods}
                        setPaymentMethods={setPaymentMethods}
                        expectedTotal={
                            order?.total + parseFloat(tip)
                        }
                    />
                    <Button
                        colorScheme="green"
                        onClick={handlePayOrder}
                        isDisabled={
                            order.status === 'ready' && 
                            !order.paid &&
                            paymentMethods.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0) !==
                            order?.total + parseFloat(tip)
                        }
                    >
                        💳 Pagar la orden
                    </Button>
                </>
            )}

            {order.paid && (
                <Tag mt={4} colorScheme="blue">Pagada</Tag>
            )}
        </Box>
    );
}

export default OrderCard;
