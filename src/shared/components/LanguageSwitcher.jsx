import React from 'react';
import { Button } from '@chakra-ui/react';
import { useLanguage } from '../../context/LanguageContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button onClick={toggleLanguage} variant="outline" colorScheme="teal">
      {language === 'en' ? 'Español' : 'English'}
    </Button>
  );
}

export default LanguageSwitcher;
