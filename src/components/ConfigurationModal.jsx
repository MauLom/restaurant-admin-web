// components/ConfigurationModal.jsx
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Switch
} from '@chakra-ui/react';

const ConfigurationModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Menu Configurations</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="show-out-of-stock">Show Out of Stock Items</FormLabel>
            <Switch id="show-out-of-stock" />
          </FormControl>

          <FormControl display="flex" alignItems="center" mt={4}>
            <FormLabel htmlFor="show-price">Display Prices</FormLabel>
            <Switch id="show-price" />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={onClose}>
            Save Changes
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfigurationModal;
