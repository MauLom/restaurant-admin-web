import React, { useMemo } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Box, Image, Text, HStack, VStack, Badge, Flex, Divider,
} from '@chakra-ui/react';
import { FaClock, FaFireAlt, FaUsers, FaEdit, FaTrash, FaDollarSign, FaTag } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';
import { resolveImageUrl } from './ImageInput';
import { calcIngredientCost, calcTotalCost, formatCost, calcMargin } from '../costUtils';

const difficultyLabel = { easy: 'Fácil', medium: 'Media', hard: 'Difícil' };
const difficultyColor = { easy: 'green', medium: 'yellow', hard: 'red' };

// ── Subcomponentes de sección ────────────────────────────────────────────────

function SectionLabel({ children, color }) {
  return (
    <Text
      fontSize="10px"
      fontWeight="bold"
      textTransform="uppercase"
      letterSpacing="wider"
      color={color}
      opacity={0.7}
      mb={2}
    >
      {children}
    </Text>
  );
}

function StatBox({ label, value, sub, color = 'white' }) {
  return (
    <Box flex="1" minW="80px">
      <Text fontSize="10px" opacity={0.5} textTransform="uppercase" letterSpacing="wide" mb={0.5}>{label}</Text>
      <Text fontSize="md" fontWeight="bold" color={color} lineHeight="1">{value}</Text>
      {sub && <Text fontSize="10px" opacity={0.5} mt={0.5}>{sub}</Text>}
    </Box>
  );
}

// ────────────────────────────────────────────────────────────────────────────

function RecipeDetail({ recipe, isOpen, onClose, onEdit, onDelete, inventoryMap = {} }) {
  const { currentTheme } = useTheme();
  const primary = currentTheme.colors.primary[500];
  const surface = currentTheme.colors.interface?.surface || '#333';
  const textColor = currentTheme.colors.text;

  const totalCost = useMemo(
    () => recipe ? calcTotalCost(recipe.ingredients || [], inventoryMap) : null,
    [recipe, inventoryMap]
  );
  const salePrice = recipe?.price > 0 ? recipe.price : null;
  const margin = calcMargin(salePrice, totalCost);

  if (!recipe) return null;

  const mainImgSrc = resolveImageUrl(recipe.mainImage);
  const prepTime = recipe.prepTime || 0;
  const cookTime = recipe.cookTime || 0;
  const hasCostData = totalCost != null || salePrice != null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={surface} color={textColor} borderRadius="2xl" mx={4} overflow="hidden">

        {/* ── Imagen de cabecera ── */}
        {mainImgSrc ? (
          <Box h="200px" overflow="hidden" position="relative">
            <Image src={mainImgSrc} alt={recipe.name} w="full" h="full" objectFit="cover" />
            <Box
              position="absolute" inset={0}
              bgGradient="linear(to-t, blackAlpha.700 0%, transparent 60%)"
            />
            <Box position="absolute" bottom={0} left={0} p={4}>
              <Text color="white" fontSize="xl" fontWeight="bold" textShadow="0 1px 4px rgba(0,0,0,0.8)">
                {recipe.name}
              </Text>
            </Box>
            <ModalCloseButton color="white" />
          </Box>
        ) : (
          <>
            <Box px={5} pt={5} pb={3} borderBottom="1px solid" borderColor={`${primary}33`}>
              <Text color={primary} fontSize="xl" fontWeight="bold">{recipe.name}</Text>
            </Box>
            <ModalCloseButton />
          </>
        )}

        <ModalBody p={5}>
          <VStack align="stretch" spacing={5}>

            {/* ── Ficha técnica ── */}
            <Box
              p={3}
              borderRadius="xl"
              border="1px solid"
              borderColor={`${primary}22`}
              bg={`${primary}08`}
            >
              <SectionLabel color={primary}>Ficha técnica</SectionLabel>
              <HStack spacing={0} flexWrap="wrap" divider={
                <Box w="1px" h="32px" bg={`${primary}22`} mx={3} />
              }>
                {/* Área */}
                <Box>
                  <Text fontSize="10px" opacity={0.5} textTransform="uppercase" letterSpacing="wide" mb={0.5}>Área</Text>
                  <Badge
                    colorScheme={recipe.area === 'kitchen' ? 'orange' : 'cyan'}
                    variant="subtle" borderRadius="md" px={2}
                  >
                    {recipe.area === 'kitchen' ? '🍳 Cocina' : '🍹 Barra'}
                  </Badge>
                </Box>

                {/* Dificultad */}
                <Box>
                  <Text fontSize="10px" opacity={0.5} textTransform="uppercase" letterSpacing="wide" mb={0.5}>Dificultad</Text>
                  <Badge
                    colorScheme={difficultyColor[recipe.difficulty] || 'gray'}
                    variant="subtle" borderRadius="md" px={2}
                  >
                    {difficultyLabel[recipe.difficulty] || recipe.difficulty}
                  </Badge>
                </Box>

                {/* Tiempos */}
                {prepTime > 0 && (
                  <Box>
                    <Text fontSize="10px" opacity={0.5} textTransform="uppercase" letterSpacing="wide" mb={0.5}>Prep.</Text>
                    <HStack spacing={1}>
                      <FaClock size="11px" color={primary} />
                      <Text fontSize="sm" fontWeight="semibold">{prepTime} min</Text>
                    </HStack>
                  </Box>
                )}
                {cookTime > 0 && (
                  <Box>
                    <Text fontSize="10px" opacity={0.5} textTransform="uppercase" letterSpacing="wide" mb={0.5}>Cocción</Text>
                    <HStack spacing={1}>
                      <FaFireAlt size="11px" color={primary} />
                      <Text fontSize="sm" fontWeight="semibold">{cookTime} min</Text>
                    </HStack>
                  </Box>
                )}

                {/* Porciones */}
                {recipe.servings > 0 && (
                  <Box>
                    <Text fontSize="10px" opacity={0.5} textTransform="uppercase" letterSpacing="wide" mb={0.5}>Porciones</Text>
                    <HStack spacing={1}>
                      <FaUsers size="11px" color={primary} />
                      <Text fontSize="sm" fontWeight="semibold">{recipe.servings}</Text>
                    </HStack>
                  </Box>
                )}
              </HStack>
            </Box>

            {/* ── Descripción ── */}
            {recipe.description && (
              <Text fontSize="sm" opacity={0.8} lineHeight="1.7" fontStyle="italic">
                {recipe.description}
              </Text>
            )}

            {/* ── Ingredientes ── */}
            {recipe.ingredients?.length > 0 && (
              <Box>
                <SectionLabel color={primary}>
                  Ingredientes · {recipe.ingredients.length} items
                </SectionLabel>
                <VStack align="stretch" spacing={0}>
                  {recipe.ingredients.map((ing, i) => {
                    const imgSrc = resolveImageUrl(ing.image);
                    const invItem = inventoryMap[ing.inventoryItemId];
                    const ingCost = calcIngredientCost(invItem, ing.quantity, ing.unit);
                    return (
                      <HStack
                        key={i}
                        spacing={3}
                        px={3}
                        py={2}
                        borderLeft="2px solid"
                        borderLeftColor={primary}
                        bg={i % 2 === 0 ? `${primary}06` : 'transparent'}
                        align="center"
                      >
                        {/* Miniatura o icono */}
                        {imgSrc ? (
                          <Image src={imgSrc} alt={ing.name} boxSize="28px" borderRadius="md" objectFit="cover" flexShrink={0} />
                        ) : (
                          <Text fontSize="md" lineHeight="1" flexShrink={0}>🥄</Text>
                        )}

                        {/* Número + nombre */}
                        <Text fontSize="xs" color={primary} fontWeight="bold" minW="16px">{i + 1}.</Text>
                        <Text fontSize="sm" flex="1" fontWeight="medium" whiteSpace="normal" wordBreak="break-word">
                          {ing.name}
                        </Text>

                        {/* Cantidad */}
                        {(ing.quantity > 0 || ing.unit) && (
                          <Text fontSize="xs" opacity={0.6} whiteSpace="nowrap" flexShrink={0}>
                            {ing.quantity > 0 ? ing.quantity : ''} {ing.unit}
                          </Text>
                        )}

                        {/* Costo */}
                        {ingCost != null && (
                          <Badge colorScheme="green" fontSize="9px" flexShrink={0}>
                            ~{formatCost(ingCost)}
                          </Badge>
                        )}
                      </HStack>
                    );
                  })}
                </VStack>

                {/* ── Análisis de costo ── */}
                {hasCostData && (
                  <Box
                    mt={3} p={3} borderRadius="lg"
                    border="1px solid" borderColor={`${primary}33`}
                    bg={`${primary}0A`}
                  >
                    <SectionLabel color={primary}>Análisis de precio</SectionLabel>
                    <HStack spacing={0} divider={<Box w="1px" h="28px" bg={`${primary}22`} mx={3} />}>
                      {totalCost != null && (
                        <StatBox
                          label="Costo total"
                          value={formatCost(totalCost)}
                          sub={recipe.servings > 1 ? `${formatCost(totalCost / recipe.servings)} / porc.` : null}
                          color="red.400"
                        />
                      )}
                      {salePrice != null && (
                        <StatBox
                          label="Precio venta"
                          value={formatCost(salePrice)}
                          sub={recipe.servings > 1 ? `${formatCost(salePrice / recipe.servings)} / porc.` : null}
                          color="blue.300"
                        />
                      )}
                      {margin && (
                        <StatBox
                          label="Ganancia"
                          value={formatCost(margin.profit)}
                          sub={`${margin.marginPct.toFixed(1)}% margen`}
                          color={margin.profit >= 0 ? 'green.400' : 'red.400'}
                        />
                      )}
                    </HStack>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Pasos ── */}
            {recipe.steps?.length > 0 && (
              <Box>
                <SectionLabel color={primary}>
                  Preparación · {recipe.steps.length} pasos
                </SectionLabel>
                <VStack align="stretch" spacing={3}>
                  {[...recipe.steps].sort((a, b) => a.order - b.order).map((step, i) => {
                    const stepImg = resolveImageUrl(step.image);
                    return (
                      <HStack key={i} align="flex-start" spacing={3}>
                        <Flex
                          minW="22px" h="22px" mt="1px"
                          borderRadius="full"
                          bg={primary}
                          align="center" justify="center"
                          flexShrink={0}
                        >
                          <Text fontSize="9px" fontWeight="bold" color="white">{i + 1}</Text>
                        </Flex>
                        <VStack align="start" spacing={2} flex="1">
                          <Text fontSize="sm" lineHeight="1.6">{step.description}</Text>
                          {stepImg && (
                            <Box borderRadius="lg" overflow="hidden" maxH="160px" w="full">
                              <Image src={stepImg} alt={`Resultado paso ${i + 1}`} w="full" maxH="160px" objectFit="cover" />
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

        <ModalFooter borderTop="1px solid" borderColor={`${primary}22`} gap={2} py={3}>
          <Button leftIcon={<FaTrash />} colorScheme="red" variant="ghost" size="sm"
            onClick={() => { onClose(); onDelete(recipe); }}>
            Eliminar
          </Button>
          <Box flex="1" />
          <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
          <Button leftIcon={<FaEdit />} colorScheme="blue" size="sm"
            onClick={() => { onClose(); onEdit(recipe); }}>
            Editar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RecipeDetail;
