import React, { useState } from 'react';
import './navbar.css';
import { Link } from 'react-router-dom';
import logo from '../../../assets/cit-chennai-logo.png';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="CIT Logo" />
        <span>Smart Infrastructure Booking System</span>
      </div>
      <ul className="navbar-links">
        <li><a href="#">Home</a></li>
        <li className="dropdown" onClick={toggleDropdown}>
          <span className="dropdown-toggle">Profile ▾</span>
          {dropdownOpen && (
            <div className="dropdown-content">
              <span className="logout-btn">Logout</span>
              <div> &nbsp; </div>
              <span className="edit-profile"> Edit Profile</span>  
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
