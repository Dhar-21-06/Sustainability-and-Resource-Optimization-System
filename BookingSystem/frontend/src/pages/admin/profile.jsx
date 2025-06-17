import React, { useState, useEffect } from 'react';
import bgImage from '../../assets/my-profile-bg.jpg';


function Profile() {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    labIncharge: '',
    phoneNumber: ''
  });

  useEffect(() => {
    // Example: fetch user data from localStorage after Google sign-in
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      setFormData({
        ...formData,
        email: storedUser.email,
        role: storedUser.role,
        firstName: storedUser.firstName || '',
        lastName: storedUser.lastName || '',
        labIncharge : storedUser.labIncharge || '',
        phoneNumber: storedUser.phoneNumber || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/profile/save-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('user', JSON.stringify(formData));
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
    }

  } catch (err) {
    console.error(err);
    alert('Server error');
  }
};


  return (
    <div
  className="flex items-center justify-center min-h-screen bg-cover bg-center"
  style={{ backgroundImage: `url(${bgImage})` }}
>
      <div className="backdrop-blur-md bg-white bg-opacity-20 rounded-2xl shadow-lg p-8 w-full max-w-xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">My Profile</h2>
        <form onSubmit={handleSave} className="space-y-5">

        <div
  className="fixed inset-0 bg-cover bg-center filter blur-3xl"
  style={{ backgroundImage: `url(${bgImage})`, zIndex: -1 }}
></div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 focus:outline-none"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block font-semibold mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your first name"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block font-semibold mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your last name"
              required
            />
          </div>

          {/* labIncharge */}
<div>
  <label className="block font-semibold mb-1">Lab Incharge</label>
  <select
  name="labIncharge"
  value={formData.labIncharge}
  onChange={handleChange}
  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 bg-white bg-opacity-90"
  required
>
  <option value="" disabled>Select your Lab</option>
  <option value="Aryabatta Lab">Aryabatta Lab</option>
  <option value="CAD Lab">CAD Lab</option>
  <option value="CAM Lab">CAM Lab</option>
  <option value="Cisco Lab">Cisco Lab</option>
  <option value="Gen AI Lab">Gen AI Lab</option>
  <option value="Innovation Lab">Innovation Lab</option>
  <option value="IoT Lab">IoT Lab</option>
  <option value="MRuby Lab">MRuby Lab</option>
  <option value="PEGA Lab">PEGA Lab</option>
  <option value="Quantum Science Lab">Quantum Science Lab</option>
  <option value="Rane NSK Lab">Rane NSK Lab</option>
  <option value="Sustainable Material and Surface Metamorphosis Lab">Sustainable Material and Surface Metamorphosis Lab</option>
</select>
</div>


          {/* Phone Number */}
<div>
  <label className="block font-semibold mb-1">Phone Number</label>
  <input
    type="tel"
    name="phoneNumber"
    value={formData.phoneNumber}
    onChange={(e) => {
      const phoneNumber = e.target.value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, phoneNumber });
    }}
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    placeholder="+91-XXXXXXXXXX"
    pattern="[0-9]{10}"
    maxLength="10"
    required
  />
  <small className="text-gray-500">Format: 10-digit mobile number only</small>
</div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Save Changes
          </button>

        </form>
      </div>
    </div>
  );
}

export default Profile;
