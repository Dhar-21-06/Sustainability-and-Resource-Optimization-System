import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';
import { useNavigate } from 'react-router-dom';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const Backend_url = import.meta.env.VITE_BACKEND;
  const handleClearAll = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  await axios.delete(`${Backend_url}/api/notifications/user/${user._id}`);
  setNotifications([]);
};

useEffect(() => {
  const fetchNotifications = async () => {
    const userRes = await axios.get(`${Backend_url}/api/auth/me`, {
      withCredentials: true
    });

    const userId = userRes.data._id;

    try {
      const res = await axios.get(`${Backend_url}/api/notifications/user/${userId}`);
      setNotifications(res.data);

      // ✅ Mark unread notifications as read and locally update their state
      const unreadIds = res.data.filter(n => !n.read).map(n => n._id);
      if (unreadIds.length) {
        await axios.patch(`${Backend_url}/api/notifications/mark-as-read/${userId}`);
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
    axios.get(`${Backend_url}/api/notifications/pre-slot-alerts`)
      .then(res => console.log("⏰ Slot alert check done"))
      .catch(err => console.error("⛔ Slot alert error", err));
  }, 60000); // every 60 seconds

  // ✅ Clear interval on unmount
  return () => clearInterval(interval);

}, []);


  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
    <div className="p-6 max-w-3xl mx-auto">
  <div className="flex items-center justify-between mb-6">
  <h1 className="text-3xl font-bold text-blue-800 dark:text-white">Your Notifications</h1>
  <hr className="my-2 border-gray-300 dark:border-gray-600" />
</div>

  {notifications.length === 0 ? (
  <p className="text-gray-600">No notifications yet.</p>
) : (
  <>
    <ul className="space-y-4">
      {notifications.map((noti, idx) => (
        <li
          key={idx}
          className={`p-3 border rounded shadow cursor-pointer transition flex justify-between items-center
            ${!noti.read ? 'bg-blue-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}
            text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700`}
          onClick={() => {
            if (noti.link) {
              // Construct full URL
              const url = new URL(noti.link, window.location.origin);

              // Append highlight ID if available
              if (noti.bookingId) {
                url.searchParams.set("highlight", noti.bookingId);

                // 🔁 Optional: Smart tab routing based on booking status
                if (noti.message?.toLowerCase().includes('rejected')) {
                  url.searchParams.set("tab", "history");
                } else if (noti.message?.toLowerCase().includes('cancelled')) {
                  url.searchParams.set("tab", "history");
                } else if (noti.message?.toLowerCase().includes('approved')) {
                  url.searchParams.set("tab", "current");
                } else if (noti.message?.toLowerCase().includes('pending')) {
                  url.searchParams.set("tab", "pending");
                }
              }

              navigate(url.pathname + url.search);
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
              await axios.delete(`${Backend_url}/api/notifications/${noti._id}`);
              setNotifications((prev) => prev.filter((n) => n._id !== noti._id));
            }}
            className="text-red-600 dark:text-red-400 text-lg font-bold ml-3 hover:text-red-800 dark:hover:text-red-300"
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
        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-600"
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
