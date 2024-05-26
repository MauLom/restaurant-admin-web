import React from 'react';
import { Box, Heading } from '@chakra-ui/react';
import Breadcrumbs from '../components/Breadcrumbs';

const Users = () => {
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Users', path: '/users' },
  ];

  return (
    <Box>
      <Breadcrumbs items={breadcrumbItems} />
      <Heading mt={4}>User Management</Heading>
    </Box>
  );
};

export default Users;
