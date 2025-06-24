import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';
import { useLocation } from 'react-router-dom';

const CheckAllocation = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [rejectionData, setRejectionData] = useState(null);
  const currentRef = useRef(null);
  const pendingRef = useRef(null);
  const historyRef = useRef(null);
  const location = useLocation();


  const allLabs = [
    'Gen AI Lab', 'IoT Lab', 'Rane NSK Lab', 'PEGA Lab', 'CAM Lab', 'CAD Lab',
    'Sustainable Material and Surface Metamorphosis Lab', 'Quantum Science Lab',
    'MRuby Lab', 'Cisco Lab', 'Aryabatta Lab', 'Innovation Lab'
  ];

  // Fetch from backend
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        const res = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
        const bookingsFromDB = res.data;

        const withStatus = bookingsFromDB.map((b) => ({
          ...b,
          id: b._id, // for frontend key rendering
        }));

        setBookings(withStatus);
      } catch (err) {
        console.error("Error fetching user bookings", err);
      }
    };

    fetchUserBookings();
  }, [activeTab]);

useEffect(() => {
  const hash = location.hash.replace('#', '');
  if (['current', 'pending', 'history'].includes(hash)) {
    setActiveTab(hash);
  }
}, [location.key]); // this is the key difference


  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const confirmCancellation = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/cancel/${selectedBooking.id}`);
      alert("Booking cancelled");

      // Refresh
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
      const refreshed = res.data.map(b => ({ ...b, id: b._id }));
      setBookings(refreshed);

      setShowModal(false);
      setSelectedBooking(null);
    } catch (err) {
      alert("Failed to cancel booking");
      console.error(err);
    }
  };

  const cancelModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) => {
    const labMatch = selectedLab === 'All' || booking.lab === selectedLab;
    const dateMatch = selectedDate === '' || booking.date === selectedDate;
    return labMatch && dateMatch;
  });

  const currentBookings = filteredBookings.filter(b => b.status === 'Approved');
  const pendingRequests = filteredBookings.filter(b => b.status === 'Pending');
  const bookingHistory = filteredBookings.filter(b =>
    b.status === 'Cancelled' || b.status === 'Rejected' || b.status === 'Completed'
  );

  const handleRebookAttempt = (booking) => {
  const now = new Date();
  const rejectedAt = new Date(booking.rejectionTimestamp);
  const unblockTime = new Date(rejectedAt.getTime() + 24 * 60 * 60 * 1000);

  const timeDiff = unblockTime - now;

  if (timeDiff > 0) {
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    setRejectionData({
      lab: booking.lab,
      time: booking.time,
      date: booking.date,
      cooldown: `${hours}h ${minutes}m`,
    });
    setShowRejectedModal(true);
  } else {
    // You can allow rebooking logic here if cooldown passed
    const newReq = {
      ...booking,
      status: 'Pending',
      id: Date.now(), // temp id
    };
    setBookings(prev => [...prev, newReq]);
  }
};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <div className="p-6 min-h-screen bg-[#f9fafb]">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">My Bookings</h2>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded ${activeTab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
          Current Bookings
        </button>
        <button onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
          Pending Requests
        </button>
        <button onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
          Booking History
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="text-sm font-medium text-gray-700">
          Filter by Lab:
          <select
            className="ml-2 border px-3 py-1 rounded shadow-sm"
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}>
            <option value="All">All</option>
            {allLabs.map((lab, idx) => (
              <option key={idx} value={lab}>{lab}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-gray-700">
          Date:
          <input
            type="date"
            className="ml-2 border px-3 py-1 rounded shadow-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      {/* ================= CURRENT BOOKINGS ================= */}
      {activeTab === 'current' && (
        <div ref={currentRef}>
        {currentBookings.length === 0 ? (
          <p className="text-gray-500">No current bookings.</p>
        ) : (
          <ul className="space-y-4">
            {currentBookings.map((booking) => (
              <li key={booking.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                <div>
                  <p className="text-green-700 font-semibold">{booking.lab}</p>
                  <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Approved</span>
                </div>
                <button
                onClick={() => handleCancelClick(booking)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
        </div>
      )}

      {/* ================= PENDING REQUESTS ================= */}
      {activeTab === 'pending' && (
        <div ref={pendingRef}>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <ul className="space-y-4">
            {pendingRequests.map((booking) => (
              <li key={booking.id} className="p-4 border rounded-xl bg-white flex justify-between items-center">
                <div>
                  <p className="text-blue-700 font-semibold">{booking.lab}</p>
                  <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">🕒 Pending</span>
                </div>
                <button
                  onClick={() => handleCancelClick(booking)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
        </div>
      )}

      {/* ================= BOOKING HISTORY ================= */}
      {activeTab === 'history' && (
        <div ref={historyRef}>
        {bookingHistory.length === 0 ? (
          <p className="text-gray-500">No booking history yet.</p>
        ) : (
          <ul className="space-y-4">
            {bookingHistory.map((booking) => (
              <li key={booking.id} className="p-4 border rounded-xl bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{booking.lab}</p>
                    <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      booking.status === 'Cancelled' ? 'bg-gray-200 text-gray-800' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Optional rebook for rejected */}
                  {booking.status === 'Rejected' && (
                    <button
                    onClick={() => handleRebookAttempt(booking)}
                    className="border px-3 py-1 rounded hover:bg-gray-100"
                    >
                      Rebook
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      )}

      {/* ================= CANCEL MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[300px]">
            <h3 className="text-lg font-semibold mb-3 text-[#1e293b]">Cancel Booking</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to cancel booking for <span className="font-medium">{selectedBooking.lab}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelModal}
                className="px-4 py-1 border border-gray-400 rounded hover:bg-gray-100"
              >
                No
              </button>
              <button
                onClick={confirmCancellation}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== REJECTED MODAL ========== */}
{showRejectedModal && rejectionData && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
      <h2 className="text-xl font-bold mb-3 text-red-700">Slot Blocked</h2>
      <p>
        You were rejected for <strong>{rejectionData.time}</strong> in <strong>{rejectionData.lab}</strong> on <strong>{rejectionData.date}</strong>.
      </p>
      <p className="text-sm text-red-500 mt-2">
        Try again after {rejectionData.cooldown}
      </p>
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setShowRejectedModal(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
)}

    </div>
    </div>
  );
};

export default CheckAllocation;