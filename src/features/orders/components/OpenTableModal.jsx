import React, { useState, useContext, useEffect } from 'react';
import { 
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Textarea, Select, Flex, IconButton, Input, Button 
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { UserContext } from '../../../context/UserContext';

function OpenTableModal({ isOpen, onClose, onConfirm, table }) {
  const { user } = useContext(UserContext);
  const [comment, setComment] = useState('');
  const [numDiners, setNumDiners] = useState(2);
  const [selectedWaiter, setSelectedWaiter] = useState(user?._id || '');

  // Si el modal se abre, podemos reiniciar sus campos
  useEffect(() => {
    if (isOpen) {
      setComment('');
      setNumDiners(2);
      setSelectedWaiter(user?._id || '');
    }
  }, [isOpen, user]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Abrir Mesa {table?.number}</ModalHeader>
        <ModalBody>
          <Textarea 
            placeholder="Comentarios" 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            mb={4} 
          />
          <Select 
            placeholder="Seleccionar camarero" 
            value={selectedWaiter} 
            onChange={(e) => setSelectedWaiter(e.target.value)} 
            mb={4}
          >
            <option value={user?._id}>{user?.name}</option>
          </Select>
          <Flex align="center" mt={4}>
            <IconButton 
              icon={<FaMinus />} 
              onClick={() => setNumDiners(prev => Math.max(1, prev - 1))} 
            />
            <Input 
              textAlign="center" 
              width="50px" 
              value={numDiners} 
              readOnly 
              mx={2} 
            />
            <IconButton 
              icon={<FaPlus />} 
              onClick={() => setNumDiners(prev => prev + 1)} 
            />
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={() => onConfirm(comment, numDiners, selectedWaiter)}>
            Abrir Mesa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default OpenTableModal;
