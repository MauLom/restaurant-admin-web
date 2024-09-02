import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import the API service
import { useLanguage } from '../context/LanguageContext';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('waiter');
  const [pin, setPin] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const generatePin = () => {
    // Generate a 6-digit random pin
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();

    setPin(randomPin);

    // Send the pin along with other data to the backend
    api.post('/users/signup', {
      username: username || undefined,
      role: role || undefined,
      pin: randomPin, // Include the generated pin
      pinExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    })
    .then(response => {
      fetchUsers();
      console.log('User created successfully:', response.data);
    })
    .catch(error => {
      console.error('Error generating pin:', error);
    });
  };

  return (
    <div>
      <h2>{t('userManagement')}</h2>
      <input
        type="text"
        placeholder={t('usernamePlaceholder')}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="waiter">{t('rolePlaceholder')}</option>
        <option value="admin">Admin</option>
        <option value="hostess">Hostess</option>
        <option value="cashier">Cashier</option>
        <option value="kitchen">Kitchen</option>
      </select>
      <button onClick={generatePin}>{t('generatePin')}</button>
      {pin && <p>{t('generatedPin')}: {pin}</p>}
      <h3>{t('existingUsers')}</h3>
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.username} ({user.role})</li>
        ))}
      </ul>
    </div>
  );
}

export default UserManagement;
