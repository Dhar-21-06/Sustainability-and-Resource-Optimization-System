import React from 'react';
import './LogoutModal.css';

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal-container">
        <h2 className="logout-title">Confirm Logout</h2>
        <p className="logout-message">Are you sure you want to log out?</p>
        <div className="logout-modal-buttons">
          <button onClick={onConfirm} className="logout-confirm-btn">Logout</button>
          <button onClick={onClose} className="logout-cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
