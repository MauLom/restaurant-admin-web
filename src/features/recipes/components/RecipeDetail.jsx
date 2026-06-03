import React, { useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Box, Image, Text, Heading, HStack, VStack, Badge, Grid, GridItem, Flex, Divider,
} from '@chakra-ui/react';
import { FaClock, FaUsers, FaEdit, FaTrash, FaDollarSign } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { resolveImageUrl } from './ImageInput';
import { calcIngredientCost, calcTotalCost, formatCost } from '../costUtils';

const difficultyLabel = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };
const difficultyColor = { easy: 'green', medium: 'yellow', hard: 'red' };

function RecipeDetail({ recipe, isOpen, onClose, onEdit, onDelete, inventoryMap = {} }) {
  const { currentTheme } = useTheme();
  const primary = currentTheme.colors.primary[500];
  const surface = currentTheme.colors.interface?.surface || '#333';
  const textColor = currentTheme.colors.text;

  const totalCost = useMemo(
    () => recipe ? calcTotalCost(recipe.ingredients || [], inventoryMap) : null,
    [recipe, inventoryMap]
  );

  if (!recipe) return null;

  const mainImgSrc = resolveImageUrl(recipe.mainImage);
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={surface} color={textColor} borderRadius="2xl" mx={4}>
        <ModalHeader borderBottom="1px solid" borderColor={`${primary}33`} pb={3}>
          <Text color={primary} fontSize="xl" fontWeight="bold" noOfLines={2}>{recipe.name}</Text>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          <VStack align="stretch" spacing={6}>

            {mainImgSrc && (
              <Box borderRadius="xl" overflow="hidden" maxH="300px">
                <Image src={mainImgSrc} alt={recipe.name} w="full" h="300px" objectFit="cover" />
              </Box>
            )}

            {/* Badges info */}
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme={recipe.area === 'kitchen' ? 'orange' : 'cyan'} px={3} py={1} borderRadius="full">
                {recipe.area === 'kitchen' ? '🍳 Cocina' : '🍹 Barra'}
              </Badge>
              <Badge colorScheme={difficultyColor[recipe.difficulty] || 'gray'} px={3} py={1} borderRadius="full">
                {difficultyLabel[recipe.difficulty] || recipe.difficulty}
              </Badge>
              {totalTime > 0 && (
                <Badge variant="subtle" colorScheme="blue" px={3} py={1} borderRadius="full">
                  <HStack spacing={1}><FaClock size="11px" /><Text>{totalTime} min</Text></HStack>
                </Badge>
              )}
              {recipe.servings > 0 && (
                <Badge variant="subtle" colorScheme="purple" px={3} py={1} borderRadius="full">
                  <HStack spacing={1}><FaUsers size="11px" /><Text>{recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}</Text></HStack>
                </Badge>
              )}
              {totalCost != null && (
                <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                  <HStack spacing={1}>
                    <FaDollarSign size="11px" />
                    <Text>
                      {formatCost(totalCost)}
                      {recipe.servings > 1 && ` · ${formatCost(totalCost / recipe.servings)}/porc.`}
                    </Text>
                  </HStack>
                </Badge>
              )}
            </HStack>

            {recipe.description && (
              <Text opacity={0.85} fontSize="sm" lineHeight="1.7">{recipe.description}</Text>
            )}

            {/* Ingredientes */}
            {recipe.ingredients?.length > 0 && (
              <Box>
                <Heading size="sm" color={primary} mb={4}>Ingredientes</Heading>
                <Grid templateColumns="repeat(auto-fill, minmax(180px, 1fr))" gap={3}>
                  {recipe.ingredients.map((ing, i) => {
                    const imgSrc = resolveImageUrl(ing.image);
                    const invItem = inventoryMap[ing.inventoryItemId];
                    const ingCost = calcIngredientCost(invItem, ing.quantity, ing.unit);
                    return (
                      <GridItem key={i}>
                        <HStack spacing={3} p={2} borderRadius="lg" bg="blackAlpha.200"
                          border="1px solid" borderColor={`${primary}22`} align="flex-start">
                          {imgSrc ? (
                            <Image src={imgSrc} alt={ing.name} boxSize="40px" borderRadius="md" objectFit="cover" flexShrink={0} />
                          ) : (
                            <Flex boxSize="40px" borderRadius="md" bg="blackAlpha.300" align="center" justify="center" flexShrink={0}>
                              <Text fontSize="lg">🥄</Text>
                            </Flex>
                          )}
                          <VStack align="start" spacing={0} minW={0}>
                            <Text fontSize="sm" fontWeight="semibold" whiteSpace="normal" wordBreak="break-word">
                              {ing.name}
                            </Text>
                            {(ing.quantity > 0 || ing.unit) && (
                              <Text fontSize="xs" opacity={0.7}>{ing.quantity > 0 ? ing.quantity : ''} {ing.unit}</Text>
                            )}
                            {ingCost != null && (
                              <Badge colorScheme="green" fontSize="10px" mt={0.5}>~{formatCost(ingCost)}</Badge>
                            )}
                          </VStack>
                        </HStack>
                      </GridItem>
                    );
                  })}
                </Grid>

                {/* Desglose de costo */}
                {totalCost != null && (
                  <Box mt={4} p={3} borderRadius="lg" bg="green.900" border="1px solid" borderColor="green.600">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="green.200">Costo total estimado de ingredientes</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.300">{formatCost(totalCost)}</Text>
                    </HStack>
                    {recipe.servings > 1 && (
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="green.400">Por porción ({recipe.servings} porciones)</Text>
                        <Text fontSize="xs" color="green.400">{formatCost(totalCost / recipe.servings)}</Text>
                      </HStack>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {recipe.ingredients?.length > 0 && recipe.steps?.length > 0 && (
              <Divider borderColor={`${primary}22`} />
            )}

            {/* Pasos */}
            {recipe.steps?.length > 0 && (
              <Box>
                <Heading size="sm" color={primary} mb={4}>Preparación</Heading>
                <VStack align="stretch" spacing={5}>
                  {[...recipe.steps].sort((a, b) => a.order - b.order).map((step, i) => {
                    const stepImg = resolveImageUrl(step.image);
                    return (
                      <HStack key={i} align="flex-start" spacing={3}>
                        <Box minW="28px" h="28px" borderRadius="full" bg={primary}
                          display="flex" alignItems="center" justifyContent="center" flexShrink={0} mt="2px">
                          <Text fontSize="xs" fontWeight="bold" color="white">{i + 1}</Text>
                        </Box>
                        <VStack align="start" spacing={2} flex="1">
                          <Text fontSize="sm" lineHeight="1.6">{step.description}</Text>
                          {stepImg && (
                            <Box borderRadius="lg" overflow="hidden" maxH="200px" w="full">
                              <Image src={stepImg} alt={`Paso ${i + 1}`} w="full" maxH="200px" objectFit="cover" />
                            </Box>
                          )}
                        </VStack>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={`${primary}33`} gap={3}>
          <Button leftIcon={<FaTrash />} colorScheme="red" variant="ghost" size="sm"
            onClick={() => { onClose(); onDelete(recipe); }}>Eliminar</Button>
          <Box flex="1" />
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button leftIcon={<FaEdit />} colorScheme="blue" size="sm"
            onClick={() => { onClose(); onEdit(recipe); }}>Editar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RecipeDetail;
