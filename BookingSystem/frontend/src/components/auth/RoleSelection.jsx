// components/auth/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import citBg from '../../assets/cit-bg.jpeg' // Adjust this import path based on where you saved cit-bg.jpeg

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/auth/login/${role}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${citBg})` }}
      />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-10" />

      {/* Animated blurred blobs */}
      <div className="absolute w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl top-10 left-[-80px] animate-pulse z-0" />
      <div className="absolute w-96 h-96 bg-green-300 opacity-20 rounded-full blur-3xl bottom-[-50px] right-[-60px] animate-pulse z-0" />

      {/* Gradient tint overlay (optional) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-200/20 mix-blend-overlay z-10" />
      {/* Floating slanted welcome text */}
      <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none">
        <h2 className="text-6xl font-black text-white/10 italic select-none transform rotate-[-6deg] tracking-widest animate-pulse">
        Welcome to CIT Portal
        </h2>
      </div>

      {/* Foreground content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-xl bg-white/60 p-10 rounded-xl shadow-lg backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-4 drop-shadow">
            Welcome to the Resource Booking System
          </h1>
          <p className="text-sm text-gray-600 italic mb-8">
            Use your @citchennai.net Google account to sign in. No signup required!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelect('faculty')}
              className="px-6 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl shadow-md hover:bg-blue-700 transition-all"
            >
               Login as Faculty
            </button>
            <button
              onClick={() => handleRoleSelect('admin')}
              className="px-6 py-4 bg-green-600 text-white font-semibold text-lg rounded-xl shadow-md hover:bg-green-700 transition-all"
            >
               Login as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
