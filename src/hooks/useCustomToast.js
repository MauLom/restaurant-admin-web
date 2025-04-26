import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

export function useCustomToast() {
  const toast = useToast();

  // Siempre regresa una función estable, nunca cambia
  const showToast = useCallback((options) => {
    toast({
      position: 'top-right',  // Siempre saldrán arriba a la derecha
      duration: 3000,          // 3 segundos por defecto
      isClosable: true,
      ...options,              // Permites override por si quieres en casos especiales
    });
  }, [toast]);

  return showToast;
}
