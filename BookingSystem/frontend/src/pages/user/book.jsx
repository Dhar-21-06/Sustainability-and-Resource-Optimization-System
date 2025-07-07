// Book.jsx — clean, fully working with backend + expected UI & logic
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';

const generateSlots = () => {
  const start = 8;
  const end = 15;
  const slots = [];
  for (let i = start; i < end; i++) {
    slots.push(`${i}:00-${i + 1}:00`);
  }
  return slots;
};

const Book = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [user, setUser] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [myPendingSlots, setMyPendingSlots] = useState({});
  const [slotToBook, setSlotToBook] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [purposeText, setPurposeText] = useState('');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [rejectedSlots, setRejectedSlots] = useState({});
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [allPendingBookings, setAllPendingBookings] = useState([]);
  const [userBookedSlots, setUserBookedSlots] = useState({});
  const [showUserCancelModal, setShowUserCancelModal] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const Backend_url = import.meta.env.VITE_BACKEND;

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get(`${Backend_url}/api/labs`);
        setLabs(res.data);
      } catch (err) {
        console.error("Failed to fetch labs", err);
      }
    };

    const fetchUser = async () => {
      try {
    const res = await axios.get(`${Backend_url}:5000/api/auth/me`, {
      withCredentials: true,
    });

    console.log("✅ User fetched:", res.data);
    setUser(res.data);
  } catch (err) {
    console.error("❌ Failed to fetch user", err);
  }
};
    fetchLabs();
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedLab || !selectedDate || !user) return;
      try {
        const res = await axios.get(`${Backend_url}/api/bookings/lab/${selectedLab.name}/${selectedDate}`);
        console.log("🔄 Lab Booking Data:", res.data);
        const booked = res.data.booked || [];
        const userBooked = booked.filter(b => String(b.userId) === String(user._id)).map(b => b.time);

        // ✅ NEW: mark slots booked by current user
        setUserBookedSlots(prev => ({
          ...prev,
          [selectedLab._id]: userBooked
        }));

        const pending = res.data.pending || [];

        const userPending = pending.filter(b => String(b.userId) === String(user._id)).map(b => b.time);


        setBookedSlots(prev => ({ ...prev, [selectedLab._id]: booked.map(b => b.time) }));
        setMyPendingSlots(prev => ({ ...prev, [selectedLab._id]: userPending }));
        setAllPendingBookings(pending);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };

    fetchBookings();
  
  const fetchRejected = async () => {
  if (!user || !selectedLab || !selectedDate) return;

  try {
    const res = await axios.get(`${Backend_url}/api/bookings/user/${user._id}`);
    const recent = res.data.filter(
      b =>
        b.status === 'Rejected' &&
        b.lab === selectedLab.name &&
        b.date === selectedDate
    );

    const now = new Date();
    const rejectedMap = {};

    for (const b of recent) {
      const rTime = new Date(b.rejectionTimestamp);
      rTime.setHours(rTime.getHours() + 24);

      if (now < rTime) {
        if (!rejectedMap[selectedLab._id]) rejectedMap[selectedLab._id] = {};
        rejectedMap[selectedLab._id][b.time] = b.rejectionTimestamp;
      }
    }

    setRejectedSlots(prev => ({
      ...prev,
      [selectedLab._id]: rejectedMap[selectedLab._id] || {},
    }));
  } catch (err) {
    console.error("Failed to fetch rejected slots", err);
  }
};

  fetchRejected();
  }, [selectedLab, selectedDate, user]);

  const handleBook = async () => {
    if (!purposeText.trim()) {
    alert("Please enter a purpose before submitting.");
    return;
  }
    try {
      await axios.post(`${Backend_url}/api/bookings/request`, {
        userId: user._id,
        lab: selectedLab.name,
        date: selectedDate,
        time: slotToBook,
        purpose: purposeText,
        type: "lab",  // 👈 add this line
      }, {
        withCredentials: true
      });
      setSuccessMessage("Your booking request has been sent successfully.");
      setShowSuccessModal(true);
      await refreshBookingData();
      setShowBookModal(false);
      setPurposeText('');
    } catch (err) {
      console.error("Booking error:", err.response ? err.response.data : err.message);
      alert(`Booking failed: ${err.response?.data?.message || "Unknown error"}`);
    }
  };

const handleUserConfirmedCancel = async () => {
  try {
    const res = await axios.get(`${Backend_url}/api/bookings/user/${user._id}`);
    const match = res.data.find(
      b => b.lab === selectedLab.name && b.date === selectedDate && b.time === slotToBook && b.status === 'Approved'
    );

    if (!match) {
      // Show a custom message modal instead of alert
      setCooldownMessage("No matching approved booking found.");
      setShowRejectedModal(true);
      setShowConfirmCancelModal(false);
      return;
    }

    await axios.patch(`${Backend_url}/api/bookings/cancel/${match._id}`);
    setSuccessMessage("Your booking was cancelled successfully.");
setShowSuccessModal(true);
    
    // Show success modal
    setShowConfirmCancelModal(false);
    setSlotToBook(null);

    await refreshBookingData();
  } catch (err) {
    console.error("Cancellation failed", err);
    setCooldownMessage("Failed to cancel booking.");
    setShowRejectedModal(true);
    setShowConfirmCancelModal(false);
  }
};

  const handleCancelPending = async () => {
    try {
      const res = await axios.get(`${Backend_url}/api/bookings/user/${user._id}`);
      const match = res.data.find(
        b => b.lab === selectedLab.name && b.date === selectedDate && b.time === slotToBook && b.status === 'Pending'
      );
      if (match) {
  await axios.patch(`${Backend_url}/api/bookings/cancel/${match._id}`);
  setSuccessMessage("Your booking request was cancelled.");
setShowSuccessModal(true);
  setShowPendingModal(false);
  setShowSuccessModal(true);  // 👉 trigger your existing success modal
} else {
  setCooldownMessage("No matching pending booking found.");
  setShowPendingModal(false);
  setShowRejectedModal(true);  // 👉 or optionally reuse rejected modal for feedback
}

      await refreshBookingData()
    } catch (err) {
      alert("Failed to cancel pending booking");
    }
  };

  const refreshBookingData = async () => {
  if (!selectedLab || !selectedDate || !user) return;
  try {
    const res = await axios.get(`${Backend_url}/api/bookings/lab/${selectedLab.name}/${selectedDate}`);
    const booked = res.data.booked || [];
    const pending = res.data.pending || [];

    const userBooked = booked.filter(b => String(b.userId) === String(user._id)).map(b => b.time);
    const userPending = pending.filter(b => String(b.userId) === String(user._id)).map(b => b.time);

    setBookedSlots(prev => ({ ...prev, [selectedLab._id]: booked.map(b => b.time) }));
    setUserBookedSlots(prev => ({ ...prev, [selectedLab._id]: userBooked }));
    setMyPendingSlots(prev => ({ ...prev, [selectedLab._id]: userPending }));
    setAllPendingBookings(pending);
  } catch (err) {
    console.error("❌ Failed to refresh bookings", err);
  }
};


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Book a Lab</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Select Booking Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {labs.map((lab) => (
          <div
            key={lab._id}
            onClick={() => setSelectedLab(lab)}
            className={`p-4 rounded shadow cursor-pointer transition hover:scale-105 ${
              selectedLab?._id === lab._id ? 'bg-blue-100 border-2 border-blue-600' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold text-blue-700">{lab.name}</h3>
            <p className="text-sm text-gray-500">Click to view details</p>
          </div>
        ))}
      </div>

      {selectedLab && (
        <div className="mt-8 bg-white p-6 rounded shadow-lg">
          <h3 className="text-xl font-bold text-blue-800 mb-2">{selectedLab.name}</h3>
          <p className="mb-2 text-gray-700">{selectedLab.description}</p>
          {/* 👇 Multiple Incharges Display */}
          <div className="mt-2 text-sm text-gray-700">
            <p className="font-semibold text-blue-700">Incharges:</p>
            {selectedLab.incharge && selectedLab.incharge.length > 0 ? (
              selectedLab.incharge.map((admin, index) => (
              <div key={index} className="ml-4 mb-2 border-l pl-3 border-blue-300">
                <p><strong>Name:</strong> {admin.name}</p>
                <p><strong>Phone:</strong> {admin.phone}</p>
                <p><strong>Email:</strong> {admin.email}</p>
              </div>
              ))
            ) : (
            <p className="ml-4 text-gray-500">No incharges assigned</p>
            )}
          </div>

          <h4 className="mt-4 font-semibold text-blue-600">Slots:</h4>
          <div className="flex flex-wrap gap-3 mt-3">
            {generateSlots().map((slot, i) => {
              const isBooked = bookedSlots[selectedLab._id]?.includes(slot);
              const isBookedByUser = userBookedSlots[selectedLab._id]?.includes(slot);

              // ⏰ Updated: Precise slot start time logic
              const [startHour] = slot.split("-")[0].split(":");
              const slotStart = new Date(`${selectedDate}T${String(startHour).padStart(2, '0')}:00:00`);
              const now = new Date();
              const isSlotStarted = now >= slotStart; // ⏳ slot time has arrived or passed
              const isCancelAllowed = isBooked && isBookedByUser && !isSlotStarted;

              // Only block others' slots or expired ones — allow own bookings till last minute
              const isSlotExpired = !isCancelAllowed && slotStart < new Date(now.getTime() + 60 * 60 * 1000);
              const isPendingForUser = myPendingSlots[selectedLab._id]?.includes(slot);
              const rejectionTimestamp = rejectedSlots[selectedLab._id]?.[slot];
              const isRejected = !!rejectionTimestamp;
              
              const pendingForOthers = allPendingBookings.some(
                (b) =>
                  b.userId !== user._id &&
                  b.lab === selectedLab.name &&
                  b.date === selectedDate &&
                  b.time === slot
              );

              // 🎯 Hover Message Logic
              let hoverText = "";
              const isPastAndPending = isSlotStarted && isPendingForUser;
              const isPastAndAvailable = isSlotStarted && !isBooked && !isRejected && !pendingForOthers;
              const isPastAndRejected = isSlotStarted && isRejected;
              const isPastAndApproved = isSlotStarted && isBookedByUser;

              if (isPastAndPending) {
                hoverText = "Your request of this slot wasn't reviewed by the lab incharge.";
              } else if (isPastAndAvailable || isPastAndRejected) {
                hoverText = "This slot booking has been closed.";
              } else if (isPastAndApproved) {
                hoverText = "Your slot has successfully completed.";
              }

              // 🧩 Style + Handler Setup
              let btnClass = "px-4 py-2 rounded text-sm border transition ";
              let clickHandler = null;

              if (isPendingForUser) {
                btnClass += "bg-yellow-100 text-yellow-800 border-yellow-300 hover:border-yellow-500";
                clickHandler = () => {
                  setSlotToBook(slot);
                  setShowPendingModal(true);
                };
              } else if (isBooked && isBookedByUser) {
                btnClass += "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer";
                clickHandler = () => {
                  setSlotToBook(slot);
                  setShowUserCancelModal(true);
                };
              } else if (isBooked) {
                btnClass += "bg-gray-200 text-gray-400 cursor-not-allowed";
              } else if (isRejected) {
                btnClass += "bg-red-200 text-red-800 border-red-300 cursor-pointer hover:border-red-500";
                clickHandler = () => {
                  const now = new Date();
                  const rejectionTime = new Date(rejectionTimestamp);
                  const cooldownUntil = new Date(rejectionTime.getTime() + 24 * 60 * 60 * 1000);
                  const diffMs = cooldownUntil - now;
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  setCooldownMessage(`${hours}h ${minutes}m remaining`);
                  setSlotToBook(slot);
                  setShowRejectedModal(true);
                };
              } else if (pendingForOthers) {
                btnClass += "bg-green-100 text-yellow-900 border-yellow-300 hover:border-yellow-500 cursor-pointer";
                clickHandler = () => {
                  setSlotToBook(slot);
                  setShowWarningModal(true);
                };
              } else {
                btnClass += "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer";
                clickHandler = () => {
                  setSlotToBook(slot);
                  setShowBookModal(true);
                };
              }

              return (
                <div
                  key={i}
                  className={`relative inline-block ${
                    (isSlotExpired || (isBooked && !isBookedByUser)) ? 'custom-blocked-cursor' : ''
                  }`}
                  onMouseEnter={() => setHoveredSlot(`${selectedLab._id}-${slot}`)}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  <button
                    className={`${btnClass} ${
                      (isSlotExpired || (isBooked && !isBookedByUser)) ? 'custom-blocked-cursor' : ''
                    } ${(!isCancelAllowed && isSlotExpired) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={(isBooked && !isBookedByUser) || (!isCancelAllowed && isSlotExpired)}
                    onClick={(!isCancelAllowed && isSlotExpired) ? null : clickHandler}
                  >
                    {slot}
                  </button>

                  {hoveredSlot === `${selectedLab._id}-${slot}` && hoverText && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-black text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
                      {hoverText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-3">Confirm Booking</h2>
            <p>Book <strong>{selectedLab.name}</strong> on <strong>{selectedDate}</strong> at <strong>{slotToBook}</strong>?</p>
            <input
              type="text"
              placeholder="Enter purpose"
              value={purposeText}
              onChange={(e) => setPurposeText(e.target.value)}
              className="mt-3 w-full border p-2 rounded"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={(handleCancelPending) => setShowBookModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleBook}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-3 text-yellow-700">Already Requested</h2>
            <p>You already requested <strong>{slotToBook}</strong> in <strong>{selectedLab.name}</strong> on <strong>{selectedDate}</strong>.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowPendingModal(false)} className="px-4 py-2 bg-gray-300 rounded">Go Back</button>
              <button onClick={handleCancelPending} className="px-4 py-2 bg-red-600 text-white rounded">Cancel Request</button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-3 text-yellow-700">Warning</h2>
            <p>This slot has already been requested by another user. Do you still want to book it?</p>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowWarningModal(false)} className="px-4 py-2 bg-gray-300 rounded">No</button>
              <button
              onClick={() => {
                const rejectionInfo = rejectedSlots[selectedLab._id]?.[slotToBook];
                if (rejectionInfo) {
                  // Show rejection modal instead
                  const rejectionTime = new Date(rejectionInfo);
                  const cooldownUntil = new Date(rejectionTime.getTime() + 24 * 60 * 60 * 1000);
                  const now = new Date();
                  const diffMs = cooldownUntil - now;
                  const hours = Math.floor(diffMs / (1000 * 60 * 60));
                  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  setCooldownMessage(`${hours}h ${minutes}m remaining`);
                  setShowWarningModal(false);
                  setShowRejectedModal(true);
                } else {
                  setShowWarningModal(false);
                  setShowBookModal(true); // proceed as normal
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Yes, Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected Modal */}
      {showRejectedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-3 text-red-700">Slot Blocked</h2>
            <p>
              You were rejected for <strong>{slotToBook}</strong> in <strong>{selectedLab?.name}</strong> on <strong>{selectedDate}</strong>.
              </p>
              <p className="text-sm text-red-500 mt-2">
                {cooldownMessage ? `Try again after ${cooldownMessage}` : 'Please wait 24 hrs from rejection'}
                </p>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowRejectedModal(false)} className="px-4 py-2 bg-gray-300 rounded">Got it</button>
                </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm User Cancel - Step 1 */}
{showUserCancelModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
      <h2 className="text-xl font-bold mb-3 text-blue-700">Cancel Booking</h2>
      <p>You already booked <strong>{slotToBook}</strong> on <strong>{selectedDate}</strong> in <strong>{selectedLab.name}</strong>.</p>
      <p className="mt-2">Do you want to cancel it?</p>
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={() => setShowUserCancelModal(false)} className="px-4 py-2 bg-gray-300 rounded">Go Back</button>
        <button onClick={() => {
          setShowUserCancelModal(false);
          setShowConfirmCancelModal(true);
        }} className="px-4 py-2 bg-red-600 text-white rounded">Yes, Cancel</button>
      </div>
    </div>
  </div>
)}

{/* Modal: Final Confirmation - Step 2 */}
{/* Cancel Confirmation Modal */}
{showConfirmCancelModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
      <h2 className="text-xl font-bold mb-3 text-red-700">Cancel this booking?</h2>
      <p className="text-gray-700 mb-6">
        Are you sure you want to cancel this slot? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={handleUserConfirmedCancel}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Yes, Cancel
        </button>
        <button
          onClick={() => setShowConfirmCancelModal(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

{/* Success Modal */}
{showSuccessModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
      <h2 className={`text-xl font-bold mb-4 ${
  successMessage.includes('cancel') ? 'text-red-600' : 'text-green-700'
}`}>
  {successMessage.includes('cancel') ? 'Cancelled' : 'Success!'}
</h2>
      <p className="mb-4 text-gray-700">{successMessage}</p>
      <button
  onClick={() => setShowSuccessModal(false)}
  className={`px-4 py-2 rounded text-white ${
    successMessage.includes('cancel')
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-blue-600 hover:bg-blue-700'
  }`}
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

export default Book;
