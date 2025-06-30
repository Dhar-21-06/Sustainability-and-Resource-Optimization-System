import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from '../../../assets/cit-chennai-logo.png';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';
import LogoutModal from '../../common/LogoutModal';



function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
  const fetchUnreadCount = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/unread-count/${user._id}`);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  fetchUnreadCount();

  const interval = setInterval(fetchUnreadCount, 5000);
  return () => clearInterval(interval);
}, []);


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/faculty/profile');
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
      const res = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
      setNotifications(res.data);
      setShowNotifDropdown(!showNotifDropdown);

      // Mark all as read immediately
      await Promise.all(res.data.map(async (noti) => {
        if (!noti.read) {
          await axios.patch(`http://localhost:5000/api/notifications/read/${noti._id}`);
        }
      }));

      // Reset unread count since they're now marked read
      setUnreadCount(0);

    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };


  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="CIT Logo" />
        <span>Smart Infrastructure Booking System</span>
      </div>

      <ul className="navbar-links">

  <li className="notification-bell">
    <button onClick={handleBellClick} className="relative p-1 rounded-full hover:bg-gray-200">
      <Bell className="w-6 h-6 text-white" />
      {unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
    {unreadCount}
  </span>
)}
    </button>

    {showNotifDropdown && (
    <div className="notification-dropdown">
      <div className="notif-header">Notifications</div>
      {notifications.length === 0 ? (
        <div className="notif-item">No notifications</div>
      ) : (
        notifications.slice(0, 1).map((noti, idx) => (
  <div
    key={idx}
    className="notif-item cursor-pointer hover:bg-blue-100 transition"
    onClick={() => {
      if (noti.link) {
        const url = new URL(noti.link, window.location.origin);
        if (noti.bookingId) {
          url.searchParams.append("highlight", noti.bookingId);
        }
        navigate(url.pathname + url.search);
      } else {
        navigate('/faculty/notifications');
      }
    }}
  >
    {noti.message}
  </div>
))
      )}
      <div
        className="see-all"
        onClick={() => navigate('/faculty/notifications')}
      >
        See all Notifications →
      </div>
    </div>
  )}
</li>

  <li>
    <Link to="/faculty/home">Home</Link>
  </li>

  <li className="dropdown" onClick={toggleDropdown}>
    <span className="dropdown-toggle">Profile ▾</span>
    {dropdownOpen && (
      <div className="dropdown-content">
        <span className="edit-profile" onClick={handleEditProfile}>
          Edit Profile
        </span>
        <div>&nbsp;</div>
        <span className="logout-btn" onClick={() => setShowLogoutModal(true)}>
  Logout
</span>
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

export default Navbar;
