import React from 'react';
import { Box, SimpleGrid, Heading, Text, VStack, HStack, useTheme } from '@chakra-ui/react';
import { FaHamburger } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuthContext } from '../../../context/AuthContext';

function ProductManagementPage() {
  const { t } = useLanguage();
  const { user } = useAuthContext();
  const userPermissions = user?.permissions || [];
  const options = [
    {
      title: t('manageCategoriesTitle'),
      description: t('manageCategoriesDescription'),
      link: '/dashboard/manage-categories',
      requiredAccess: 'manageCategories'
    },
    {
      title: t('manageProductsTitle'),
      description: t('manageProductsDescription'),
      link: '/dashboard/manage-items',
      requiredAccess: 'manageItems'
    },
    {
      title: t('manageInventoryTitle'),
      description: t('manageInventoryDescription'),
      link: '/dashboard/inventory',
      requiredAccess: 'inventory'
    },
    {
      title: t('recipesNavCardTitle'),
      description: t('recipesDescription'),
      link: '/dashboard/recipes',
    },
  ].filter(option => !option.requiredAccess || userPermissions.includes(option.requiredAccess));

  // Use theme colors directly for consistency with custom theme system
  const theme = useTheme();
  const cardBg = theme.colors.background;
  const cardBorder = theme.colors.primary[500];
  const descriptionColor = theme.colors.text;
  const headingColor = theme.colors.primary[500];

  return (
    <Box p={{ base: 4, md: 6 }}>
      <HStack 
        justify="center" 
        mb={20}
        spacing={3}
      >
        <Box
          px={6}
          py={3}
          bg={`${theme.colors.primary[500]}15`}
          border="2px solid"
          borderColor={theme.colors.primary[500]}
          borderRadius="lg"
          boxShadow="md"
        >
          <Heading 
            size={{ base: 'lg', md: 'xl' }} 
            color={headingColor}
            textAlign="center"
          >
            {t('manageProductsHeading')}
          </Heading>
        </Box>
      </HStack>
      <SimpleGrid 
        columns={{ base: 1, sm: 2, lg: 2 }} 
        spacing={{ base: 8, md: 10 }}
        maxW="4xl"
        mx="auto"
      >
        {options.map((option, index) => (
          <Box
            key={index}
            as={Link}
            to={option.link}
            p={{ base: 6, md: 8 }}
            minH={{ base: '140px', md: '160px' }}
            w="full"
            bg={cardBg}
            borderRadius="lg"
            shadow="md"
            border="1px solid"
            borderColor="transparent"
            cursor="pointer"
            transition="all 0.2s ease-in-out"
            _hover={{
              bg: `${cardBg}EE`,
              transform: 'translateY(-2px)',
              shadow: 'lg',
              borderColor: cardBorder,
            }}
            _active={{
              transform: 'translateY(0px)',
              shadow: 'md',
            }}
            _focus={{
              outline: 'none',
              ring: 2,
              ringColor: cardBorder,
              ringOffset: 2,
            }}
            textDecoration="none"
            role="button"
            aria-label={t('navigationAriaLabel').replace('{title}', option.title)}
          >
            <VStack spacing={{ base: 2, md: 3 }} align="start" h="full" justify="center">
              <Heading 
                size={{ base: 'md', md: 'lg' }} 
                mb={2}
                color={headingColor}
              >
                {option.title}
              </Heading>
              <Text 
                fontSize={{ base: 'sm', md: 'md' }} 
                color={descriptionColor}
                lineHeight="1.4"
                opacity={0.8}
                fontStyle={'italic'}
              >
                {option.description}
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default ProductManagementPage;
