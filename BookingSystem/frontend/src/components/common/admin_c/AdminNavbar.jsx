import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';
import logo from '../../../assets/cit-chennai-logo.png';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const interval = setInterval(fetchUnreadCount, 5000); // optional refresh every 5s
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
    navigate('/admin/profile');
  };

  const handleBellClick = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  try {
    const res = await axios.get(`http://localhost:5000/api/notifications/admin/${userId}`);
    setNotifications(res.data);
    setShowNotifDropdown(!showNotifDropdown);

    // Mark all as read
    await Promise.all(res.data.map(async (noti) => {
      if (!noti.read) {
        await axios.patch(`http://localhost:5000/api/notifications/read/${noti._id}`);
      }
    }));

  } catch (err) {
    console.error('Failed to fetch admin notifications', err);
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
    onClick={() => navigate(noti.link || '/admin/notifications')}
  >
    {noti.message}
  </div>
))
      )}
      <div
        className="see-all"
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

  <li className="dropdown" onClick={toggleDropdown}>
    <span className="dropdown-toggle">Profile ▾</span>
    {dropdownOpen && (
      <div className="dropdown-content">
        <span className="edit-profile" onClick={handleEditProfile}>
          Edit Profile
        </span>
        <div>&nbsp;</div>
        <span className="logout-btn" onClick={handleLogout}>
          Logout
        </span>
      </div>
    )}
  </li>

</ul>
    </nav>
  );
}

export default Navbar;
