import React from 'react';
import { VStack, HStack, Select, Input, IconButton } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

function PaymentMethodSelector({ paymentMethods, setPaymentMethods, expectedTotal }) {
    const totalEntered = paymentMethods.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0);
    const difference = expectedTotal - totalEntered;
    const isExact = Math.abs(difference) < 0.01;


    const handleChange = (index, field, value) => {
        const updated = [...paymentMethods];
        updated[index][field] = field === 'amount' ? parseFloat(value) : value;
        setPaymentMethods(updated);
    };

    const addMethod = () => {
        setPaymentMethods([...paymentMethods, { method: '', amount: 0 }]);
    };

    const removeMethod = (index) => {
        const updated = [...paymentMethods];
        updated.splice(index, 1);
        setPaymentMethods(updated);
    };

    return (
        <VStack align="stretch" spacing={2} mt={3}>
            {paymentMethods.map((pm, index) => (
                <HStack key={index}>
                    <Select
                        placeholder="Método"
                        value={pm.method}
                        onChange={(e) => handleChange(index, 'method', e.target.value)}
                    >
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                    </Select>


                    <Input
                        type="number"
                        placeholder="Monto"
                        value={pm.amount}
                        onChange={(e) => handleChange(index, 'amount', e.target.value)}
                    />
                    <IconButton
                        icon={<FaTrash />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => removeMethod(index)}
                        aria-label="Eliminar método"
                    />
                </HStack>
            ))}
            <VStack align="start" spacing={1} mt={3}>
                <strong>Total esperado:</strong> ${expectedTotal.toFixed(2)}
                <strong>Total ingresado:</strong> ${totalEntered.toFixed(2)}
                {isExact ? (
                    <p style={{ color: 'green' }}>✅ El total coincide.</p>
                ) : (
                    <p style={{ color: 'red' }}>
                        ⚠️ Diferencia de ${difference.toFixed(2)}
                    </p>
                )}
            </VStack>
            <button onClick={addMethod}>➕ Agregar método</button>
        </VStack>
    );
}

export default PaymentMethodSelector;
