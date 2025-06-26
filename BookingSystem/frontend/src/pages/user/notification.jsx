import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';
import { useNavigate } from 'react-router-dom';

function Notification() {
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
      const res = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
      setNotifications(res.data);

// ✅ Mark unread notifications as read and locally update their state
const unreadIds = res.data.filter(n => !n.read).map(n => n._id);
if (unreadIds.length) {
  await axios.patch(`http://localhost:5000/api/notifications/mark-as-read/${userId}`);
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
}
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  fetchNotifications();
}, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <div className="p-6 max-w-3xl mx-auto">
  <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold text-blue-800">Your Notifications</h1>
  <button
    onClick={async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.delete(`http://localhost:5000/api/notifications/user/${user._id}`);
      setNotifications([]);
    }}
    className="text-sm text-red-600 hover:underline"
  >
    Clear All
  </button>
</div>

  {notifications.length === 0 ? (
    <p className="text-gray-600">No notifications yet.</p>
  ) : (
    <ul className="space-y-4">
  {notifications.map((noti, idx) => (
    <li
  key={idx}
  className={`p-4 border rounded text-gray-800 shadow cursor-pointer transition flex justify-between items-center ${
    !noti.read ? 'bg-blue-100' : 'bg-white'
  }`}
  onClick={() => {
    if (noti.link) {
      navigate(noti.link);
      setTimeout(() => {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }, 0);
    }
  }}
>
  <span>{noti.message}</span>
  <button
    onClick={async (e) => {
      e.stopPropagation();
      await axios.delete(`http://localhost:5000/api/notifications/${noti._id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== noti._id));
    }}
    className="text-red-500 text-lg font-bold ml-3"
  >
    ×
  </button>
</li>

  ))}
</ul>
  )}
</div>
</div>
  );
}

export default Notification;
