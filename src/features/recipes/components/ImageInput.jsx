import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, HStack, Input, Image, Text, VStack,
  Tabs, TabList, Tab, TabPanels, TabPanel, IconButton,
} from '@chakra-ui/react';
import { FaUpload, FaLink, FaTimes } from 'react-icons/fa';
import api from '../../../services/api';

export const getApiRoot = () => {
  const apiUrl = process.env.REACT_APP_API_URL || '/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const resolveImageUrl = (image) => {
  if (!image?.url) return '';
  if (image.isUpload) return `${getApiRoot()}${image.url}`;
  return image.url;
};

function ImageInput({ value, onChange, placeholder = 'URL de imagen...', previewMaxH = '120px' }) {
  const [tabIndex, setTabIndex] = useState(value?.isUpload ? 1 : 0);
  const [urlInput, setUrlInput] = useState(!value?.isUpload ? value?.url || '' : '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!value?.isUpload) {
      setUrlInput(value?.url || '');
      setTabIndex(0);
    }
  }, [value?.url, value?.isUpload]);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    onChange({ url, isUpload: false });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setUploadError('');
    try {
      const response = await api.post('/recipes/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(response.data);
    } catch {
      setUploadError('No se pudo subir la imagen. Intenta con una URL.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setUrlInput('');
    onChange({ url: '', isUpload: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewSrc = resolveImageUrl(value);

  return (
    <VStack align="stretch" spacing={2}>
      <Tabs index={tabIndex} onChange={setTabIndex} size="sm" variant="soft-rounded">
        <TabList>
          <Tab gap={1}><FaLink />&nbsp;URL</Tab>
          <Tab gap={1}><FaUpload />&nbsp;Subir</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={2}>
            <HStack>
              <Input
                value={urlInput}
                onChange={handleUrlChange}
                placeholder={placeholder}
                size="sm"
              />
              {urlInput && (
                <IconButton icon={<FaTimes />} size="sm" onClick={handleClear} aria-label="Limpiar" />
              )}
            </HStack>
          </TabPanel>
          <TabPanel p={0} pt={2}>
            <HStack>
              <Button
                size="sm"
                leftIcon={<FaUpload />}
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
                loadingText="Subiendo..."
              >
                Seleccionar imagen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              {value?.isUpload && value?.url && (
                <IconButton icon={<FaTimes />} size="sm" onClick={handleClear} aria-label="Limpiar" />
              )}
            </HStack>
            {uploadError && <Text fontSize="xs" color="red.400" mt={1}>{uploadError}</Text>}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {previewSrc && (
        <Box mt={1}>
          <Image
            src={previewSrc}
            alt="Vista previa"
            maxH={previewMaxH}
            objectFit="cover"
            borderRadius="md"
            fallback={<Text fontSize="xs" color="gray.400">No se puede cargar la imagen</Text>}
          />
        </Box>
      )}
    </VStack>
  );
}

export default ImageInput;
