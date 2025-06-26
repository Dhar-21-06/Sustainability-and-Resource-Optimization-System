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
      <AdminNavbar />
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
  <h1 className="text-2xl font-bold text-blue-800">All Notifications</h1>
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
  className={`p-3 border rounded text-gray-800 shadow cursor-pointer transition flex justify-between items-center ${
    !noti.read ? 'bg-blue-100' : 'bg-white'
  }`}
  onClick={() => {
    if (noti.link) navigate(noti.link);
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

export default AdminNotification;
