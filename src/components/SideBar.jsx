import React, { useContext } from 'react';
import { Box, VStack, IconButton, useDisclosure, useBreakpointValue } from '@chakra-ui/react';
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

  // Responsive values for position and layout
  const position = useBreakpointValue({ base: 'bottom', md: 'left' });
  const flexDirection = useBreakpointValue({ base: 'row', md: 'column' });
  const height = useBreakpointValue({ base: '70px', md: '100vh' });
  const width = useBreakpointValue({ base: '100%', md: '70px' });
  const justifyContent = useBreakpointValue({ base: 'space-around', md: 'flex-start' });

  return (
    <Box
      as="aside"
      position="fixed"
      zIndex="1"
      left={position === 'left' ? 0 : undefined}
      bottom={position === 'bottom' ? 0 : undefined}
      height={height}
      width={width}
      bg="gray.800"
      color="white"
      display="flex"
      flexDirection={flexDirection}
      justifyContent="space-between"
      padding="10px"
    >
      <VStack spacing={4} flexDirection={flexDirection} justifyContent={justifyContent}>
        <IconButton aria-label="Home" icon={<HomeIcon size={24} />} onClick={() => navigate('/')} bg="transparent" color="white" />
        <IconButton aria-label="Menu" icon={<RepoIcon size={24} />} onClick={() => navigate('/menu')} bg="transparent" color="white" />
        <IconButton aria-label="Menu" icon={<ListUnorderedIcon size={24} />} onClick={() => navigate('/telegram-orders')} bg="transparent" color="white" />

        {user && (
          <>
            <IconButton aria-label="Orders" icon={<ListUnorderedIcon size={24} />} onClick={() => navigate('/orders')} bg="transparent" color="white" />
            {/* <IconButton aria-label="Analysis" icon={<GraphIcon size={24} />} onClick={() => navigate('/analysis')} bg="transparent" color="white" /> */}
            <IconButton aria-label="Settings" icon={<GearIcon size={24} />} onClick={() => navigate('/settings')} bg="transparent" color="white" />
          </>
        )}
      </VStack>

      <VStack spacing={4} flexDirection={flexDirection}>
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
      {!user && <LoginModal isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
};

export default SideBar;
