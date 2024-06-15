import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Breadcrumbs from '../components/Breadcrumbs';
import MenuPDF from '../components/MenuPdf';

const Menu = () => {
    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Menu', path: '/menu' },
    ];

    return (
        <Box>
            <Breadcrumbs items={breadcrumbItems} />
            <Heading mt={4}>Menu</Heading>
            <MenuPDF />
        </Box>
    );
};

export default Menu;
