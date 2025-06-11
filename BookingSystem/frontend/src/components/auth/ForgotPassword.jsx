// components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const { role } = useParams(); // 'faculty' or 'admin'
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate sending reset email
    console.log(`Sending password reset link to ${email} for ${role}`);
    setSubmitted(true);

    // Redirect or show confirmation
    setTimeout(() => {
      navigate(`/login/${role}`);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <h2 className="text-2xl font-bold mb-4 capitalize">Forgot Password - {role}</h2>

      {submitted ? (
        <div className="text-center text-green-600 text-lg">
          Password reset link sent to <span className="font-semibold">{email}</span>.
          <br />
          Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-100 p-6 rounded-lg shadow">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Registered Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Send Reset Link
          </button>

          <div className="text-center text-sm mt-4">
            Remember your password?{' '}
            <Link to={`/login/${role}`} className="text-blue-600 hover:underline">
              Go to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
