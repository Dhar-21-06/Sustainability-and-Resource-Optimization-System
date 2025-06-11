// components/auth/GoogleAuthButton.jsx
import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleAuthButton = ({ role }) => {
  const navigate = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google-auth', {
        tokenId: credentialResponse.credential,
        role,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 🔁 Navigate based on role
      if (res.data.user.role === 'faculty') {
        navigate('/faculty/home');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/home');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Google login failed', err);
      alert('Google login failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId="850633048309-6m4iriht6aq14t4p3l64arnilkr19rsc.apps.googleusercontent.com">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          alert('Google login failed!');
        }}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthButton;
