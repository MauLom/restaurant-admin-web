import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Box,
  useDisclosure
} from '@chakra-ui/react';
import { useDemoContext } from '../context/DemoContext';

// Tutorial steps for different pages
const tutorialSteps = {
  'dashboard': [
    {
      title: '¡Bienvenido al Demo! 🎉',
      content: 'Este es el panel principal del sistema de administración de restaurante. Desde aquí puedes acceder a todas las funcionalidades.',
      highlight: 'Este es un entorno de demostración con datos de ejemplo. Puedes explorar todas las funciones sin afectar datos reales.'
    }
  ],
  'orders': [
    {
      title: 'Gestión de Órdenes 📋',
      content: 'Aquí puedes ver y gestionar todas las órdenes del restaurante. Las órdenes se organizan por mesa y estado.',
      highlight: 'Intenta crear una nueva orden seleccionando una mesa disponible.'
    }
  ],
  'inventory': [
    {
      title: 'Control de Inventario 📦',
      content: 'Supervisa el stock de ingredientes y productos. Los elementos en rojo tienen bajo stock.',
      highlight: 'El sistema te alertará automáticamente cuando los productos estén por agotarse.'
    }
  ],
  'analytics': [
    {
      title: 'Análisis y Reportes 📊',
      content: 'Visualiza las métricas de ventas, productos más vendidos y rendimiento del personal.',
      highlight: 'Los datos se actualizan en tiempo real para tomar mejores decisiones.'
    }
  ],
  'manage-items': [
    {
      title: 'Administrar Menú 🍽️',
      content: 'Gestiona los productos del menú: agregar, editar o eliminar platillos y bebidas.',
      highlight: 'Puedes subir imágenes y configurar ingredientes para cada producto.'
    }
  ]
};

const DemoTutorial = ({ currentPage = 'dashboard' }) => {
  const { isDemoMode } = useDemoContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = tutorialSteps[currentPage] || tutorialSteps['dashboard'];

  useEffect(() => {
    // Show tutorial automatically when entering demo mode
    if (isDemoMode && !localStorage.getItem(`demo-tutorial-seen-${currentPage}`)) {
      onOpen();
    }
  }, [isDemoMode, currentPage, onOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem(`demo-tutorial-seen-${currentPage}`, 'true');
    setCurrentStep(0);
    onClose();
  };

  const handleSkip = () => {
    // Mark all tutorials as seen
    Object.keys(tutorialSteps).forEach(page => {
      localStorage.setItem(`demo-tutorial-seen-${page}`, 'true');
    });
    handleClose();
  };

  if (!isDemoMode) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" closeOnOverlayClick={false}>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between">
              <Text>{steps[currentStep]?.title}</Text>
              <Badge colorScheme="teal">
                Paso {currentStep + 1} de {steps.length}
              </Badge>
            </HStack>
          </ModalHeader>
          
          <ModalBody>
            <VStack spacing={4} align="start">
              <Text>{steps[currentStep]?.content}</Text>
              
              {steps[currentStep]?.highlight && (
                <Box p={4} bg="teal.50" borderRadius="md" borderLeft="4px solid" borderColor="teal.500">
                  <Text fontSize="sm" fontWeight="medium" color="teal.800">
                    💡 {steps[currentStep].highlight}
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={handleSkip} size="sm">
                Saltar Tutorial
              </Button>
              
              {currentStep > 0 && (
                <Button onClick={handlePrevious} size="sm">
                  Anterior
                </Button>
              )}
              
              <Button colorScheme="teal" onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DemoTutorial;