// Book.jsx — clean, fully working with backend + expected UI & logic
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/labs");
        setLabs(res.data);
      } catch (err) {
        console.error("Failed to fetch labs", err);
      }
    };

    const fetchUser = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))._id;

        const res = await axios.get(`http://localhost:5000/api/auth/me?id=${userId}`);
        setUser(res.data); // or whatever you're doing with user data
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
        const res = await axios.get(`http://localhost:5000/api/bookings/lab/${selectedLab.name}/${selectedDate}`);
        const booked = res.data.booked || [];
        const pending = res.data.pending || [];

        const userPending = pending.filter(b => b.userId === user._id).map(b => b.time);

        setBookedSlots(prev => ({ ...prev, [selectedLab._id]: booked.map(b => b.time) }));
        setMyPendingSlots(prev => ({ ...prev, [selectedLab._id]: userPending }));
      } catch (err) {
        console.error("Failed to fetch bookings", err);
      }
    };

    fetchBookings();
  }, [selectedLab, selectedDate, user]);

  const handleBook = async () => {
    try {
      await axios.post("http://localhost:5000/api/bookings/request", {
        userId: user._id,
        lab: selectedLab.name,
        date: selectedDate,
        time: slotToBook,
        purpose: purposeText,
      });
      alert("Booking request sent!");
      setShowBookModal(false);
      setPurposeText('');
    } catch (err) {
      alert("Booking failed");
    }
  };

  const handleCancelPending = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/user/${user._id}`);
      const match = res.data.find(
        b => b.lab === selectedLab.name && b.date === selectedDate && b.time === slotToBook && b.status === 'Pending'
      );
      if (match) {
        await axios.patch(`http://localhost:5000/api/bookings/cancel/${match._id}`);
        alert("Pending request cancelled");
        setShowPendingModal(false);
      } else {
        alert("No matching booking found");
      }
    } catch (err) {
      alert("Failed to cancel pending booking");
    }
  };

  return (
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
          {/* 👇 Lab Incharge Details */}
          <div className="mt-2 text-sm text-gray-500">
            <p><strong>Incharge:</strong> {selectedLab.incharge?.name}</p>
            <p><strong>Phone:</strong> {selectedLab.incharge?.phone}</p>
            <p><strong>Email:</strong> {selectedLab.incharge?.email}</p>
            </div>

          <h4 className="mt-4 font-semibold text-blue-600">Slots:</h4>
          <div className="flex flex-wrap gap-3 mt-3">
            {generateSlots().map((slot, i) => {
              const booked = bookedSlots[selectedLab._id]?.includes(slot);
              const pending = myPendingSlots[selectedLab._id]?.includes(slot);

              let btnClass = "px-4 py-2 rounded text-sm border transition ";
              if (booked) {
                btnClass += "bg-gray-200 text-gray-400 cursor-not-allowed";
              } else if (pending) {
                btnClass += "bg-yellow-100 text-yellow-800 border-yellow-300 hover:border-yellow-500";
              } else {
                btnClass += "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer";
              }

              return (
                <button
                  key={i}
                  className={btnClass}
                  disabled={booked}
                  onClick={() => {
                    if (pending) {
                      setSlotToBook(slot);
                      setShowPendingModal(true);
                    } else {
                      setSlotToBook(slot);
                      setShowBookModal(true);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (booked) e.target.innerText = "🚫";
                  }}
                  onMouseLeave={(e) => {
                    if (booked) e.target.innerText = slot;
                  }}
                >
                  {slot}
                </button>
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
    </div>
  );
};

export default Book;
