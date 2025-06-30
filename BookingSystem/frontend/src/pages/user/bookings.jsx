import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const CheckAllocation = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [rejectionData, setRejectionData] = useState(null);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [highlightBookingId, setHighlightBookingId] = useState(null);
  const [urlHighlightId, setUrlHighlightId] = useState(null);
  const currentRef = useRef(null);
  const pendingRef = useRef(null);
  const historyRef = useRef(null);
  const location = useLocation();
  const [showRebookConfirmModal, setShowRebookConfirmModal] = useState(false);
  const [rebookedBooking, setRebookedBooking] = useState(null);
  const [showRebookSuccessModal, setShowRebookSuccessModal] = useState(false);
  const [showAlreadyBookedModal, setShowAlreadyBookedModal] = useState(false);
  const navigate = useNavigate();


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
        const updatedBookings = bookingsFromDB;
        const withStatus = bookingsFromDB.map((b) => ({
          ...b,
          id: b._id.toString(), // for frontend key rendering
        }));

        setBookings(withStatus.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Error fetching user bookings", err);
      }
    };

    fetchUserBookings();
  }, [activeTab]);

useEffect(() => {
  const params = new URLSearchParams(location.search);  
  const bookingId = params.get('highlight');
  let tab = params.get('tab');

  // Fallback logic based on bookingId status
  if (!tab && bookingId && bookings.length > 0) {
    const matchedBooking = bookings.find(b => b._id === bookingId);
    if (matchedBooking) {
      const status = matchedBooking.status;
      if (status === 'Pending') tab = 'pending';
      else if (['Rejected', 'Completed', 'Cancelled'].includes(status)) tab = 'history';
      else tab = 'current';
    } else {
      tab = 'current'; // fallback if booking not found
    }
  } else if (!tab) {
    tab = 'current';
  }

  setActiveTab(tab);
  setHighlightBookingId(bookingId);

  if (bookingId) {
    const timer = setTimeout(() => setHighlightBookingId(null), 5000);
    return () => clearTimeout(timer);
  }

  if (highlightBookingId) {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      params.delete('highlight');
      params.set('tab', activeTab);
      navigate(`?${params.toString()}`, { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }

}, [location.search, highlightBookingId]);


 // this is the key difference


  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const confirmCancellation = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/cancel/${selectedBooking.id}`);
      setShowCancelSuccessModal(true);

      // Refresh
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
      const refreshed = res.data.map(b => ({ ...b, id: b._id.toString() }));
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

  const currentBookings = filteredBookings.filter(b => {
    if (b.status !== 'Approved') return false;

    const [startTime] = b.time.split('-');
    const bookingDateTime = new Date(`${b.date}T${startTime}:00`);
    return bookingDateTime > new Date();
  });
  const pendingRequests = filteredBookings.filter(b => {
    if (b.status !== 'Pending') return false;

    // Check if slot is still within 30 min of start time
    const [startTime] = b.time.split('-');
    const slotStart = new Date(`${b.date}T${startTime.trim()}:00`);
    const expiry = new Date(slotStart.getTime() + 30 * 60 * 1000); // +30 mins
    return new Date() <= expiry; // only show non-expired pending slots
  });
  const bookingHistory = filteredBookings.filter(b => {
    return ['Completed', 'Cancelled', 'Rejected'].includes(b.status);
  });

const handleRebookAttempt = (booking) => {
  const now = new Date();
  const rejectedAt = new Date(booking.rejectionTimestamp);
  const unblockTime = new Date(rejectedAt.getTime() + 24 * 60 * 60 * 1000);
  const bookingDateTime = new Date(`${booking.date} ${booking.time}`);

  // ❌ Already expired
  if (bookingDateTime <= now) {
    return;
  }

  // ❌ Within 1 hour of slot
  const oneHourBeforeSlot = new Date(bookingDateTime.getTime() - 60 * 60 * 1000);
  if (now > oneHourBeforeSlot) {
    return;
  }

  // ❌ Still in cooldown
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
    return;
  }

  // ✅ Check if already rebooked (duplicate date, time, lab)
  const alreadyBooked = bookings.some(b =>
    (b.status === 'Pending' || b.status === 'Approved') &&
    b.lab === booking.lab &&
    b.date === booking.date &&
    b.time === booking.time
  );

  if (alreadyBooked) {
    setShowAlreadyBookedModal(true);
    return;
  }

  // ✅ Open confirm rebook modal
  setRebookedBooking(booking);
  setShowRebookConfirmModal(true);
};

const confirmRebook = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    await axios.post("http://localhost:5000/api/bookings/request", {
      userId: user._id,
      lab: rebookedBooking.lab,
      time: rebookedBooking.time,
      date: rebookedBooking.date,
      purpose: rebookedBooking.purpose || "Rebooked Slot",
    });

    // Refresh bookings
    const res = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
    const refreshed = res.data.map(b => ({ ...b, id: b._id.toString() }));
    setBookings(refreshed);

    setShowRebookConfirmModal(false);
    setShowRebookSuccessModal(true);
    setRebookedBooking(null);
  } catch (err) {
    console.error("Rebooking failed", err);
    alert("You may have already booked it. To confirm, check in the current bookings tab");
  }
};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <div className="p-6 min-h-screen bg-[#f9fafb]">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">My Bookings</h2>

      <div className="flex gap-3 mb-6">
      <button
        onClick={() => {
          navigate(`?tab=current`)
        }}
        className={`px-4 py-2 rounded ${activeTab === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        Current Bookings
      </button>

      <button
        onClick={() => {
          navigate(`?tab=pending`)
        }}
        className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        Pending Requests
      </button>

      <button
        onClick={() => {
          navigate(`?tab=history`)
        }}
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
            {currentBookings
              .filter(b => b.status === 'Approved')
              .map(booking => {
                const isCompleted = new Date(`${booking.date}T${booking.time}`) < new Date();

                return (
                  <li key={booking._id} 
                  ref={highlightBookingId === booking._id ? (el) => {
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } : null}
                  className={`p-4 border rounded-xl space-y-2 shadow-sm transition-all duration-500 ${highlightBookingId === booking._id ? 'bg-blue-50' : 'bg-white'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-700 font-semibold">{booking.lab}</p>
                        <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Approved</span>
                      </div>
                      {isCompleted ? (
                        <span className="text-green-700 font-semibold">✔ Completed</span>
                      ) : (
                        <button onClick={() => handleCancelClick(booking)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                          Cancel
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
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
              <li key={booking._id}
              ref={highlightBookingId === booking._id ? (el) => {
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } : null}
              className={`p-4 border rounded-xl flex justify-between items-center transition-all duration-500 ${highlightBookingId === booking._id ? 'bg-blue-100' : 'bg-white'}`}
              >
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
              <li
              key={booking._id}
              ref={highlightBookingId === booking._id ? (el) => {
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } : null}
              className={`p-4 border rounded-xl flex justify-between items-center transition-all duration-500
              ${highlightBookingId === booking._id ? 'bg-blue-100' : 'bg-white'}`}
              >
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="font-semibold text-gray-700">{booking.lab}</p>
                    <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      booking.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      booking.status === 'Cancelled' ? 'bg-gray-200 text-gray-800' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center">
                    {booking.status === 'Rejected' && (() => {
                      const now = new Date();
                      const [startTime] = booking.time.split('-');
                      const bookingDateTime = new Date(`${booking.date}T${startTime.trim()}:00`);
                      const rejectedAt = new Date(booking.rejectionTimestamp);
                      const unblockTime = new Date(rejectedAt.getTime() + 24 * 60 * 60 * 1000);

                      // 🧠 Check if expired or within 1 hour of slot start
                      const isExpired = bookingDateTime <= now;
                      const isLastHour = now >= new Date(bookingDateTime.getTime() - 60 * 60 * 1000);

                      if (isExpired || isLastHour) {
                        return <span className="text-sm text-gray-400 italic ml-6">Slot expired</span>;
                      }

                      // 🧠 Check if user has already rebooked
                      const rebookedByUser = bookings.some(b =>
                        (b.status === 'Pending' || b.status === 'Approved') &&
                        b.lab === booking.lab &&
                        b.date === booking.date &&
                        b.time === booking.time
                      );

                      if (rebookedByUser) {
                        return <span className="text-sm text-green-600 italic ml-6">You rebooked</span>;
                      }

                      // 🧠 Still in cooldown
                      const timeDiff = unblockTime - now;
                      if (timeDiff > 0) {
                        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                        return (
                          <span className="text-sm text-gray-500 italic ml-6">
                            ⏳ Cooldown: {hours}h {minutes}m
                          </span>
                        );
                      }

                      // ✅ Eligible for rebooking
                      return (
                        <button
                          onClick={() => handleRebookAttempt(booking)}
                          className="border px-3 py-1 rounded hover:bg-gray-100 ml-6"
                        >
                          Rebook
                        </button>
                      );
                    })()}
                    {booking.status === 'Completed' && (
                      <span className="text-sm text-gray-500 italic ml-6">✔ Completed</span>
                    )}
                  </div>
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

      {/* CANCEL SUCCESS MODAL */}
      {showCancelSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
            <h2 className="text-xl font-bold text-green-700 mb-4">Cancelled</h2>
            <p className="mb-4 text-gray-700">Your booking has been cancelled.</p>
            <button
              onClick={() => setShowCancelSuccessModal(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ========== REBOOK CONFIRM MODAL ========== */}
      {showRebookConfirmModal && rebookedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Confirm Rebooking</h3>
            <p>Do you want to rebook <strong>{rebookedBooking.lab}</strong> on <strong>{rebookedBooking.date}</strong> at <strong>{rebookedBooking.time}</strong>?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRebookConfirmModal(false)}
                className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-100"
              >
                No
              </button>
              <button
                onClick={confirmRebook}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== REBOOK SUCCESS MODAL ========== */}
      {showRebookSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
            <h2 className="text-xl font-bold text-green-700 mb-4">Booking Sent</h2>
            <p className="text-gray-700">Your booking request has been sent to the lab incharge.</p>
            <button
              onClick={() => setShowRebookSuccessModal(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {/* ========== ALREADY BOOKED MODAL ========== */}
      {showAlreadyBookedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center w-80">
            <h2 className="text-xl font-bold text-red-700 mb-4">Already Requested</h2>
            <p className="text-gray-700">You have already booked or requested this slot. Check the <strong>Current</strong> tab to confirm.</p>
            <button
              onClick={() => setShowAlreadyBookedModal(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default CheckAllocation;