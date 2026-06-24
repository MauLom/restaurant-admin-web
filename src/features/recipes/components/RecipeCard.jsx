import React from 'react';
import { Box, Image, Text, Heading, HStack, Badge, Flex } from '@chakra-ui/react';
import { FaClock, FaUsers } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { resolveImageUrl } from './ImageInput';
import { calcTotalCost, formatCost, calcMargin } from '../costUtils';

const difficultyColor = { easy: 'green', medium: 'yellow', hard: 'red' };

function RecipeCard({ recipe, inventoryMap = {}, onClick }) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  const difficultyLabel = { easy: t('difficultyEasy'), medium: t('difficultyMedium'), hard: t('difficultyHard') };
  const primary = currentTheme.colors.primary[500];
  const surface = currentTheme.colors.interface?.surface || '#444';
  const textColor = currentTheme.colors.text;

  const imgSrc = resolveImageUrl(recipe.mainImage);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const totalCost = calcTotalCost(recipe.ingredients || [], inventoryMap);
  const salePrice = recipe.price > 0 ? recipe.price : null;
  const margin = calcMargin(salePrice, totalCost);

  return (
    <Box onClick={onClick} cursor="pointer" borderRadius="xl" overflow="hidden"
      bg={surface} border="1px solid transparent" shadow="md"
      transition="all 0.2s ease-in-out"
      _hover={{ transform: 'translateY(-3px)', shadow: 'xl', borderColor: primary }}>

      <Box h="170px" bg="blackAlpha.400" overflow="hidden">
        {imgSrc
          ? <Image src={imgSrc} alt={recipe.name} w="full" h="full" objectFit="cover" />
          : <Flex h="full" align="center" justify="center" opacity={0.3}><Text fontSize="5xl">🍽️</Text></Flex>
        }
      </Box>

      <Box p={4}>
        <Heading size="sm" color={textColor} mb={1} noOfLines={1}>{recipe.name}</Heading>
        {recipe.description && (
          <Text fontSize="xs" color={textColor} opacity={0.7} mb={3} noOfLines={2}>{recipe.description}</Text>
        )}
        <HStack spacing={2} flexWrap="wrap">
          <Badge colorScheme={recipe.area === 'kitchen' ? 'orange' : 'cyan'} fontSize="10px">
            {recipe.area === 'kitchen' ? `🍳 ${t('areaKitchen')}` : `🍹 ${t('areaBar')}`}
          </Badge>
          <Badge colorScheme={difficultyColor[recipe.difficulty] || 'gray'} fontSize="10px">
            {difficultyLabel[recipe.difficulty] || recipe.difficulty}
          </Badge>
          {totalTime > 0 && (
            <HStack spacing={1}>
              <FaClock size="10px" color={primary} />
              <Text fontSize="xs" color={textColor} opacity={0.8}>{totalTime} min</Text>
            </HStack>
          )}
          {recipe.servings > 0 && (
            <HStack spacing={1}>
              <FaUsers size="10px" color={primary} />
              <Text fontSize="xs" color={textColor} opacity={0.8}>{recipe.servings} {t('servingsLabel')}</Text>
            </HStack>
          )}
          {salePrice != null && (
            <Badge colorScheme="blue" fontSize="10px">{formatCost(salePrice)}</Badge>
          )}
          {totalCost != null && (
            <Badge colorScheme="red" variant="subtle" fontSize="10px">{t('costBadge').replace('{amount}', formatCost(totalCost))}</Badge>
          )}
          {margin && (
            <Badge colorScheme={margin.marginPct >= 0 ? 'green' : 'red'} fontSize="10px">
              {t('marginBadge').replace('{percent}', margin.marginPct.toFixed(0))}
            </Badge>
          )}
        </HStack>
      </Box>
    </Box>
  );
}

export default RecipeCard;
