import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from '../../../assets/cit-chennai-logo.png';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useEffect } from 'react';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const navigate = useNavigate();

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

  const handleBellClick = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;

  try {
    const res = await axios.get(`http://localhost:5000/api/notifications/user/${userId}`);
    setNotifications(res.data);
    setShowNotifDropdown(!showNotifDropdown);
  } catch (err) {
    console.error('Failed to fetch faculty notifications', err);
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
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {notifications.length}
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
  <div key={idx} className="notif-item">{noti.message}</div>
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
    <Link to="/user/home">Home</Link>
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
