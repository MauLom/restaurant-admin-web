import React from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const Breadcrumbs = ({ items }) => {
  return (
    <Breadcrumb
      spacing="8px"
      separator={<ChevronRightIcon color="gray.500" />}
      py={2}
      px={4}
      bg="gray.100"
      borderRadius="md"
    >
      {items.map((item, index) => (
        <BreadcrumbItem key={index}>
          <BreadcrumbLink as={RouterLink} to={item.path} color="teal.600">
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
