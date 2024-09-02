import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

function WebSocketDemo() {
  const [messages, setMessages] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const socket = new WebSocket('wss://example.com/socket');

    socket.onmessage = event => {
      setMessages(prev => [...prev, event.data]);
    };

    socket.onopen = () => {
      console.log('WebSocket connected.');
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected.');
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      <h3>{t('webSocketMessages')}</h3>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default WebSocketDemo;
