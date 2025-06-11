// components/auth/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import GoogleAuthButton from './GoogleAuthButton';

const LoginForm = () => {
  const navigate = useNavigate();
  const { role } = useParams(); // 'faculty' or 'admin'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role
      });

      console.log('✅ Login success:', res.data);
      // You may want to save token or user info in localStorage/session
      // localStorage.setItem('token', res.data.token);

      if (role === 'faculty') {
        navigate('/faculty/home');
      } else {
        navigate('/admin/home');
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h2 className="text-2xl font-bold mb-4 capitalize">Login as {role}</h2>
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-gray-100 p-6 rounded-lg shadow">
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@mail.com"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline">
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Login
        </button>
        <div className="text-center text-sm mt-4">
          New user?{' '}
          <Link to={`/signup/${role}`} className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
        <div className="mt-4">
          <GoogleAuthButton role={role} />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
