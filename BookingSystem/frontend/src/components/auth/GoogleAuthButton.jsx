  // components/auth/GoogleAuthButton.jsx
  import React from 'react';
  import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
  import axios from 'axios';
  import { useNavigate } from 'react-router-dom';
  console.log("working");

  const Backend_url = import.meta.env.VITE_BACKEND;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


  const GoogleAuthButton = ({ role }) => {
    const navigate = useNavigate();
    const handleSuccess = async (credentialResponse) => {
  try {
    const res = await axios.post(`${Backend_url}/api/auth/google-auth`, {
      tokenId: credentialResponse.credential,
      role,
    }, {
      withCredentials: true, // ✅ Enable cookies to be sent/received
    });

    console.log("✅ Google Auth Response:", res.data);

    // ✅ Now fetch /me to verify token and get complete user details
    const meRes = await axios.get(`${Backend_url}/api/auth/me`, {
      withCredentials: true
    });

    console.log("👤 Verified user from /me:", meRes.data);
    localStorage.setItem("user", JSON.stringify(meRes.data));
    console.log(JSON.stringify(meRes.data, null, 2));

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
      <GoogleOAuthProvider clientId={clientId}>
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
