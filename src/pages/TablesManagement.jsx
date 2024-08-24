import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Flex, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, SimpleGrid, IconButton, Tooltip } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CopyIcon } from '@chakra-ui/icons';
import { Rnd } from 'react-rnd';
import axios from 'axios';

const TablesManagement = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(null); // Track the table for which overlay is visible
  const [draggedTable, setDraggedTable] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddTableOpen, onOpen: onOpenAddTable, onClose: onCloseAddTable } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [newSectionName, setNewSectionName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableMaxPeople, setNewTableMaxPeople] = useState(4);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await axios.get(`${API_URL}/tablesManagement/sections`);
        setSections(response.data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, [API_URL]);

  const handleAddSection = async () => {
    try {
      const response = await axios.post(`${API_URL}/tablesManagement/sections/create`, { name: newSectionName });
      setSections([...sections, response.data]);
      onClose();
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleAddTable = async () => {
    try {
      const response = await axios.post(`${API_URL}/tablesManagement/sections/${currentSectionId}/tables/create`, {
        name: newTableName,
        position: { x: 50, y: 50 },
        maxPeople: newTableMaxPeople
      });
      const updatedSections = sections.map(section =>
        section._id === currentSectionId
          ? { ...section, tables: [...section.tables, response.data] }
          : section
      );
      setSections(updatedSections);
      onCloseAddTable();
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  const handleTableDrag = (sectionId, tableId, x, y) => {
    const updatedSections = sections.map(section => {
      if (section._id === sectionId) {
        const updatedTables = section.tables.map(table =>
          table._id === tableId ? { ...table, position: { x, y } } : table
        );
        return { ...section, tables: updatedTables };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const handleTableDragStop = async (tableId, x, y) => {
    try {
      await axios.put(`${API_URL}/tablesManagement/tables/update/${tableId}`, { position: { x, y } });
    } catch (error) {
      console.error('Error updating table position:', error);
    }
  };

  const handleTableDelete = async (tableId) => {
    try {
      await axios.delete(`${API_URL}/tablesManagement/tables/delete/${tableId}`);
      const updatedSections = sections.map(section => ({
        ...section,
        tables: section.tables.filter(table => table._id !== tableId)
      }));
      setSections(updatedSections);
      setOverlayVisible(null); // Hide overlay after deleting
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const handleSectionClick = (sectionId) => {
    // Toggle section expansion, and prevent collapsing after drag
    setSelectedSection(prevSection => (prevSection === sectionId ? sectionId : sectionId)); // Keep the same section expanded
  };

  const handleTableEdit = () => {
    if (editingTable) {
      // Handle the save logic here
      setEditingTable(null); // Clear editing state
      onCloseEditModal();
    }
  };

  const handleTableDuplicate = async () => {
    if (overlayVisible) {
      try {
        const duplicatedTable = { ...overlayVisible, name: `${overlayVisible.name} Copy` };
        const response = await axios.post(`${API_URL}/tablesManagement/sections/${currentSectionId}/tables/create`, duplicatedTable);
        const updatedSections = sections.map(section =>
          section._id === currentSectionId
            ? { ...section, tables: [...section.tables, response.data] }
            : section
        );
        setSections(updatedSections);
        setOverlayVisible(null); // Hide overlay after duplicating
      } catch (error) {
        console.error('Error duplicating table:', error);
      }
    }
  };

  return (
    <Box p={4} position="relative">
      <Flex justifyContent="space-between" mb={4}>
        <Text fontSize="2xl">Tables Management</Text>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={onOpen}>
          Add Section
        </Button>
      </Flex>

      <SimpleGrid columns={[1, 1, 2, 3]} spacing={4}>
        {sections.map(section => {
          const isSelected = selectedSection === section._id;
          return (
            <Box
              key={section._id}
              p={isSelected ? 8 : 4}
              borderWidth="1px"
              borderRadius="lg"
              onClick={() => handleSectionClick(section._id)}
              cursor="pointer"
              position={isSelected ? "relative" : "static"}
              height={isSelected ? "auto" : "150px"}
              width={isSelected ? "100%" : "auto"}
              transition="all 0.3s ease"
              gridColumn={isSelected ? "1 / -1" : "auto"}
              gridRow={isSelected ? "span 1" : "auto"}
            >
              <Flex justifyContent="space-between" alignItems="center" mb={2}>
                <Text fontSize="lg">{section.name}</Text>
                {isSelected && (
                  <Button size="sm" colorScheme="teal" onClick={() => {
                    setCurrentSectionId(section._id);
                    onOpenAddTable();
                  }}>
                    Add Table
                  </Button>
                )}
              </Flex>
              <Box
                position="relative"
                height={isSelected ? "600px" : "100px"}
                width="100%"
                bg="gray.100"
                borderWidth="1px"
                overflow="hidden"
                transition="all 0.3s ease"
              >
                {section.tables.map(table => (
                  <Rnd
                    key={table._id}
                    size={{ width: 100, height: 100 }}
                    position={{ x: table.position.x, y: table.position.y }}
                    bounds="parent"
                    onDrag={(e, d) => handleTableDrag(section._id, table._id, d.x, d.y)}
                    onDragStop={(e, d) => handleTableDragStop(table._id, d.x, d.y)}
                    disableDragging={!isSelected}
                    onDoubleClick={() => setOverlayVisible(table)} // Show overlay on double-click
                  >
                    <Box
                      bg="white"
                      border="1px solid"
                      borderColor="gray.400"
                      p={4}
                      textAlign="center"
                      boxShadow="md"
                      cursor={isSelected ? "pointer" : "default"}
                      position="relative"
                    >
                      {table.name} <br /> {table.numberOfPeople} / {table.maxPeople}
                      {overlayVisible && overlayVisible._id === table._id && (
                        <Flex
                          position="absolute"
                          top="0"
                          left="50%"
                          transform="translateX(-50%)"
                          bg="white"
                          borderRadius="md"
                          boxShadow="lg"
                          p={2}
                          mt={-8}
                          zIndex={10}
                        >
                          <Tooltip label="Edit Table">
                            <IconButton
                              icon={<EditIcon />}
                              onClick={() => {
                                setEditingTable(table);
                                onOpenEditModal();
                                setOverlayVisible(null);
                              }}
                              size="sm"
                              mr={2}
                            />
                          </Tooltip>
                          <Tooltip label="Duplicate Table">
                            <IconButton
                              icon={<CopyIcon />}
                              onClick={handleTableDuplicate}
                              size="sm"
                              mr={2}
                            />
                          </Tooltip>
                          <Tooltip label="Delete Table">
                            <IconButton
                              icon={<DeleteIcon />}
                              onClick={() => handleTableDelete(table._id)}
                              size="sm"
                              colorScheme="red"
                            />
                          </Tooltip>
                        </Flex>
                      )}
                    </Box>
                  </Rnd>
                ))}
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Modal for adding a new section */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Section</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Section Name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddSection}>
              Add Section
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for editing a table */}
      <Modal isOpen={isEditModalOpen} onClose={onCloseEditModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Table</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Table Name"
              value={editingTable?.name || ""}
              onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
            />
            <Input
              placeholder="Max People"
              type="number"
              mt={2}
              value={editingTable?.maxPeople || ""}
              onChange={(e) => setEditingTable({ ...editingTable, maxPeople: parseInt(e.target.value) })}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleTableEdit}>
              Save Changes
            </Button>
            <Button onClick={onCloseEditModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TablesManagement;
