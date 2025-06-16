import React, { useState, useEffect } from 'react';
//booking page
const CheckAllocation = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [bookedSlots, setBookedSlots] = useState({});
  const [approvedBookings, setApprovedBookings] = useState([]);

  const allLabs = [
    'Gen AI Lab', 'IoT Lab', 'Rane NSK Lab', 'PEGA Lab', 'CAM Lab', 'CAD Lab',
    'Sustainable Material and Surface Metamorphosis Lab', 'Quantum Science Lab',
    'MRuby Lab', 'Cisco Lab', 'Aryabatta Lab','Innovation Lab'
  ];

  // Load bookings from localStorage
  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem('myBookings')) || [];
  // ensure `status` exists
  const mapped = saved.map(b => ({
    ...b,
    status: b.status || 'Pending'
  }));
  setBookings(mapped);
  localStorage.setItem('myBookings', JSON.stringify(mapped));
}, []);

useEffect(() => {
  const fetchBookings = () => {
    const saved = JSON.parse(localStorage.getItem('myBookings')) || [];
    setBookings(saved);

    const approved = JSON.parse(localStorage.getItem('approvedBookings')) || [];
setApprovedBookings(approved);



    // Check if any new 'Pending' request was added recently
    if (saved.some(b => b.status === 'Pending')) {
      setShowSuccessMessage(true);

      // Hide after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  };

  fetchBookings();

  window.addEventListener('storage', fetchBookings);

  return () => window.removeEventListener('storage', fetchBookings);
}, [activeTab]);

  useEffect(() => {
  const booked = JSON.parse(localStorage.getItem("bookedSlots")) || {};
  setBookedSlots(booked);
}, [activeTab]);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const confirmCancellation = () => {
    const updated = bookings.filter(b => b.id !== selectedBooking.id);
    setBookings(updated);
    localStorage.setItem('myBookings', JSON.stringify(updated));
    setShowModal(false);
    setSelectedBooking(null);
  };

  const cancelModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter(booking => {
    const labMatch = selectedLab === 'All' || booking.lab === selectedLab;
    const dateMatch = selectedDate === '' || booking.date === selectedDate;
    return labMatch && dateMatch;
  });
  const currentBookings = filteredBookings.filter(b => b.status === 'Approved');
  const pendingRequests = filteredBookings.filter(b => b.status === 'Pending');

  const bookingHistory = filteredBookings.filter(b => b.status === 'Completed' || b.status === 'Rejected');
  const notifications = bookings.filter(b => b.notification);
  const rejectedBookings = filteredBookings.filter(b => b.status === 'Rejected');

  return (
    <div className="p-6 min-h-screen bg-[#f9fafb]">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">My Bookings</h2>
      <div className="flex gap-3 mb-6">
  <button
    onClick={() => setActiveTab('current')}
    className={`px-4 py-2 rounded ${activeTab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
  >
    Current Bookings
  </button>
  <button
    onClick={() => setActiveTab('pending')}
    className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
  >
    Pending Requests
  </button>

  <button
  onClick={() => setActiveTab('rejected')}
  className={`px-4 py-2 rounded ${activeTab === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
>
  Rejected Labs
</button>

  <button
    onClick={() => setActiveTab('history')}
    className={`px-4 py-2 rounded ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
  >
    Booking History
  </button>
</div>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="text-sm font-medium text-gray-700">
          Filter by Lab:
          <select
            className="ml-2 border px-3 py-1 rounded shadow-sm"
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
          >
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

      {activeTab === 'current' && (
  currentBookings.length === 0 && approvedBookings.length === 0 ? (
    <p className="text-gray-500">No current bookings.</p>
  ) : (
    <ul className="space-y-4">
      {currentBookings.map((booking) => (
        <li key={booking.id} className="p-4 border rounded-xl shadow bg-white flex justify-between items-center">
          <div>
            <p className="text-green-700 font-semibold">{booking.lab}</p>
            <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Approved</span>
          </div>
        </li>
      ))}

      {approvedBookings.map((booking, idx) => (
        <li key={idx} className="p-4 border rounded-xl shadow bg-white flex justify-between items-center">
          <div>
            <p className="text-green-700 font-semibold">{booking.lab}</p>
            <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Admin Approved</span>
          </div>
        </li>
      ))}
    </ul>
  )
)}


{activeTab === 'pending' && (
  pendingRequests.length === 0 ? (
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
    <div className="flex gap-2">
      <button
        onClick={() => handleCancelClick(booking)}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Cancel
      </button>
    </div>
  </li>
))}

    </ul>
  )
)}

{activeTab === 'rejected' && (
  rejectedBookings.length === 0 ? (
    <p className="text-gray-500">No rejected bookings.</p>
  ) : (
    <ul className="space-y-4">
      {rejectedBookings.map((booking) => (
        <li key={booking.id} className="p-4 border rounded-xl bg-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-red-700 font-semibold">{booking.lab}</p>
              <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">❌ Rejected</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newReq = {
                    ...booking,
                    id: Date.now(),
                    status: 'Pending'
                  };
                  const updated = [...bookings, newReq];
                  setBookings(updated);
                  localStorage.setItem('myBookings', JSON.stringify(updated));
                }}
                className="border px-3 py-1 rounded"
              >
                Rebook
              </button>
            </div>
          </div>
          {/* Show rejected message if exists */}
          {booking.rejectedMessage && (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Reason: </span>{booking.rejectedMessage}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
)}


{activeTab === 'history' && (
  bookingHistory.length === 0 ? (
    <p className="text-gray-500">No booking history yet.</p>
  ) : (
    <ul className="space-y-4">
      {bookingHistory.map(booking => (
  <li key={booking.id} className="...">
    {/* ... existing lab, date/time, status badge */}
    <div className="flex gap-2">
      {booking.status === 'Rejected' && (
        <button
          onClick={() => {
            const newReq = {
              ...booking,
              id: Date.now(),
              status: 'Pending'
            };
            const updated = [...bookings, newReq];
            setBookings(updated);
            localStorage.setItem('myBookings', JSON.stringify(updated));
          }}
          className="border px-3 py-1 rounded"
        >
          Rebook
        </button>
      )}
      {/* Feedback is optional */}
    </div>
  </li>
))}
    </ul>
  )
)}

{activeTab === 'notifications' && (
  notifications.length === 0 ? (
    <p className="text-gray-500">No notifications yet.</p>
  ) : (
    <ul className="space-y-4">
      {notifications.map((booking) => (
        <li key={booking.id} className="p-4 border rounded-xl bg-white">
          <p className="text-gray-700">{booking.notification}</p>
        </li>
      ))}
    </ul>
  )
)}

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
    </div>
  );
};

export default CheckAllocation;