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
  <h1 className="text-3xl font-bold mb-6 text-blue-800">Your Notifications</h1>
  {notifications.length === 0 ? (
    <p className="text-gray-600">No notifications yet.</p>
  ) : (
    <ul className="space-y-4">
  {notifications.map((noti, idx) => (
    <li
      key={idx}
      className="p-4 border rounded text-gray-800 bg-white shadow cursor-pointer hover:bg-blue-50 transition"
      onClick={() => {
  if (noti.link) {
    navigate(noti.link);
    setTimeout(() => {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }, 0); // manually trigger hashchange for React Router
  }
}}
    >
      {noti.message}
      <button
  onClick={async () => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${noti._id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== noti._id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  }}
  className="ml-4 text-sm text-red-500 hover:underline"
>
  Delete
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
