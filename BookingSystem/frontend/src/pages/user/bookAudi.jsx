// BookAudi.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/common/user_c/navbar';
import kaveriImage from '../../assets/kaveri.jpg';
import parthaImage from '../../assets/partha.jpg';

const generateSlots = () => {
  const start = 8;
  const end = 15;
  const slots = [];
  for (let i = start; i < end; i++) {
    slots.push(`${i}:00-${i + 1}:00`);
  }
  return slots;
};

const BookAudi = () => {
  const [auditoriums, setAuditoriums] = useState([]);
  const [selectedAudi, setSelectedAudi] = useState(null);
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
    const fetchAuditoriums = async () => {
      try {
        const res = await axios.get(`${Backend_url}/api/labs/auditoriums`, {
          withCredentials: true
        });
        setAuditoriums(res.data);
      } catch (err) {
        console.error("Failed to fetch auditoriums", err);
      }
    };

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${Backend_url}/api/auth/me`, {
          withCredentials: true // <-- Add this if using cookies
        });
        console.log("✅ User fetched:", res.data);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchAuditoriums();
    fetchUser();
  }, []);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedAudi || !selectedDate || !user) return;
      try {
        const res = await axios.get(`${Backend_url}/api/bookings/labs/auditorium/${selectedAudi.name}/${selectedDate}`, {
          withCredentials: true
        });
        const booked = res.data.booked || [];
        const userBooked = booked.filter(b => String(b.userId?._id || b.userId) === String(user._id)).map(b => b.time);

        setUserBookedSlots(prev => ({
          ...prev,
          [selectedAudi._id]: userBooked
        }));

        const pending = res.data.pending || [];
        const userPending = pending.filter(b => String(b.userId?._id || b.userId) === String(user._id)).map(b => b.time);


        setBookedSlots(prev => ({ ...prev, [selectedAudi._id]: booked.map(b => b.time) }));
        setMyPendingSlots(prev => ({ ...prev, [selectedAudi._id]: userPending }));
        setAllPendingBookings(pending);
        console.log("📦 All bookings fetched:", res.data);
        console.log("🎯 Filtered my pending slots:", userPending);
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };

    const fetchRejected = async () => {
      if (!user || !selectedAudi || !selectedDate) return;

      try {
        const res = await axios.get(`${Backend_url}/api/bookings/user/${user._id}`, {
          withCredentials: true
        });
        const recent = res.data.filter(
          b =>
            b.status === 'Rejected' &&
            b.lab === selectedAudi.name &&
            b.date === selectedDate
        );

        const now = new Date();
        const rejectedMap = {};

        for (const b of recent) {
          const rTime = new Date(b.rejectionTimestamp);
          rTime.setHours(rTime.getHours() + 24);

          if (now < rTime) {
            if (!rejectedMap[selectedAudi._id]) rejectedMap[selectedAudi._id] = {};
            rejectedMap[selectedAudi._id][b.time] = b.rejectionTimestamp;
          }
        }

        setRejectedSlots(prev => ({
          ...prev,
          [selectedAudi._id]: rejectedMap[selectedAudi._id] || {},
        }));
      } catch (err) {
        console.error("Failed to fetch rejected slots", err);
      }
    };

    fetchBookings();
    fetchRejected();
  }, [selectedAudi, selectedDate, user]);

  const handleBook = async () => {
    if (!purposeText.trim()) {
      alert("Please enter a purpose before submitting.");
      return;
    }
    try {
      await axios.post(`${Backend_url}/api/bookings/request`, {
        userId: user._id,
        lab: selectedAudi.name,
        date: selectedDate,
        time: slotToBook,
        purpose: purposeText,
        type: 'auditorium',
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
      const res = await axios.get(`${Backend_url}/api/bookings/user/${user._id}`, {
        withCredentials: true
      });
      const match = res.data.find(
        b =>
          b.lab === selectedAudi.name &&
          b.date === selectedDate &&
          b.time === slotToBook &&
          b.status === 'Approved'
      );

      if (!match) {
        setCooldownMessage("No matching approved booking found.");
        setShowRejectedModal(true);
        setShowConfirmCancelModal(false);
        return;
      }

      await axios.patch(`${Backend_url}/api/bookings/cancel/${match._id}`, {}, {
        withCredentials: true
      });
      setSuccessMessage("Your booking was cancelled successfully.");
      setShowSuccessModal(true);
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
      const res = await axios.get(`${Backend_url}/api/bookings/user/${user._id}`, {
        withCredentials: true
      });
      const match = res.data.find(
        b =>
          b.lab === selectedAudi.name &&
          b.date === selectedDate &&
          b.time === slotToBook &&
          b.status === 'Pending'
      );
      if (match) {
        await axios.patch(`${Backend_url}/api/bookings/cancel/${match._id}`, {}, {
          withCredentials: true
        });
        setSuccessMessage("Your booking request was cancelled.");
        setShowSuccessModal(true);
        setShowPendingModal(false);
      } else {
        setCooldownMessage("No matching pending booking found.");
        setShowPendingModal(false);
        setShowRejectedModal(true);
      }
      await refreshBookingData();
    } catch (err) {
      alert("Failed to cancel pending booking");
    }
  };

  const refreshBookingData = async () => {
    if (!selectedAudi || !selectedDate || !user) return;
    try {
      const res = await axios.get(`${Backend_url}/api/bookings/labs/auditorium/${selectedAudi.name}/${selectedDate}`, {
        withCredentials: true
      });
      const booked = res.data.booked || [];
      const pending = res.data.pending || [];

      const userBooked = booked.filter(b => String(b.userId?._id || b.userId) === String(user._id)).map(b => b.time);
      const userPending = pending.filter(b => String(b.userId?._id || b.userId) === String(user._id)).map(b => b.time);


      setBookedSlots(prev => ({ ...prev, [selectedAudi._id]: booked.map(b => b.time) }));
      setUserBookedSlots(prev => ({ ...prev, [selectedAudi._id]: userBooked }));
      setMyPendingSlots(prev => ({ ...prev, [selectedAudi._id]: userPending }));
      setAllPendingBookings(pending);
    } catch (err) {
      console.error("❌ Failed to refresh bookings", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div>
        <div className="px-10 py-6 mt-20 bg-gray-100 min-h-screen max-w-screen-xl text-left">
          <h2 className="text-3xl font-bold mb-6 text-blue-800">Book an Auditorium</h2>
          <div className="mb-6 max-w-xs">
            <label className="block text-gray-700 font-medium mb-2">Select Booking Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2 w-full"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditoriums.map((audi) => (
              <div
                key={audi._id}
                onClick={() => setSelectedAudi(audi)}
                className={`group rounded overflow-hidden shadow hover:shadow-xl transition-transform hover:scale-105 cursor-pointer ${
                  selectedAudi?._id === audi._id ? 'ring-4 ring-blue-600' : ''
                }`}
              >
                <div className="relative w-full h-64">
                  <img
                    src={audi.name.includes("Parthasarathy") ? parthaImage : kaveriImage}
                    alt={audi.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="bg-white p-4 h-48 overflow-hidden">
                  <h3 className="text-lg font-semibold text-blue-700 truncate">{audi.name}</h3>
                  <p className="text-sm text-gray-500 mb-1 line-clamp-2">{audi.description}</p>
                  <p className="text-sm text-gray-500">Capacity: {audi.capacity || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Location: {audi.location || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedAudi && (
            <div className="mt-8 bg-white p-6 rounded shadow-lg">
              <h3 className="text-xl font-bold text-blue-800 mb-2">{selectedAudi.name}</h3>
              <p className="mb-2 text-gray-700">{selectedAudi.description}</p>

              <div className="mt-2 text-sm text-gray-700">
                <p className="font-semibold text-blue-700">Incharges:</p>
                {selectedAudi.incharge && selectedAudi.incharge.length > 0 ? (
                  selectedAudi.incharge.map((admin, index) => (
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
              <div className="flex flex-wrap gap-3 mt-3 justify-start">
                {generateSlots().map((slot, i) => {
                  const isBooked = bookedSlots[selectedAudi._id]?.includes(slot);
                  const isBookedByUser = userBookedSlots[selectedAudi._id]?.includes(slot);

                  const [startHour] = slot.split("-")[0].split(":");
                  const slotStart = new Date(`${selectedDate}T${String(startHour).padStart(2, '0')}:00:00`);
                  const now = new Date();
                  const isSlotStarted = now >= slotStart;
                  const isCancelAllowed = isBooked && isBookedByUser && !isSlotStarted;
                  const isSlotExpired = !isCancelAllowed && slotStart < new Date(now.getTime() + 60 * 60 * 1000);
                  const isPendingForUser = myPendingSlots[selectedAudi._id]?.includes(slot);
                  const rejectionTimestamp = rejectedSlots[selectedAudi._id]?.[slot];
                  const isRejected = !!rejectionTimestamp;

                  const pendingForOthers = allPendingBookings.some(
                    (b) =>
                      String(b.userId?._id || b.userId) !== String(user._id) &&  // fix here
                      b.lab === selectedAudi.name &&
                      b.date === selectedDate &&
                      b.time === slot
                  );

                  // 🧠 Hover Info Logic
                  let hoverText = "";
                  const isPastAndPending = isSlotStarted && isPendingForUser;
                  const isPastAndAvailable = isSlotStarted && !isBooked && !isRejected && !pendingForOthers;
                  const isPastAndRejected = isSlotStarted && isRejected;
                  const isPastAndApproved = isSlotStarted && isBookedByUser;

                  if (isPastAndPending) {
                    hoverText = "Your request of this slot wasn't reviewed by the incharge.";
                  } else if (isPastAndAvailable || isPastAndRejected) {
                    hoverText = "This slot booking has been closed.";
                  } else if (isPastAndApproved) {
                    hoverText = "Your slot has successfully completed.";
                  }

                  // 🎨 Style + Click Logic
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
                    btnClass += "bg-green-100 text-yellow-800 border-yellow-300 hover:border-yellow-500 cursor-pointer";
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
                      onMouseEnter={() => setHoveredSlot(`${selectedAudi._id}-${slot}`)}
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

                      {hoveredSlot === `${selectedAudi._id}-${slot}` && hoverText && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-black text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
                          {hoverText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {showBookModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
                    <h2 className="text-xl font-bold mb-3">Confirm Booking</h2>
                    <p>
                      Book <strong>{selectedAudi.name}</strong> on <strong>{selectedDate}</strong> at <strong>{slotToBook}</strong>?
                    </p>
                    <input
                      type="text"
                      placeholder="Enter purpose"
                      value={purposeText}
                      onChange={(e) => setPurposeText(e.target.value)}
                      className="mt-3 w-full border p-2 rounded"
                    />
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setShowBookModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
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

              {showPendingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
                    <h2 className="text-xl font-bold mb-3 text-yellow-700">Already Requested</h2>
                    <p>You already requested <strong>{slotToBook}</strong> in <strong>{selectedAudi.name}</strong> on <strong>{selectedDate}</strong>.</p>
                    <div className="flex justify-end gap-3 mt-4">
                      <button onClick={() => setShowPendingModal(false)} className="px-4 py-2 bg-gray-300 rounded">Go Back</button>
                      <button onClick={handleCancelPending} className="px-4 py-2 bg-red-600 text-white rounded">Cancel Request</button>
                    </div>
                  </div>
                </div>
              )}

              {showRejectedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
                    <h2 className="text-xl font-bold mb-3 text-red-700">Slot Blocked</h2>
                    <p>
                      You were rejected for <strong>{slotToBook}</strong> in <strong>{selectedAudi?.name}</strong> on <strong>{selectedDate}</strong>.
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

              {showUserCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
                    <h2 className="text-xl font-bold mb-3 text-blue-700">Cancel Booking</h2>
                    <p>You already booked <strong>{slotToBook}</strong> on <strong>{selectedDate}</strong> in <strong>{selectedAudi.name}</strong>.</p>
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
          )}

          {/* Warning Modal */}
          {showWarningModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-xl max-w-md w-full">
                <h2 className="text-xl font-bold mb-3 text-yellow-700">Warning</h2>
                <p>This slot has already been requested by another user. Do you still want to book it?</p>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowWarningModal(false)} className="px-4 py-2 bg-gray-300 rounded">No</button>
                  <button
                    onClick={() => {
                      const rejectionInfo = rejectedSlots[selectedAudi._id]?.[slotToBook];
                      if (rejectionInfo) {
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
                        setShowBookModal(true);
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
        </div>
      </div>
    </div>
  );
};

export default BookAudi;