import React, { useState, useEffect } from 'react';
import bgImage from '../../assets/bg-4.jpg';

const labs = [
  "PEGA COE", "Centre of Additive Manufacturing", "CAD Lab",
  "Centre of Sustainability Material and Surface Metamorphosis", "Quantum Science Lab", "Gen AI Lab",
  "Iot COE", "MRuby Research Centre", "Cisco Lab", "BitSpace", "RANE-NSK Centre", "Incubation Cell",
  "Physics Lab", "Chemistry Lab", "Workshop Lab", "Computer Lab", "Communication Lab",
  "Electrical & Electronics Lab", "Manufacturing Technology Lab", "Electrical Circuit Lab",
  "Electron Devices Lab", "Strength of Materials Lab", "Fluid Mechanics & Machinery Lab",
  "Survey Lab", "Center for Data Science & Research", "KUKA Center for Industrial Robotics",
  "Shri. Parthasarathy Auditorium", "Mini Auditorium and Seminar Hall"
];

function Profile() {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    labIncharge: '',
    phoneNumber: ''
  });
  const Backend_url = import.meta.env.VITE_BACKEND;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        role: user.role
      }));

      fetch(`${Backend_url}/api/profile/get-profile/${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            console.log('Fetched profile:', data);
            setFormData(prev => ({
              ...prev,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              labIncharge: data.labIncharge || '',
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
      const response = await fetch(`${Backend_url}/api/profile/save-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (response.ok) {
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
      className="flex items-center justify-center min-h-screen bg-cover bg-center dark:bg-black"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 rounded-2xl shadow-lg p-8 w-full max-w-xl text-gray-800 dark:text-white">
        <h2 className="text-3xl font-bold text-center mb-6 dark:text-white">My Profile</h2>

        <form onSubmit={handleSave} className="space-y-5">

          <div>
            <label className="block font-semibold mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Role</label>
            <input
              type="text"
              value={formData.role}
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-gray-900"
              placeholder="Enter your first name"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-gray-900"
              placeholder="Enter your last name"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Lab Incharge</label>
            <select
              name="labIncharge"
              value={formData.labIncharge}
              onChange={handleChange}
              disabled={formData.role.toLowerCase() === 'faculty'}
              required={formData.role.toLowerCase() === 'admin'}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-800 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Select your Lab</option>
              {labs.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>

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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black dark:text-white dark:bg-gray-900"
              placeholder="+91-XXXXXXXXXX"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
            <small className="text-gray-200 dark:text-gray-400">Format: 10-digit mobile number only</small>
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