import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Input,
  HStack,
  Select,
  Grid,
  GridItem,
  Flex,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthContext } from '../context/AuthContext';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../services/api';
import AddSectionForm from './AddSectionForm';

function SectionList() {
  const { t } = useLanguage();
  const { user } = useAuthContext();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [newTable, setNewTable] = useState({ number: '', status: 'available' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();

  // Fetch sections on component mount
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await api.get('/sections');
        setSections(response.data);
      } catch (error) {
        console.error('Error fetching sections:', error);
        toast({
          title: t('errorTitle'),
          description: t('errorFetchingSections'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchSections();
  }, [t, toast]);

  // Handle selecting a section
  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  // Handle adding a new section
  const handleSectionAdded = (newSection) => {
    setSections((prevSections) => [...prevSections, newSection]);
    toast({
      title: t('sectionAddedTitle'),
      description: t('sectionAddedDescription'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handle deleting a section
  const handleDeleteSection = async () => {
    try {
      await api.delete(`/sections/${sectionToDelete}`);
      setSections((prevSections) =>
        prevSections.filter((section) => section._id !== sectionToDelete)
      );
      if (selectedSection && selectedSection._id === sectionToDelete) {
        setSelectedSection(null);
      }
      onClose();
      toast({
        title: t('sectionDeletedTitle'),
        description: t('sectionDeletedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorDeletingSection'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle delete button click for sections
  const handleDeleteClick = (sectionId) => {
    setSectionToDelete(sectionId);
    onOpen();
  };

  // Handle delete button click for tables
  const handleTableDeleteClick = (tableId) => {
    setTableToDelete(tableId);
    onOpen();
  };

  // Handle deleting a table
  const handleTableDelete = async () => {
    try {
      await api.delete(`/sections/${selectedSection._id}/tables/${tableToDelete}`);
      setSelectedSection((prevSection) => ({
        ...prevSection,
        tables: prevSection.tables.filter((table) => table._id !== tableToDelete),
      }));
      onClose();
      toast({
        title: t('tableDeletedTitle'),
        description: t('tableDeletedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorDeletingTable'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle adding a new table
  const handleAddTable = async () => {
    if (!newTable.number.trim()) {
      toast({
        title: t('invalidInputTitle'),
        description: t('tableNumberRequired'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.post(`/sections/${selectedSection._id}/tables`, newTable);
      setSelectedSection((prevSection) => ({
        ...prevSection,
        tables: [...prevSection.tables, response.data],
      }));
      setNewTable({ number: '', status: 'available' });
      toast({
        title: t('tableAddedTitle'),
        description: t('tableAddedDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: t('errorTitle'),
        description: t('errorAddingTable'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Responsive grid columns based on screen size
  const gridTemplateColumns = useBreakpointValue({ base: '1fr', md: '1fr 2fr' });

  return (
    <Box p={4}>
      <Grid templateColumns={gridTemplateColumns} gap={6}>
        {/* Sections List */}
        <GridItem>
          <VStack align="stretch" spacing={4}>
            {user && user.role === 'admin' && (
              <AddSectionForm onSectionAdded={handleSectionAdded} />
            )}
            <Box>
              <Text fontSize="xl" mb={2} fontWeight="bold">
                {t('sections')}
              </Text>
              <VStack spacing={3} align="stretch">
                {sections.map((section) => (
                  <Box
                    key={section._id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    boxShadow="sm"
                    _hover={{ boxShadow: 'md' }}
                    bg={selectedSection && selectedSection._id === section._id ? 'blue.50' : 'white'}
                  >
                    <Flex justify="space-between" align="center">
                      <Button
                        onClick={() => handleSectionClick(section)}
                        variant="ghost"
                        size="md"
                        flex="1"
                        textAlign="left"
                      >
                        {section.name}
                      </Button>
                      {user && user.role === 'admin' && (
                        <IconButton
                          aria-label={t('delete')}
                          icon={<DeleteIcon />}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(section._id)}
                        />
                      )}
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </GridItem>

        {/* Tables List */}
        {selectedSection && (
          <GridItem>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Text fontSize="xl" fontWeight="bold">
                    {selectedSection.name} - {t('tables')}
                  </Text>
                  {user && user.role === 'admin' && (
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => {}}
                    >
                      {t('addTable')}
                    </Button>
                  )}
                </Flex>
                <VStack spacing={3} align="stretch">
                  {selectedSection.tables.map((table) => (
                    <Box
                      key={table._id}
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      boxShadow="sm"
                      bg={table.status === 'available' ? 'green.50' : table.status === 'occupied' ? 'red.50' : 'yellow.50'}
                    >
                      <Flex justify="space-between" align="center">
                        <Button
                          variant="outline"
                          colorScheme={table.status === 'available' ? 'green' : table.status === 'occupied' ? 'red' : 'yellow'}
                          size="md"
                          flex="1"
                          textAlign="left"
                          isDisabled
                        >
                          {table.number} - {t(table.status)}
                        </Button>
                        {user && user.role === 'admin' && (
                          <IconButton
                            aria-label={t('delete')}
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTableDeleteClick(table._id)}
                          />
                        )}
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>

              {/* Add Table Form */}
              {user && user.role === 'admin' && (
                <Box p={4} borderWidth="1px" borderRadius="md" boxShadow="sm">
                  <Text fontSize="md" mb={2} fontWeight="bold">
                    {t('addNewTable')}
                  </Text>
                  <HStack spacing={3}>
                    <Input
                      placeholder={t('tableNumberPlaceholder')}
                      value={newTable.number}
                      onChange={(e) => setNewTable({ ...newTable, number: e.target.value })}
                    />
                    <Select
                      value={newTable.status}
                      onChange={(e) => setNewTable({ ...newTable, status: e.target.value })}
                    >
                      <option value="available">{t('available')}</option>
                      <option value="occupied">{t('occupied')}</option>
                      <option value="reserved">{t('reserved')}</option>
                    </Select>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={handleAddTable}
                    >
                      {t('add')}
                    </Button>
                  </HStack>
                </Box>
              )}
            </VStack>
          </GridItem>
        )}
      </Grid>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="black">
              {t('confirmDelete')}
            </AlertDialogHeader>

            <AlertDialogBody color="black">
              {tableToDelete
                ? t('deleteTableConfirmationText')
                : t('deleteSectionConfirmationText')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} color="black">
                {t('cancel')}
              </Button>
              <Button
                colorScheme="red"
                onClick={tableToDelete ? handleTableDelete : handleDeleteSection}
                ml={3}
                color="white"
              >
                {t('delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default SectionList;
