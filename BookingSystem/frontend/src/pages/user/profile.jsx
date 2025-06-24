import React, { useState, useEffect } from 'react';
import bgImage from '../../assets/my-profile-bg.jpg';

function Profile() {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: ''
  });

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    setFormData(prev => ({
      ...prev,
      email: user.email,
      role: user.role
    }));

    fetch(`http://localhost:5000/api/profile/get-profile/${user.email}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          console.log('Fetched profile:', data);
          setFormData(prev => ({
            ...prev,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            department: data.department || '',
            phoneNumber: data.phoneNumber || ''
          }));
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
      });
  }
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/profile/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (response.ok) {
  // Only save email & role to localStorage, NOT full formData
  const { email, role } = formData;
  localStorage.setItem('user', JSON.stringify({ email, role }));
  alert('Profile updated successfully!');
} else {
  alert(`Failed to update profile: ${data.message || 'Unknown error'}`);
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

          {/* Email */}
          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block font-semibold mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700"
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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
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
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter your last name"
            required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={formData.role === 'Faculty'}
              required={formData.role === 'Admin'}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 bg-white"
            >
              <option value="" disabled>Select your department</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="AIDS">AIDS</option>
              <option value="AIML">AIML</option>
              <option value="BME">BME</option>
              <option value="ECE">ECE</option>
              <option value="VLSI">VLSI</option>
              <option value="ACT">ACT</option>
              <option value="EEE">EEE</option>
              <option value="CSBS">CSBS</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="Mechatronics">Mechatronics</option>
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
                setFormData(prev => ({ ...prev, phoneNumber }));
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="+91-XXXXXXXXXX"
            pattern="[0-9]{10}"
            maxLength="10"
            required
            />

            <small className="text-gray-200">Format: 10-digit mobile number only</small>
          </div>

          {/* Submit Button */}
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