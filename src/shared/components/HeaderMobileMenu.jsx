import { IconButton, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { FaEllipsisV, FaGlobe, FaMoon, FaPalette, FaSun } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDemoContext } from '../../context/DemoContext';

function HeaderMobileMenu() {
  const { applyRandomTheme, toggleColorMode, colorMode, currentTheme } = useTheme();
  const { isDemoMode } = useDemoContext();
  const { language, setLanguage, t } = useLanguage();

  const handleThemeChange = () => {
    if (isDemoMode) {
      applyRandomTheme();
    } else {
      toggleColorMode();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  const ThemeIcon = isDemoMode ? FaPalette : colorMode === 'dark' ? FaMoon : FaSun;
  const themeLabel = isDemoMode
    ? t('themeButtonLabel')
    : colorMode === 'dark'
      ? t('darkModeButtonLabel')
      : t('lightModeButtonLabel');
  const languageLabel = language === 'en' ? 'Español' : 'English';
  const c = currentTheme.colors;
  const hoverBg = `${c.primary[500]}22`;

  return (
    <Menu placement="bottom-end">
      <MenuButton
        as={IconButton}
        icon={<FaEllipsisV />}
        aria-label={t('moreOptions')}
        variant="ghost"
        color={c.text}
        size="lg"
        _hover={{ bg: hoverBg }}
        _active={{ bg: hoverBg }}
      />
      <MenuList bg={c.interface?.surface || c.background} borderColor={c.primary[500]}>
        <MenuItem
          icon={<ThemeIcon />}
          onClick={handleThemeChange}
          bg={c.interface?.surface || c.background}
          color={c.text}
          _hover={{ bg: hoverBg }}
          _focus={{ bg: hoverBg }}
        >
          {themeLabel}
        </MenuItem>
        <MenuItem
          icon={<FaGlobe />}
          onClick={toggleLanguage}
          bg={c.interface?.surface || c.background}
          color={c.text}
          _hover={{ bg: hoverBg }}
          _focus={{ bg: hoverBg }}
        >
          {languageLabel}
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

export default HeaderMobileMenu;
