import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';
import { useNavigate } from 'react-router-dom';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const handleClearAll = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  await axios.delete(`http://localhost:5000/api/notifications/user/${user._id}`);
  setNotifications([]);
};

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

  // ✅ Start polling for 30-min slot alerts
  const interval = setInterval(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.role !== 'faculty') return;
    axios.get('http://localhost:5000/api/notifications/pre-slot-alerts')
      .then(res => console.log("⏰ Slot alert check done"))
      .catch(err => console.error("⛔ Slot alert error", err));
  }, 60000); // every 60 seconds

  // ✅ Clear interval on unmount
  return () => clearInterval(interval);

}, []);


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <div className="p-6 max-w-3xl mx-auto">
  <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold text-blue-800">Your Notifications</h1>
</div>

  {notifications.length === 0 ? (
  <p className="text-gray-600">No notifications yet.</p>
) : (
  <>
    <ul className="space-y-4">
      {notifications.map((noti, idx) => (
        <li
          key={idx}
          className={`p-3 border rounded text-gray-800 shadow cursor-pointer transition flex justify-between items-center ${
            !noti.read ? 'bg-blue-100' : 'bg-white'
          }`}
          onClick={() => {
  if (noti.link) {
    const url = new URL(noti.link, window.location.origin);
    if (noti.bookingId) {
      url.searchParams.append("highlight", noti.bookingId);
    }
    navigate(url.pathname + url.search + url.hash);
  }
}}
        >
          <div className="flex flex-col">
            <span>{noti.message}</span>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(noti.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              })}
            </span>
          </div>

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

    {/* Clear All Button aligned to the right */}
    <div className="flex justify-end mt-6">
      <button
        onClick={handleClearAll}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        Clear All Notifications
      </button>
    </div>
  </>
)}

</div>
</div>
  );
}

export default Notification;
