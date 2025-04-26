import { extendTheme } from '@chakra-ui/react';
import { Button } from './components/Button';
import { Select } from './components/Select';
import { Toast } from './components/Toast';
import { colors } from './foundations/colors';
import { fonts } from './foundations/fonts';

const theme = extendTheme({
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: 'background',
        color: 'text',
      },
      '.logo': {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'white',
      },
    },
  },
  components: {
    Button,
    Select,
    Toast,
  },
  colors,
  fonts,
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default theme;
