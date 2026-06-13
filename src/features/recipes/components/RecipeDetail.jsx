import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Box, Image, Text, Heading, HStack, VStack, Badge, Grid, GridItem, Flex, Divider,
} from '@chakra-ui/react';
import { FaClock, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { resolveImageUrl } from './ImageInput';

const difficultyLabel = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };
const difficultyColor = { easy: 'green', medium: 'yellow', hard: 'red' };

function RecipeDetail({ recipe, isOpen, onClose, onEdit, onDelete }) {
  const { currentTheme } = useTheme();
  const primary = currentTheme.colors.primary[500];
  const surface = currentTheme.colors.interface?.surface || '#333';
  const textColor = currentTheme.colors.text;

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

            {/* Imagen principal */}
            {mainImgSrc && (
              <Box borderRadius="xl" overflow="hidden" maxH="300px">
                <Image src={mainImgSrc} alt={recipe.name} w="full" h="300px" objectFit="cover" />
              </Box>
            )}

            {/* Badges de info */}
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
              {recipe.prepTime > 0 && (
                <Badge variant="subtle" colorScheme="cyan" px={3} py={1} borderRadius="full">
                  Prep: {recipe.prepTime} min
                </Badge>
              )}
              {recipe.cookTime > 0 && (
                <Badge variant="subtle" colorScheme="orange" px={3} py={1} borderRadius="full">
                  Cocción: {recipe.cookTime} min
                </Badge>
              )}
            </HStack>

            {/* Descripción */}
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
                    return (
                      <GridItem key={i}>
                        <HStack
                          spacing={3}
                          p={2}
                          borderRadius="lg"
                          bg="blackAlpha.200"
                          border="1px solid"
                          borderColor={`${primary}22`}
                          align="flex-start"
                        >
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={ing.name}
                              boxSize="40px"
                              borderRadius="md"
                              objectFit="cover"
                              flexShrink={0}
                            />
                          ) : (
                            <Flex
                              boxSize="40px"
                              borderRadius="md"
                              bg="blackAlpha.300"
                              align="center"
                              justify="center"
                              flexShrink={0}
                            >
                              <Text fontSize="lg">🥄</Text>
                            </Flex>
                          )}
                          <VStack align="start" spacing={0} minW={0}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              whiteSpace="normal"
                              wordBreak="break-word"
                            >
                              {ing.name}
                            </Text>
                            {(ing.quantity > 0 || ing.unit) && (
                              <Text fontSize="xs" opacity={0.7}>
                                {ing.quantity > 0 ? ing.quantity : ''} {ing.unit}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </GridItem>
                    );
                  })}
                </Grid>
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
                  {[...recipe.steps]
                    .sort((a, b) => a.order - b.order)
                    .map((step, i) => {
                      const stepImg = resolveImageUrl(step.image);
                      return (
                        <Box key={i}>
                          <HStack align="flex-start" spacing={3}>
                            <Box
                              minW="28px"
                              h="28px"
                              borderRadius="full"
                              bg={primary}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                              mt="2px"
                            >
                              <Text fontSize="xs" fontWeight="bold" color="white">{i + 1}</Text>
                            </Box>
                            <VStack align="start" spacing={2} flex="1">
                              <Text fontSize="sm" lineHeight="1.6">{step.description}</Text>
                              {stepImg && (
                                <Box borderRadius="lg" overflow="hidden" maxH="200px" w="full">
                                  <Image
                                    src={stepImg}
                                    alt={`Paso ${i + 1}`}
                                    w="full"
                                    maxH="200px"
                                    objectFit="cover"
                                  />
                                </Box>
                              )}
                            </VStack>
                          </HStack>
                        </Box>
                      );
                    })}
                </VStack>
              </Box>
            )}

          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor={`${primary}33`} gap={3}>
          <Button
            leftIcon={<FaTrash />}
            colorScheme="red"
            variant="ghost"
            size="sm"
            onClick={() => { onClose(); onDelete(recipe); }}
          >
            Eliminar
          </Button>
          <Box flex="1" />
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          <Button
            leftIcon={<FaEdit />}
            colorScheme="blue"
            size="sm"
            onClick={() => { onClose(); onEdit(recipe); }}
          >
            Editar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RecipeDetail;
