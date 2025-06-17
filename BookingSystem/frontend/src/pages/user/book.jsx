import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

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
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedLab, setSelectedLab] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [slotToBook, setSlotToBook] = useState(null);
  const [slotToCancel, setSlotToCancel] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [user, setUser] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState({});
  const [showRequestSent, setShowRequestSent] = useState(false);
  const [showPendingInfo, setShowPendingInfo] = useState(false);
  const [myPendingBookings, setMyPendingBookings] = useState([]);
  const [labSlots] = useState({})

  const navigate = useNavigate();
  //book
  const [labs, setLabs] = useState([]);

useEffect(() => {
  const fetchLabs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/labs");
      setLabs(response.data);
    } catch (error) {
      console.error("Error fetching labs:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        withCredentials: true, // If you're using cookies for auth
      });
      setUser(res.data); // Assumes res.data contains name/email
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  fetchLabs();
  fetchUser();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!slotToBook) {
    alert("No time slot selected.");
    return;
  }

  setSelectedTime(slotToBook);

  if (!selectedLab || !selectedDate || !purpose) {
    alert("Please fill in all details before booking.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/api/bookings", {
      labId: selectedLab._id,
      date: selectedDate,
      time: slotToBook,
      purpose,
      userId: user._id,
      status: "Pending"
    });

    setShowRequestSent(true);
    setShowBookModal(false);
    setSlotToBook(null);

    // Optionally refresh booked slots or pending UI
    // You can add a call here to refetch booked slots if needed
  } catch (error) {
    console.error("Booking failed:", error);
    alert("Booking failed. Please try again.");
  }
};

const fetchMyBookings = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
    const pending = res.data.filter(booking => booking.status === "Pending");
    setPendingApprovals(prev => {
      const updated = {};
      pending.forEach(b => {
        if (!updated[b.lab.name]) updated[b.lab.name] = [];
        updated[b.lab.name].push(b.time);
      });
      return updated;
    });
    setMyPendingBookings(pending); // You'll need to create this state
  } catch (err) {
    console.error("Failed to fetch user bookings:", err);
  }
};

useEffect(() => {
  if (user) {
    fetchMyBookings();
  }
}, [user]);

  const confirmCancel = async () => {
  try {
    await axios.delete(`http://localhost:5000/api/bookings/cancel`, {
      data: {
        labId: selectedLab._id,
        date: selectedDate,
        time: slotToCancel,
        userId: user._id,
      },
    });

    alert("Booking cancelled successfully");

    // Optionally, refetch the bookings to refresh the UI
    fetchMyBookings();

    // Close modal and reset state
    setShowCancelModal(false);
    setSlotToCancel(null);
  } catch (error) {
    console.error("Cancel failed:", error);
    alert("Failed to cancel booking. Try again.");
  }
};




  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
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

      {labs.map((lab, index) => (
        <div
        key={lab._id}
        onClick={() => setSelectedLab(lab)}
        className={`p-4 rounded shadow cursor-pointer transition-transform hover:scale-105 ${
          selectedLab?._id === lab._id 
          ? 'bg-blue-100 border-2 border-blue-600'
          : 'bg-white hover:shadow-md'
        }`}
        >
          <h3 className="text-lg font-semibold text-blue-700">{lab.name}</h3>
          <p className="text-gray-500 text-sm mt-1">Click to view details</p>
          </div>
        ))}

      </div>
      
      {selectedLab && !selectedDate && (
        <p className="text-red-500 mb-4">
          Please select a booking date to view available slots.
          </p>
        )}

      {selectedLab && selectedDate && (
        <div className="mt-8 bg-white p-6 rounded shadow-lg">
          <h3 className="text-xl font-bold text-blue-800 mb-2">{selectedLab.name}</h3>
          <p className="mb-2 text-gray-700">{selectedLab.description}</p>
          <p><strong>Incharge:</strong> {selectedLab.incharge?.name}</p>
          <p><strong>Phone:</strong> {selectedLab.incharge?.phone}</p>
          <p><strong>Email:</strong> {selectedLab.incharge?.email}</p>


          <h4 className="mt-4 font-semibold text-blue-600"> Slots:</h4>
          <div className="flex flex-wrap gap-3 mt-3">
            {generateSlots().map((slot, i) => {
              const isBooked = bookedSlots[selectedLab._id]?.includes(slot);
              const isPending = pendingApprovals[selectedLab._id]?.includes(slot);
              const isAvailable = labSlots[selectedLab._id]?.includes(slot);

    // Decide button classes
    let btnClass = "px-4 py-2 rounded text-sm border transition ";
    let isDisabled = false;
    
    if (isBooked) {
      btnClass += "bg-gray-100 text-gray-500 cursor-not-allowed";
      isDisabled = true;
    } else if (isPending) {
      btnClass += "bg-yellow-100 text-yellow-800 border-yellow-300 hover:border-yellow-500";
    } else if (isAvailable) {
      btnClass += "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer";
    } else {
      // neither available nor pending/booked — slot might be rejected and returned to available
      btnClass += "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer";
    }

    return (
    <button
    key={i}
    className={btnClass}
   onClick={() => {
  if (isDisabled) return;
  if (isPending) {
    setSlotToBook(slot);   // <== ADD THIS LINE
    setShowPendingInfo(true);
    return;
  }
  if (isAvailable) {
    setSlotToBook(slot);
    setShowBookModal(true);
  }
}}

    disabled={isDisabled}
    onMouseEnter={(e) => {
      if (isBooked) {
        e.target.innerText = "🚫";
      }
    }}
    onMouseLeave={(e) => {
      if (isBooked) {
        e.target.innerText = slot;
      }
    }}
    >
      {slot}
      </button>
      );
      })}
      </div>
      
      </div>
    )}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Confirm Booking</h3>
            <p className="mb-4 text-gray-700">
              Do you want to book <strong>{selectedLab}</strong> at <strong>{slotToBook}</strong>?
            </p>
            <div className="flex justify-around">
              <form onSubmit={handleSubmit}>
                {/* Lab selection, date, time dropdowns */}

  <label>Purpose for Booking:</label>
  <textarea
  placeholder="Purpose for Booking"
  value={purpose}
  onChange={(e) => setPurpose(e.target.value)}
  className="w-full h-32 p-3 border rounded bg-gray-100 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
></textarea>


  <div className="flex justify-around mt-4">
  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Send Request
  </button>
  <button
    type="button"
    onClick={() => setShowBookModal(false)}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Cancel
  </button>
</div>

</form>

            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-3">Cancel Booking</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to cancel your booking for <strong>{slotToCancel}</strong>?
            </p>
            <div className="flex justify-around">
              <button
                onClick={confirmCancel}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestSent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg text-center w-80">
            <h3 className="text-lg font-semibold text-green-700 mb-3">Request Sent!</h3>
            <p className="mb-4 text-gray-700">Your booking request has been sent successfully.</p>
            <button
            onClick={() => setShowRequestSent(false)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
   {showPendingInfo && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-lg shadow-lg text-center w-80">
      <h3 className="text-lg font-semibold text-yellow-700 mb-3">Already Requested</h3>
      <p className="mb-4 text-gray-700">You’ve already requested this slot. Would you like to cancel your request?</p>
      <div className="flex justify-around mt-4">
        <button
          onClick={() => {
            setSlotToCancel(slotToBook);  // mark slot to cancel
            setShowPendingInfo(false);    // close this modal
            setShowCancelModal(true);     // open cancel modal
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cancel Request
        </button>
        <button
          onClick={() => setShowPendingInfo(false)}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Book;