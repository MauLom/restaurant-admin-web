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
import { useLanguage } from '../context/LanguageContext';

const DemoTutorial = ({ currentPage = 'dashboard' }) => {
  const { isDemoMode } = useDemoContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  // Tutorial steps for different pages
  const tutorialSteps = {
    'dashboard': [
      {
        title: t('tutorialDashboardTitle'),
        content: t('tutorialDashboardContent'),
        highlight: t('tutorialDashboardHighlight')
      }
    ],
    'orders': [
      {
        title: t('tutorialOrdersTitle'),
        content: t('tutorialOrdersContent'),
        highlight: t('tutorialOrdersHighlight')
      }
    ],
    'inventory': [
      {
        title: t('tutorialInventoryTitle'),
        content: t('tutorialInventoryContent'),
        highlight: t('tutorialInventoryHighlight')
      }
    ],
    'analytics': [
      {
        title: t('tutorialAnalyticsTitle'),
        content: t('tutorialAnalyticsContent'),
        highlight: t('tutorialAnalyticsHighlight')
      }
    ],
    'manage-items': [
      {
        title: t('tutorialManageItemsTitle'),
        content: t('tutorialManageItemsContent'),
        highlight: t('tutorialManageItemsHighlight')
      }
    ]
  };

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
                {t('tutorialStepCounter').replace('{current}', currentStep + 1).replace('{total}', steps.length)}
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
                {t('skipTutorial')}
              </Button>

              {currentStep > 0 && (
                <Button onClick={handlePrevious} size="sm">
                  {t('tutorialPrevious')}
                </Button>
              )}

              <Button colorScheme="teal" onClick={handleNext}>
                {currentStep === steps.length - 1 ? t('tutorialFinish') : t('tutorialNext')}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DemoTutorial;