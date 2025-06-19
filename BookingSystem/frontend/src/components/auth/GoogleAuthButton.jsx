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
    }, {
      withCredentials: true, // ✅ Enable cookies to be sent/received
    });

    console.log("✅ Google Auth Response:", res.data);

    // Optional: Save token in localStorage (but you already have cookie)
    localStorage.setItem('user', JSON.stringify(res.data.user));

    // ✅ Now fetch /me to verify token and get complete user details
    const meRes = await axios.get('http://localhost:5000/api/auth/me', {
      withCredentials: true
    });

    console.log("👤 Verified user from /me:", meRes.data);

    const roleFromMe = meRes.data.role;
    if (roleFromMe === 'faculty') {
      navigate('/faculty/home');
    } else if (roleFromMe === 'admin') {
      navigate('/admin/home');
    } else {
      navigate('/');
    }
  } catch (err) {
    console.error('❌ Google login failed:', err.response?.data || err);
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
