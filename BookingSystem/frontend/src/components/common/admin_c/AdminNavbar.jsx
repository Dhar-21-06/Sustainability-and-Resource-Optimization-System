import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';
import logo from '../../../assets/cit-chennai-logo.png';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';
import { useRef } from 'react';
import LogoutModal from '../../common/LogoutModal';
import DarkModeToggle from '../../common/DarkModeToggle'; // adjust path if needed

function AdminNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifDropdownRef = useRef(null);
  const Backend_url = import.meta.env.VITE_BACKEND;

  const navigate = useNavigate();

  useEffect(() => {
  const fetchUnreadCount = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const res = await axios.get(`${Backend_url}/api/notifications/unread-count/${user._id}`);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  fetchUnreadCount();

  const interval = setInterval(fetchUnreadCount, 5000); // optional refresh every 5s
  return () => clearInterval(interval);
}, []);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
  const handleClickOutsideNotif = (event) => {
    if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
      setShowNotifDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutsideNotif);
  return () => {
    document.removeEventListener('mousedown', handleClickOutsideNotif);
  };
}, []);


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/admin/profile');
  };

  const confirmLogout = () => {
  localStorage.removeItem('token');
  navigate('/');
};

const openLogoutModal = () => {
  setShowLogoutModal(true);
};

const closeLogoutModal = () => {
  setShowLogoutModal(false);
};


  const handleBellClick = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  try {
    const res = await axios.get(`${Backend_url}/api/notifications/admin/${userId}`);
    setNotifications(res.data);
    setShowNotifDropdown(!showNotifDropdown);

    // Mark all as read
    await Promise.all(res.data.map(async (noti) => {
      if (!noti.read) {
        await axios.patch(`${Backend_url}/api/notifications/read/${noti._id}`);
      }
    }));

  } catch (err) {
    console.error('Failed to fetch admin notifications', err);
  }
};


  return (
    <nav className="navbar bg-blue-900 dark:bg-gray-950 text-white shadow-md">
    <div
      className="navbar-logo cursor-pointer flex items-center"
      onClick={() => navigate('/admin/home')}
    >
      <img src={logo} alt="CIT Logo" className="h-10 w-auto mr-2" />
      <span className="text-white font-bold text-lg">Booking System</span>
    </div>


      <ul className="navbar-links">

        <li className="notification-bell" ref={notifDropdownRef}>
          <button onClick={handleBellClick} className="relative p-1 rounded-full hover:bg-gray-200">
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="notification-dropdown animate-fadeIn z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md w-72">
              <div className="notif-header px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">Notifications</div>
              {notifications.length === 0 ? (
                <div className="notif-item">No notifications</div>
              ) : (
                notifications.slice(0, 1).map((noti, idx) => (
                  <div
                    key={idx}
                    className="notifnotif-item px-4 py-2 cursor-pointer text-sm text-gray-800 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-gray-800 transition"
                    onClick={() => {
                      if (noti.link) {
                        const url = new URL(noti.link, window.location.origin);
                        if (noti.bookingId) {
                          url.searchParams.append("highlight", noti.bookingId);
                        }
                        navigate(url.pathname + url.search);
                      } else {
                        navigate('/admin/notifications');
                      }
                    }}
                  >
                    {noti.message}
                  </div>
                ))
              )}
              <div
                className="see-all px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer border-t border-gray-200 dark:border-gray-700"
                onClick={() => navigate('/admin/notifications')}
              >
                See all Notifications →
              </div>
            </div>
          )}
        </li>

  <li>
    <Link to="/admin/home">Home</Link>
  </li>

    <li className="relative" ref={dropdownRef}>
    <button
      onClick={toggleDropdown}
      className="text-white hover:text-gray-300 font-semibold"
    >
      Profile ▾
    </button>

    {dropdownOpen && (
      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
        {/* Profile Section */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-800 dark:text-gray-100 font-semibold">Admin</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Manage your settings</p>
        </div>

        {/* Edit Profile */}
        <button
          onClick={handleEditProfile}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12-6v12a2 2 0 01-2 2H5a2 2 0
            01-2-2V6a2 2 0 012-2h4l2-2h6a2 2 0 012 2z" />
          </svg>
          Edit Profile
        </button>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0
              00-2-2h-3a2 2 0 00-2 2v1" />
          </svg>
          Logout
        </button>

        {/* Divider */}
        <hr className="border-t border-gray-200 dark:border-gray-700" />

        {/* Dark Mode Toggle */}
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mode</span>
          <DarkModeToggle />
        </div>
      </div>
    )}
  </li>

</ul>
    <LogoutModal 
  isOpen={showLogoutModal} 
  onClose={() => setShowLogoutModal(false)} 
  onConfirm={confirmLogout} 
/>

    </nav>
  );
}

export default AdminNavbar;
