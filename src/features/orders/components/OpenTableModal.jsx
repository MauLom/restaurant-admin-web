import React, { useState, useEffect } from 'react';
import {
  Flex, Button, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Textarea, Select, IconButton, FormControl, FormLabel
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

import { UserContext } from '../../../context/UserContext';

function OpenTableModal({ isOpen, onClose, onConfirm, table }) {
  const { user } = React.useContext(UserContext);
  const [comment, setComment] = useState('');
  const [numDiners, setNumDiners] = useState(2);
  const [selectedWaiter, setSelectedWaiter] = useState(user?._id || '');

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setNumDiners(2);
      setSelectedWaiter(user?._id || '');
    }
  }, [isOpen, user]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>📋 Abrir Mesa {table?.number}</ModalHeader>
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel color="gray.300">Comentarios (ej: mesa preferencial, cliente frecuente)</FormLabel>
            <Textarea
              placeholder="Ej: cumpleañera, traer velas, evitar cacahuates"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              bg="gray.700"
              _placeholder={{ color: 'gray.400' }}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel color="gray.300">Camarero asignado</FormLabel>
            <Select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              bg="gray.700"
              _placeholder={{ color: 'gray.400' }}
            >
              <option style={{ backgroundColor: '#2D3748' }} value={user?._id}>{user?.name}</option>
            </Select>
          </FormControl>

          <FormControl mt={4}>
            <FormLabel color="gray.300" textAlign="center">Cantidad de comensales</FormLabel>
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
            Abrir Mesa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
export default OpenTableModal;