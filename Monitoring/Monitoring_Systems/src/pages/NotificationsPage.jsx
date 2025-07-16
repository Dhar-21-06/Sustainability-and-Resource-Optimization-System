import React, { useEffect, useState } from 'react';

const NotificationsPage = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      setAlerts(JSON.parse(stored));
    }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem', color: '#1e2a3a' }}>All Notifications</h2>
      {alerts.length === 0 ? (
        <p style={{ color: '#666' }}>No notifications available.</p>
      ) : (
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
          {alerts
            .slice()
            .reverse()
            .map((alert, idx) => (
              <li key={idx} style={{ marginBottom: '1rem' }}>
                <span>{alert.message}</span>
                <br />
                <small style={{ color: '#999' }}>{new Date(alert.timestamp).toLocaleString()}</small>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
