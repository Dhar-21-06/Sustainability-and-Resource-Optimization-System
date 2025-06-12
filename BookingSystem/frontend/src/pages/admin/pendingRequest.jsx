import React from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import RequestCard from '../../components/common/admin_c/RequestCard';

const PendingRequests = () => {
  const requests = [
    {
      lab: 'Computer Lab 1',
      date: '2025-06-12',
      time: '10:00 AM - 12:00 PM',
      faculty: 'Dr. Ravi Kumar'
    },
    {
      lab: 'Electronics Lab',
      date: '2025-06-13',
      time: '2:00 PM - 4:00 PM',
      faculty: 'Prof. Anjali Rao'
    }
  ];

  const handleApprove = (lab) => {
    alert(`Approved booking for ${lab}`);
  };

  const handleReject = (lab) => {
    alert(`Rejected booking for ${lab}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-blue-800 mb-6">Pending Requests</h1>
        {requests.map((req, index) => (
          <RequestCard
            key={index}
            {...req}
            onApprove={() => handleApprove(req.lab)}
            onReject={() => handleReject(req.lab)}
          />
        ))}
      </main>
    </div>
  );
};

export default PendingRequests;
