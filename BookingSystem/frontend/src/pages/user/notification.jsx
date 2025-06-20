import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Notification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id;

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
  <h1 className="text-3xl font-bold mb-6 text-blue-800">Your Notifications</h1>
  {notifications.length === 0 ? (
    <p className="text-gray-600">No notifications yet.</p>
  ) : (
    <ul className="space-y-4">
      {notifications.map((noti, idx) => (
        <li key={idx} className="p-4 border rounded text-gray-800 bg-white shadow">
          {noti.message}
        </li>
      ))}
    </ul>
  )}
</div>
  );
}

export default Notification;
