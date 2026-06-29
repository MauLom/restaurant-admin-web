import React, { useState } from 'react';
import { Box, Button, Text, Badge, Wrap, WrapItem, Collapse } from '@chakra-ui/react';
import { useLanguage } from '../../../context/LanguageContext';
import ALLERGENS from '../../../config/allergens';

function SeatAllergenPanel({ numberOfGuests, seatRestrictions, onToggleAllergen, onSave, saving }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!numberOfGuests || numberOfGuests < 1) return null;

  const restrictedSeatNumbers = seatRestrictions
    .filter(r => r.allergens.length > 0)
    .map(r => r.seatNumber);

  const radius = Math.max(95, (numberOfGuests * 42) / (2 * Math.PI));
  const size = radius * 2 + 80;
  const selectedSeatAllergens = seatRestrictions.find(r => r.seatNumber === selectedSeat)?.allergens || [];

  return (
    <Box>
      <Button
        size="sm"
        variant={restrictedSeatNumbers.length > 0 ? 'solid' : 'outline'}
        colorScheme="red"
        onClick={() => setIsOpen(prev => !prev)}
      >
        {t('seatAllergensButton')}{restrictedSeatNumbers.length > 0 && ` (${restrictedSeatNumbers.length})`}
      </Button>

      <Collapse in={isOpen} animateOpacity>
        <Box mt={3} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.600" bg="#2a2a2a">
          <Text fontSize="xs" color="gray.400" mb={3}>{t('seatRestrictionsDescription')}</Text>

          <Box position="relative" width={`${size}px`} height={`${size}px`} mx="auto">
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="70px"
              h="70px"
              borderRadius="full"
              bg="gray.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">🍽️</Text>
            </Box>

            {Array.from({ length: numberOfGuests }, (_, i) => i + 1).map(seatNumber => {
              const angle = (2 * Math.PI * (seatNumber - 1)) / numberOfGuests - Math.PI / 2;
              const left = `calc(50% + ${radius * Math.cos(angle)}px)`;
              const top = `calc(50% + ${radius * Math.sin(angle)}px)`;
              const hasRestriction = restrictedSeatNumbers.includes(seatNumber);
              const isSelected = selectedSeat === seatNumber;

              return (
                <Box
                  key={seatNumber}
                  as="button"
                  type="button"
                  position="absolute"
                  left={left}
                  top={top}
                  transform="translate(-50%, -50%)"
                  onClick={() => setSelectedSeat(isSelected ? null : seatNumber)}
                  w="38px"
                  h="38px"
                  borderRadius="full"
                  bg={hasRestriction ? 'red.500' : 'gray.600'}
                  border={isSelected ? '2px solid' : '1px solid'}
                  borderColor={isSelected ? 'teal.300' : 'gray.500'}
                  color="white"
                  fontWeight="medium"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                >
                  {seatNumber}
                </Box>
              );
            })}
          </Box>

          {selectedSeat && (
            <Box mt={3} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.600">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                {t('seatLabel').replace('{number}', selectedSeat)}
              </Text>
              <Wrap spacing={2}>
                {ALLERGENS.map(allergen => {
                  const active = selectedSeatAllergens.includes(allergen);
                  return (
                    <WrapItem key={allergen}>
                      <Badge
                        as="button"
                        type="button"
                        onClick={() => onToggleAllergen(selectedSeat, allergen)}
                        bg={active ? 'red.500' : 'gray.600'}
                        color={active ? 'white' : 'gray.200'}
                        border={active ? 'none' : '1px solid'}
                        borderColor="gray.500"
                        fontWeight="medium"
                        px={2}
                        py={1}
                        borderRadius="md"
                        cursor="pointer"
                      >
                        {t(`allergen_${allergen}`)}
                      </Badge>
                    </WrapItem>
                  );
                })}
              </Wrap>
            </Box>
          )}

          {onSave && (
            <Button mt={3} size="sm" colorScheme="teal" onClick={onSave} isLoading={saving}>
              {t('saveRestrictionsButton')}
            </Button>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default SeatAllergenPanel;
