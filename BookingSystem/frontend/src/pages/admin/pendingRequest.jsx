import React from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import RequestCard from '../../components/common/admin_c/RequestCard';

const PendingRequests = () => {
  const storedRequests = JSON.parse(localStorage.getItem('pendingRequests')) || [];
  const [requests, setRequests] = React.useState(storedRequests);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [selectedRejectIndex, setSelectedRejectIndex] = React.useState(null);
  const [confirmationMessage, setConfirmationMessage] = React.useState('');
  const [showConfirmation, setShowConfirmation] = React.useState(false);

  
  const handleApprove = (index) => {
  const updatedRequests = [...requests];
  const approvedRequest = updatedRequests.splice(index, 1)[0];

  const existingApproved = JSON.parse(localStorage.getItem('approvedBookings')) || [];
  existingApproved.push(approvedRequest);
  localStorage.setItem('approvedBookings', JSON.stringify(existingApproved));

  localStorage.setItem('pendingRequests', JSON.stringify(updatedRequests));
  setRequests(updatedRequests);

  setConfirmationMessage(`Approved booking for ${approvedRequest.lab}`);
  setShowConfirmation(true);
};

const handleReject = (index) => {
  setSelectedRejectIndex(index);
  setShowRejectModal(true);
};

const confirmReject = () => {
  if (rejectReason.trim() === '') {
    alert('Please enter a reason for rejection.');
    return;
  }

  const updatedRequests = [...requests];
  const rejectedRequest = updatedRequests.splice(selectedRejectIndex, 1)[0];
  rejectedRequest.reason = rejectReason;

  const existingRejected = JSON.parse(localStorage.getItem('rejectedRequests')) || [];
  existingRejected.push(rejectedRequest);
  localStorage.setItem('rejectedRequests', JSON.stringify(existingRejected));

  localStorage.setItem('pendingRequests', JSON.stringify(updatedRequests));
  setRequests(updatedRequests);

  setShowRejectModal(false);
  setRejectReason('');
  setSelectedRejectIndex(null);

  setConfirmationMessage(`Rejected booking for ${rejectedRequest.lab}`);
  setShowConfirmation(true);
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

{showRejectModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-lg shadow-lg text-center w-96">
      <h3 className="text-lg font-semibold text-red-700 mb-3">Rejection Reason</h3>
      <textarea
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
        placeholder="Type the reason for rejection..."
        className="w-full h-32 p-3 border rounded bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
      ></textarea>
      <div className="flex justify-around mt-4">
        <button
          onClick={confirmReject}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Send
        </button>
        <button
          onClick={() => {
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRejectIndex(null);
          }}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showConfirmation && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-lg shadow-lg text-center w-96">
      <h3 className="text-lg font-semibold text-green-700 mb-3">Notification</h3>
      <p className="text-gray-800 mb-4">{confirmationMessage}</p>
      <button
        onClick={() => setShowConfirmation(false)}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        OK
      </button>
    </div>
  </div>
)}

      </main>
    </div>
  );
};

export default PendingRequests;