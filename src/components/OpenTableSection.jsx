import React, { useState, useContext, useEffect } from 'react';
import { Box, Button, Text, VStack, HStack, Input, Textarea, Select, useToast, IconButton } from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import api from '../services/api';
import { UserContext } from '../context/UserContext';

function OpenTableSection({ table, onTableOpened }) {
  const { user } = useContext(UserContext);
  const toast = useToast();
  const [numDiners, setNumDiners] = useState(2);
  const [comment, setComment] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState(user?._id || '');

  const handleOpenTable = async () => {
    try {
      // Actualizar el estado de la mesa a "occupied" y guardar datos adicionales si es necesario
      await api.put(`/tables/${table._id}`, { status: 'occupied', number: table.number, diners: numDiners, comment });
      toast({
        title: 'Mesa abierta',
        description: `La mesa ${table.number} se abrió correctamente.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onTableOpened(); // Notificar al padre para cambiar la vista
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo abrir la mesa.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={4} p={4} borderWidth="1px" borderRadius="md">
      <Text fontSize="lg" fontWeight="semibold">Abrir Mesa {table.number}</Text>
      <Textarea
        placeholder="Comentarios (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <HStack spacing={4}>
        <Text>Comensales:</Text>
        <IconButton icon={<FaMinus />} onClick={() => setNumDiners(prev => Math.max(1, prev - 1))} />
        <Input value={numDiners} width="50px" textAlign="center" readOnly />
        <IconButton icon={<FaPlus />} onClick={() => setNumDiners(prev => prev + 1)} />
      </HStack>
      <Select
        placeholder="Seleccionar camarero"
        value={selectedWaiter}
        onChange={(e) => setSelectedWaiter(e.target.value)}
      >
        <option value={user?._id}>{user?.name}</option>
      </Select>
      <Button colorScheme="red" onClick={handleOpenTable}>
        Abrir Mesa
      </Button>
    </VStack>
  );
}

export default OpenTableSection;
