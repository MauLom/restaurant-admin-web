import React from 'react';
import { Button } from '@chakra-ui/react';
import { useLanguage } from '../../context/LanguageContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button 
      onClick={toggleLanguage} 
      variant="outline" 
      colorScheme="teal"
      size="lg"
      px={6}
      py={3}
      fontSize="md"
      fontWeight="medium"
      borderRadius="md"
      borderWidth="2px"
      minW="110px"
      position="relative"
      overflow="hidden"
      _hover={{
        transform: "translateY(-2px)",
        transition: "all 0.2s ease-in-out",
        boxShadow: "xl",
        bg: "teal.500",
        backdropFilter: "blur(10px)",
        borderColor: "teal.300",
        color: "white",
        // Efecto de brillo liquid glass
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
          borderRadius: "md",
          pointerEvents: "none"
        }
      }}
      _active={{
        transform: "translateY(0)",
        boxShadow: "lg",
        backdropFilter: "blur(8px)"
      }}
    >
      {language === 'en' ? 'Español' : 'English'}
    </Button>
  );
}

export default LanguageSwitcher;
