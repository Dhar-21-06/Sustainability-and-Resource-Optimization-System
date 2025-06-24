import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminNotification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id;

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/notifications/admin/${userId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">All Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-600">No notifications yet.</p>
      ) : (
        <ul className="space-y-4">
  {notifications.map((noti, idx) => (
    <li
      key={idx}
      className="p-3 border rounded text-gray-800 bg-white shadow cursor-pointer hover:bg-blue-50 transition"
      onClick={() => {
        if (noti.link) navigate(noti.link);
      }}

    >
      {noti.message}
    </li>
  ))}
</ul>
      )}
    </div>
    </div>
  );
}

export default AdminNotification;
