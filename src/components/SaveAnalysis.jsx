import React from 'react';
import {
    Box, Heading, Select, Text
} from '@chakra-ui/react';
import CategoryCard from '../components/CategoryCard';

const SavedAnalyses = ({ savedAnalyses, selectedAnalysis, setSelectedAnalysis, handleSelectAnalysis, items, categories }) => {

    const calculateTotalIncome = () => {
        return items.reduce((total, item) => total + (item.sellPrice * item.quantitySold), 0);
    };

    const calculateRestockCost = () => {
        return items.reduce((total, item) => total + (item.soldAmount * item.quantitySold), 0);
    };

    const calculateProfit = () => {
        return calculateTotalIncome() - calculateRestockCost();
    };

    return (
        <Box>
            <Heading size="md" mb={4}>Análisis guardados</Heading>
            <Select placeholder="Seleccionar análisis" onChange={(e) => handleSelectAnalysis(savedAnalyses.find(analysis => analysis._id === e.target.value))}>
                {savedAnalyses.map((analysis) => (
                    <option key={analysis._id} value={analysis._id}>
                        {new Date(analysis.createdAt).toLocaleDateString()} - {analysis._id}
                    </option>
                ))}
            </Select>
            {selectedAnalysis && (
                <Box mt={4}>
                    <Heading size="md" mb={4}>Detalle del análisis</Heading>
                    <Box>
                        <Text>Ingreso total: ${calculateTotalIncome().toFixed(2)}</Text>
                        <Text>Costo de Restock: ${calculateRestockCost().toFixed(2)}</Text>
                        <Text>Profit: ${calculateProfit().toFixed(2)}</Text>
                        {categories.map((category, index) => (
                            <CategoryCard
                                key={index}
                                category={category}
                                items={items.filter(item => item.category === category)}
                            />
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default SavedAnalyses;
