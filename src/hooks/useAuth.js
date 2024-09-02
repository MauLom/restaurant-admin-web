import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data from localStorage or an API
    const userData = JSON.parse(localStorage.getItem('user')) || null;
    setUser(userData);
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, login, logout };
}

export default useAuth;
