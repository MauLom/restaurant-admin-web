import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

function PushNotification() {
  const { t } = useLanguage();

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  }, []);

  const showNotification = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Test Notification', {
          body: 'This is a test push notification.',
          icon: '/icon.png',
        });
      });
    }
  };

  return (
    <button onClick={showNotification}>{t('showTestNotification')}</button>
  );
}

export default PushNotification;
