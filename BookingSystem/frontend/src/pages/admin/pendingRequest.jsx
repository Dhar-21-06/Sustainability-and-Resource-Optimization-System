import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import axios from 'axios';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import RequestCard from '../../components/common/admin_c/RequestCard';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false);
  const [selectedApproveRequest, setSelectedApproveRequest] = useState(null);
  const [highlightBookingId, setHighlightBookingId] = useState(null);
  const location = useLocation();
  const Backend_url = import.meta.env.VITE_BACKEND;

  // 🧠 Fetch all pending bookings from backend
const fetchPendingRequests = async () => {
  try {
    // Step 1: Get current user from /me
    const userRes = await axios.get(`${Backend_url}/api/auth/me`, {
      withCredentials: true
    });
    const userEmail = userRes.data.email;

    // Step 2: Send to /pending?adminEmail=...
    const pendingRes = await axios.get(`${Backend_url}/api/bookings/pending`, {
      params: { adminEmail: userEmail }
    });

    setRequests(pendingRes.data);
  } catch (err) {
    console.error('Failed to fetch pending requests:', err);
  }
};


  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(() => {
      fetchPendingRequests();
    }, 60000); // ⏱ Refresh every 60 seconds

    return () => clearInterval(interval); // Cleanup    
  }, []);

  useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get("highlight");

  if (bookingId) {
    setHighlightBookingId(bookingId);
    const timer = setTimeout(() => setHighlightBookingId(null), 5000);
    return () => clearTimeout(timer);
  }
}, [location.search]);


  const confirmApprove = async (bookingId) => {
    try {
      await axios.patch(`${Backend_url}/api/bookings/approve/${bookingId}`);
      setConfirmationMessage('Booking Approved Successfully!');
      setShowConfirmation(true);
      fetchPendingRequests(); // Refresh
    } catch (err) {
      alert('Failed to approve booking.');
      console.error(err);
    }
  };

  const handleReject = (bookingId) => {
    setSelectedRequestId(bookingId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejection.');
      return;
    }

    try {
      await axios.patch(`${Backend_url}/api/bookings/reject/${selectedRequestId}`, {
        reason: rejectReason,
      });

      setConfirmationMessage('Booking Rejected.');
      setShowConfirmation(true);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedRequestId(null);
      fetchPendingRequests(); // Refresh
    } catch (err) {
      alert('Failed to reject booking.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-blue-800 mb-6">Pending Requests</h1>

        {requests.length === 0 ? (
          <p className="text-gray-600">No pending requests at the moment.</p>
        ) : (
          requests.map((req) => (
            <RequestCard
  key={req._id}
  {...req}
  facultyName={req.userId?.name}
  highlight={highlightBookingId === req._id}
  onApprove={() => {
    setSelectedApproveRequest(req);
    setShowApproveConfirmModal(true);
  }}
  onReject={() => handleReject(req._id)}
/>

          ))
        )}

        {/* Reject Reason Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg text-center w-96">
              <h3 className="text-lg font-semibold text-red-700 mb-3">Rejection Reason</h3>
              <input
                type="text"
                placeholder="Type the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-3 w-full border p-2 rounded"
              />
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
                    setSelectedRequestId(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approve Confirmation Modal */}
{showApproveConfirmModal && selectedApproveRequest && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-lg shadow-lg text-center w-96">
      <h3 className="text-lg font-semibold text-blue-700 mb-3">Approve Booking</h3>
      <p className="text-gray-800 mb-4">
        Do you want to approve <strong>{selectedApproveRequest.time}</strong> in <strong>{selectedApproveRequest.lab}</strong> on <strong>{selectedApproveRequest.date}</strong>?
      </p>
      <div className="flex justify-around">
        <button
          onClick={() => {
            confirmApprove(selectedApproveRequest._id);
            setShowApproveConfirmModal(false);
            setSelectedApproveRequest(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Yes
        </button>
        <button
          onClick={() => {
            setShowApproveConfirmModal(false);
            setSelectedApproveRequest(null);
          }}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg text-center w-96">
              <h3 className="text-lg font-semibold text-green-700 mb-3">Approved</h3>
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
