import React from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import RequestCard from '../../components/common/admin_c/RequestCard';

const PendingRequests = () => {
  const storedRequests = JSON.parse(localStorage.getItem('pendingRequests')) || [];
const [requests, setRequests] = React.useState(storedRequests);


  const handleApprove = (index) => {
  const updatedRequests = [...requests];
  const approvedRequest = updatedRequests.splice(index, 1)[0];
  localStorage.setItem('pendingRequests', JSON.stringify(updatedRequests));
  setRequests(updatedRequests);
  alert(`Approved booking for ${approvedRequest.lab}`);
};

const handleReject = (index) => {
  const updatedRequests = [...requests];
  const rejectedRequest = updatedRequests.splice(index, 1)[0];
  localStorage.setItem('pendingRequests', JSON.stringify(updatedRequests));
  setRequests(updatedRequests);
  alert(`Rejected booking for ${rejectedRequest.lab}`);
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
    onApprove={() => handleApprove(index)}
    onReject={() => handleReject(index)}
  />
))}

      </main>
    </div>
  );
};

export default PendingRequests;