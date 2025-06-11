// components/auth/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Select Role</h1>
      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelect('faculty')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          Login as Faculty
        </button>
        <button
          onClick={() => handleRoleSelect('admin')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;
