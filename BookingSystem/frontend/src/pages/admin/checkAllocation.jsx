import React from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar.jsx';
import AdminHeader from '../../components/common/admin_c/AdminHeader.jsx';
import AdminFooter from '../../components/common/admin_c/AdminFooter.jsx';
import LabCard from '../../components/common/admin_c/LabCard.jsx';

const CheckAllocation = () => {
  const labs = [
    {
      labName: 'Computer Lab 1',
      slots: [
        { time: '9:00 AM - 10:00 AM', status: 'Booked' },
        { time: '10:00 AM - 11:00 AM', status: 'Available' }
      ]
    },
    {
      labName: 'Physics Lab',
      slots: [
        { time: '11:00 AM - 12:00 PM', status: 'Available' },
        { time: '2:00 PM - 3:00 PM', status: 'Booked' }
      ]
    }
  ];

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
