// components/auth/SignupForm.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import GoogleAuthButton from './GoogleAuthButton';

const SignupForm = () => {
  const { role } = useParams(); // faculty/admin
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      });

      console.log('✅ Registered:', res.data);
      navigate(`/login/${role}`);
    } catch (err) {
      console.error('❌ Registration failed:', err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h2 className="text-2xl font-bold mb-4 capitalize">Signup as {role}</h2>
      <form onSubmit={handleSignup} className="w-full max-w-sm bg-gray-100 p-6 rounded-lg shadow">
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="John Doe"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="example@mail.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="********"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Create Account
        </button>

        <div className="text-center text-sm mt-4">
          Already have an account?{' '}
          <Link to={`/login/${role}`} className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>

        <div className="mt-4">
          <GoogleAuthButton role={role} />
        </div>
      </form>
    </div>
  );
};

export default SignupForm;