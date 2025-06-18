import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import logo from '../../../assets/cit-chennai-logo.png';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="CIT Logo" />
        <span>Smart Infrastructure Booking System</span>
      </div>

      <ul className="navbar-links">
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
