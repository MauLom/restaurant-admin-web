import React, { useState, useEffect } from 'react';
import {
  Flex, Button, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, Select, IconButton, FormControl, FormLabel, useTheme
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

import { UserContext } from '../../../context/UserContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

function OpenTableModal({ isOpen, onClose, onConfirm, table }) {
  const { user } = React.useContext(UserContext);
  const { t } = useLanguage();
  const theme = useTheme();
  const [comment, setComment] = useState('');
  const [numDiners, setNumDiners] = useState(2);
  const [selectedWaiter, setSelectedWaiter] = useState(user?._id || '');
  const [waiters, setWaiters] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setNumDiners(2);
      setSelectedWaiter(user?._id || '');

      if (user?.role !== 'waiter') {
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
    }
  }, [isOpen, user]);

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

          {user?.role !== 'waiter' && (
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
          )}

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
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose} color="gray.300" _hover={{ color: 'white' }} mr={3}>
            Cancelar
          </Button>
          <Button bg="red.500" _hover={{ bg: 'red.600' }} onClick={() => onConfirm(comment, numDiners, selectedWaiter)}>
            {t('openTableButton')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
export default OpenTableModal;