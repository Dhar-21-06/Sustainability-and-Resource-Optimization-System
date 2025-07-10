import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const Backend_url = import.meta.env.VITE_BACKEND;

function AdminNotification() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const handleClearAll = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  await axios.delete(`${Backend_url}/api/notifications/user/${user._id}`);
  setNotifications([]);
};


  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userRes = await axios.get(`${Backend_url}/api/auth/me`, {
          withCredentials: true
        });

        const userId = userRes.data._id;

        const res = await axios.get(`${Backend_url}/api/notifications/admin/${userId}`);
        setNotifications(res.data);

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
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <AdminNavbar />
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
  <h1 className="text-2xl font-bold text-blue-800">All Notifications</h1>
</div>
      {notifications.length === 0 ? (
  <p className="text-gray-600">No notifications yet.</p>
) : (
  <>
    <ul className="space-y-4">
      {notifications.map((noti, idx) => (
        <li
          key={idx}
          className={`p-3 border rounded shadow cursor-pointer transition flex justify-between items-center ${
            !noti.read ? 'bg-blue-100 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'
          } text-gray-800 dark:text-gray-100`}
          onClick={() => {
            if (noti.link) {
              const url = new URL(noti.link, window.location.origin);
              if (noti.bookingId) {
                url.searchParams.append("highlight", noti.bookingId);
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

export default AdminNotification;
