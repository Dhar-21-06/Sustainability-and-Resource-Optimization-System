// components/auth/GoogleAuthPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import GoogleAuthButton from './GoogleAuthButton';
import citBg from '../../assets/cit-bg.jpeg'; // Adjust path as needed

const GoogleAuthPage = () => {
  const { role } = useParams(); // 'faculty' or 'admin'
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-sm brightness-75 transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${citBg})` }}
      />

      {/* Semi-transparent radial overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-white/50 to-transparent z-10 pointer-events-none" />

      {/* Floating welcome background slanted text */}
      <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none">
        <h2 className="text-6xl font-black text-white/10 italic select-none transform rotate-[-6deg] tracking-widest animate-pulse">
          Welcome to CIT Portal
        </h2>
      </div>

      {/* Foreground content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-xl bg-white/30 backdrop-blur-md p-10 rounded-xl shadow-lg border border-white/20">
          <h1 className="text-4xl font-extrabold text-indigo-800 mb-4">
            Welcome, {capitalizedRole}!
          </h1>
          <p className="text-sm text-gray-600 italic mb-8">
            Only users with <strong>@citchennai.net</strong> email addresses are allowed.
          </p>

          {/* Google Auth Button with glowing ring animation */}
          <div className="relative flex justify-center">
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="animate-ping w-28 h-12 rounded-lg bg-blue-400 opacity-30"></div>
            </div>
            <GoogleAuthButton role={role} />
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Having trouble signing in? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthPage;