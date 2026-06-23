import React from 'react';
import { VStack, HStack, Select, Input, IconButton } from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';

function PaymentMethodSelector({ paymentMethods, setPaymentMethods, expectedTotal }) {
    const { t } = useLanguage();
    const totalEntered = paymentMethods.reduce((acc, pm) => acc + (parseFloat(pm.amount) || 0), 0);
    const difference = expectedTotal - totalEntered;
    const isExact = Math.abs(difference) < 0.01;

    console.log("expected total", expectedTotal);

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
                        bg="gray.700"
                        _placeholder={{ color: 'gray.400' }}
                        placeholder={t('paymentMethodLabel')}
                        value={pm.method}
                        onChange={(e) => handleChange(index, 'method', e.target.value)}
                    >
                        <option style={{ backgroundColor: '#2D3748' }} value="cash">{t('paymentCash')}</option>
                        <option style={{ backgroundColor: '#2D3748' }} value="card">{t('paymentCard')}</option>
                        <option style={{ backgroundColor: '#2D3748' }} value="transfer">{t('paymentTransfer')}</option>
                    </Select>

                    <Input
                        type="number"
                        placeholder={t('amountLabel')}
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

                <strong>{t('expectedTotalText')}: ${expectedTotal}</strong>
                <strong>{t('enteredTotalText')}: ${totalEntered.toFixed(2)}</strong>
                {isExact ? (
                    <p style={{ color: 'green' }}>✅ {t('totalMatches')}.</p>
                ) : (
                    <p style={{ color: 'red' }}>
                        ⚠️ {t('totalDifference')}: ${difference.toFixed(2)}
                    </p>
                )}
            </VStack>
            <button onClick={addMethod}>➕ {t('addPaymentMethod')}</button>
        </VStack>
    );
}

export default PaymentMethodSelector;
