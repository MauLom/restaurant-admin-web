import React, { useState, useEffect } from 'react';
import {
  Flex, Button, Input, Text, Badge, Wrap, WrapItem, VStack, Box,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, Select, IconButton, FormControl, FormLabel, useTheme
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

import { UserContext } from '../../../context/UserContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import ALLERGENS from '../../../config/allergens';

function OpenTableModal({ isOpen, onClose, onConfirm, table }) {
  const { user } = React.useContext(UserContext);
  const { t } = useLanguage();
  const theme = useTheme();
  const [comment, setComment] = useState('');
  const [numDiners, setNumDiners] = useState(2);
  const [selectedWaiter, setSelectedWaiter] = useState(user?._id || '');
  const [waiters, setWaiters] = useState([]);
  const [seatRestrictions, setSeatRestrictions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setNumDiners(2);
      setSelectedWaiter(user?._id || '');
      setSeatRestrictions([]);

      const fetchWaiters = async () => {
        try {
          const response = await api.get('/users/waiters');
          setWaiters(response.data);

          const isCurrentUserAWaiter = response.data.some(waiter => waiter._id === user?._id);
          if (!isCurrentUserAWaiter && response.data.length > 0) {
            setSelectedWaiter(response.data[0]._id);
          }
        } catch (error) {
          console.error('Error fetching waiters:', error);
          setWaiters([]);
        }
      };
      fetchWaiters();
    }
  }, [isOpen, user]);

  useEffect(() => {
    setSeatRestrictions(prev => prev.filter(r => r.seatNumber <= numDiners));
  }, [numDiners]);

  const toggleSeatAllergen = (seatNumber, allergen) => {
    setSeatRestrictions(prev => {
      const existing = prev.find(r => r.seatNumber === seatNumber);
      if (existing) {
        const hasAllergen = existing.allergens.includes(allergen);
        const updatedAllergens = hasAllergen
          ? existing.allergens.filter(a => a !== allergen)
          : [...existing.allergens, allergen];
        return prev.map(r => r.seatNumber === seatNumber ? { ...r, allergens: updatedAllergens } : r);
      }
      return [...prev, { seatNumber, allergens: [allergen] }];
    });
  };

  const getSeatAllergens = (seatNumber) => seatRestrictions.find(r => r.seatNumber === seatNumber)?.allergens || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="#363636" color="white">
        <ModalHeader>📋 {t('openTableModalTitle').replace('{tableNumber}', table?.number)}</ModalHeader>
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel color="gray.300">{t('commentsLabel')}</FormLabel>
            <Textarea
              placeholder={t('commentsPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              bg="gray.700"
              _placeholder={{ color: 'gray.400' }}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel color="gray.300">{t('waiterAssignedLabel')}</FormLabel>
            <Select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
            >
              {waiters.map((waiter) => (
                <option
                  key={waiter._id}
                  style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                  value={waiter._id}
                >
                  {waiter.username}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel color="gray.300" textAlign="center">{t('numberOfDinersLabel')}</FormLabel>
            <Flex align="center" justify="center">
              <IconButton
                icon={<FaMinus />}
                onClick={() => setNumDiners(prev => Math.max(1, prev - 1))}
                colorScheme="red"
                size="sm"
                mr={2}
              />
              <Input
                textAlign="center"
                width="50px"
                value={numDiners}
                readOnly
                mx={2}
                bg="gray.700"
                color="white"
              />
              <IconButton
                icon={<FaPlus />}
                onClick={() => setNumDiners(prev => prev + 1)}
                colorScheme="green"
                size="sm"
                ml={2}
              />
            </Flex>
          </FormControl>

          {numDiners > 0 && (
            <FormControl mt={4}>
              <FormLabel color="gray.300">{t('seatRestrictionsTitle')}</FormLabel>
              <Text fontSize="xs" color="gray.400" mb={3}>{t('seatRestrictionsDescription')}</Text>
              <VStack align="stretch" spacing={3}>
                {Array.from({ length: numDiners }, (_, i) => i + 1).map(seatNumber => (
                  <Box key={seatNumber} p={2} borderWidth="1px" borderRadius="md" borderColor="gray.600">
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                      {t('seatLabel').replace('{number}', seatNumber)}
                    </Text>
                    <Wrap spacing={2}>
                      {ALLERGENS.map(allergen => {
                        const active = getSeatAllergens(seatNumber).includes(allergen);
                        return (
                          <WrapItem key={allergen}>
                            <Badge
                              as="button"
                              type="button"
                              onClick={() => toggleSeatAllergen(seatNumber, allergen)}
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
                ))}
              </VStack>
            </FormControl>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} color="gray.300" _hover={{ color: 'white' }} mr={3}>
            Cancelar
          </Button>
          <Button bg="red.500" _hover={{ bg: 'red.600' }} onClick={() => onConfirm(comment, numDiners, selectedWaiter, seatRestrictions)}>
            {t('openTableButton')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
export default OpenTableModal;