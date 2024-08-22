import React, { useContext } from 'react';
import { Box, VStack, IconButton, useDisclosure } from '@chakra-ui/react';
import { HomeIcon, PackageIcon, ListUnorderedIcon, GraphIcon, PersonIcon, SignOutIcon, GearIcon, RepoIcon } from '@primer/octicons-react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import LoginModal from './LoginModal';

const SideBar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove token from localStorage
    setUser(null);  // Clear user context
    navigate('/');  // Redirect to home
  };

  return (
    <Box
      as="aside"
      position="fixed"
      top="0"
      left="0"
      height="100vh"
      width="70px"
      bg="gray.800"
      color="white"
      padding="10px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"  // Push logout button to the bottom
    >
      <VStack spacing={4}>
        <IconButton aria-label="Home" icon={<HomeIcon size={24} />} onClick={() => navigate('/')} bg="transparent" color="white" />
        {user && (
          <>
            {/* <IconButton aria-label="Inventory" icon={<PackageIcon size={24} />} onClick={() => navigate('/inventory')} bg="transparent" color="white" /> */}
            <IconButton aria-label="Orders" icon={<ListUnorderedIcon size={24} />} onClick={() => navigate('/orders')} bg="transparent" color="white" />
            <IconButton aria-label="Analysis" icon={<GraphIcon size={24} />} onClick={() => navigate('/analysis')} bg="transparent" color="white" />
            <IconButton aria-label="Settings" icon={<GearIcon size={24} />} onClick={() => navigate('/settings')} bg="transparent" color="white" />
          </>
        )}
        <IconButton aria-label="Menu" icon={<RepoIcon size={24} />} onClick={() => navigate('/menu')} bg="transparent" color="white" />
      </VStack>

      <VStack>
        {user ? (
          <IconButton
            aria-label="Logout"
            icon={<SignOutIcon size={24} />}
            onClick={handleLogout}
            bg="transparent"
            color="white"
          />
        ) : (
          <IconButton
            aria-label="Login"
            icon={<PersonIcon size={24} />}
            onClick={onOpen}  // Open the login modal
            bg="transparent"
            color="white"
          />
        )}
      </VStack>

      {/* Login Modal */}
      {!user && (
        <LoginModal isOpen={isOpen} onClose={onClose} />
      )}
    </Box>
  );
};

export default SideBar;
