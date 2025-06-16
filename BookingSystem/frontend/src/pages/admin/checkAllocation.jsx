import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar.jsx';
import AdminHeader from '../../components/common/admin_c/AdminHeader.jsx';
import AdminFooter from '../../components/common/admin_c/AdminFooter.jsx';
import LabCard from '../../components/common/admin_c/LabCard.jsx';

const CheckAllocation = () => {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/slots/all');  // You'll need to create this route
        setLabs(res.data); // Should return array: [{ labName, slots: [{ time, status }] }]
      } catch (err) {
        console.error('Failed to fetch slots:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-blue-800 mb-6">Check Lab Allocation</h1>
        {labs.map((lab, index) => (
          <LabCard key={index} {...lab} />
        ))}
      </main>
    </div>
  );
};

export default CheckAllocation;
