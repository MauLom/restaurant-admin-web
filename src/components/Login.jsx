import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { Box, Button, Input } from '@chakra-ui/react';

const Login = () => {
  const { setUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Mock login
    const mockUser = { _id: '12345', username };
    setUser(mockUser);
  };

  return (
    <Box>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin}>Login</Button>
    </Box>
  );
};

export default Login;
