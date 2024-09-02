import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

function LongPollingDemo() {
  const [updates, setUpdates] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUpdates = () => {
      // Simulate an API call
      setTimeout(() => {
        setUpdates(prev => [...prev, `${t('updateMessage')} ${new Date().toLocaleTimeString()}`]);
      }, 5000);
    };

    fetchUpdates();
    const intervalId = setInterval(fetchUpdates, 10000);

    return () => clearInterval(intervalId);
  }, [t]);

  return (
    <div>
      <h3>{t('longPollingUpdates')}</h3>
      <ul>
        {updates.map((update, index) => (
          <li key={index}>{update}</li>
        ))}
      </ul>
    </div>
  );
}

export default LongPollingDemo;
