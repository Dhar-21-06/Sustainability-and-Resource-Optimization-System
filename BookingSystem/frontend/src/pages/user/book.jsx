import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";


//book
const labList = [
  "PEGA Lab", "CAM Lab", "CAD Lab", "Sustainable Material and Surface Metamorphosis Lab",
  "Quantum Science Lab", "Gen AI Lab", "IoT Lab", "MRuby Lab", "Cisco Lab",
  "Aryabatta Lab", "Rane NSK Lab", "Innovation Lab"
];

const labDetails = {
  "PEGA Lab": {
    description: "PEGA Lab specializes in BPM and CRM solutions, aiding students in workflow automation.",
    incharge: {
      name: "Dr. Pega Incharge",
      phone: "9000011111",
      email: "pega@college.edu"
    }
  },
  "CAM Lab": {
    description: "Computer Aided Manufacturing Lab supports automated production systems and robotics.",
    incharge: {
      name: "Dr. CAM Expert",
      phone: "9000022222",
      email: "cam@college.edu"
    }
  },
  "CAD Lab": {
    description: "CAD Lab enables students to design complex components using advanced design tools.",
    incharge: {
      name: "Dr. CAD Master",
      phone: "9000033333",
      email: "cad@college.edu"
    }
  },
  "Sustainable Material and Surface Metamorphosis Lab": {
    description: "Focuses on green materials, environmental sustainability and smart surfaces.",
    incharge: {
      name: "Dr. Eco Tech",
      phone: "9000044444",
      email: "sustainable@college.edu"
    }
  },
  "Quantum Science Lab": {
    description: "Dedicated to experiments in quantum computing and particle physics.",
    incharge: {
      name: "Dr. Quantum Lead",
      phone: "9000055555",
      email: "quantum@college.edu"
    }
  },
  "Gen AI Lab": {
    description: "Focuses on cutting-edge generative AI technologies and deep learning research.",
    incharge: {
      name: "Dr. A. I. Vision",
      phone: "9000066666",
      email: "genai@college.edu"
    }
  },
  "IoT Lab": {
    description: "IoT Lab empowers students with real-time sensor network programming experience.",
    incharge: {
      name: "Dr. Connected World",
      phone: "9000077777",
      email: "iot@college.edu"
    }
  },
  "MRuby Lab": {
    description: "Designed for embedded scripting in lightweight IoT applications using mruby.",
    incharge: {
      name: "Dr. Embedded Ruby",
      phone: "9000088888",
      email: "mruby@college.edu"
    }
  },
  "Cisco Lab": {
    description: "Provides networking infrastructure and simulation tools for real-world routing and switching.",
    incharge: {
      name: "Dr. Network Pro",
      phone: "9000099999",
      email: "cisco@college.edu"
    }
  },
  "Aryabatta Lab": {
    description: "A mathematical and computation-intensive lab promoting research in analytics and modeling.",
    incharge: {
      name: "Dr. Math Guru",
      phone: "9000001111",
      email: "aryabatta@college.edu"
    }
  },
  "Rane NSK Lab": {
    description: "Sponsored by Rane NSK, this lab supports mechanical engineering R&D and innovation.",
    incharge: {
      name: "Dr. Mechanical Mind",
      phone: "9000002222",
      email: "ranensk@college.edu"
    }
  },
  "Innovation Lab": {
    description: "Encourages product design, rapid prototyping, and creative engineering solutions.",
    incharge: {
      name: "Dr. Innovator",
      phone: "9000003333",
      email: "innovation@college.edu"
    }
  }
};

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
  const [user, setUser] = useState('Dr. Ravi Kumar');
  const [pendingApprovals, setPendingApprovals] = useState({});
  const [showRequestSent, setShowRequestSent] = useState(false);
  const [showPendingInfo, setShowPendingInfo] = useState(false);
  const navigate = useNavigate();

const handleSubmit = (e) => {
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

  const newBooking = {
    id: Date.now(),
    lab: selectedLab,
    date: selectedDate,
    time: slotToBook,
    faculty: user,
    purpose,
    status: 'Pending',
    rejectionReason: '',
    notification: false
  };

  const existing = JSON.parse(localStorage.getItem('myBookings')) || [];
  existing.push(newBooking);
  localStorage.setItem('myBookings', JSON.stringify(existing));

  // Update pendingApprovals
  setPendingApprovals(prev => ({
    ...prev,
    [selectedLab]: [...(prev[selectedLab] || []), slotToBook]
  }));

  // Remove slot from available
  setLabSlots(prev => ({
    ...prev,
    [selectedLab]: prev[selectedLab].filter(s => s !== slotToBook)
  }));

  // Save myBookings for pending requests
  const myExisting = JSON.parse(localStorage.getItem('myBookings')) || [];
  myExisting.push({
    id: Date.now(),
    lab: selectedLab,
    time: slotToBook,
    date: selectedDate,
    user: user,
    status: "pending",
    purpose
  });
  localStorage.setItem('myBookings', JSON.stringify(myExisting));

  setShowRequestSent(true);
  setShowBookModal(false);
  setSlotToBook(null);
};



  useEffect(() => {
  const loggedUser = localStorage.getItem('loggedInUser');
  if (loggedUser) setUser(loggedUser);

  const savedPendingApprovals = JSON.parse(localStorage.getItem('pendingApprovals')) || {};
  setPendingApprovals(savedPendingApprovals);
  const myBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
  const pendingBookings = myBookings.filter(b => b.status === 'pending');
  <h2 className="text-2xl font-bold mb-4 text-blue-800">Pending Requests</h2>
{pendingBookings.length === 0 ? (
  <p>No pending requests.</p>
) : (
  pendingBookings.map((booking, index) => (
    <div key={index} className="p-4 bg-yellow-50 rounded mb-3 flex justify-between items-center">
      <div>
        <p><strong>Lab:</strong> {booking.lab}</p>
        <p><strong>Date:</strong> {booking.date}</p>
        <p><strong>Time:</strong> {booking.time}</p>
        <p><strong>Purpose:</strong> {booking.purpose}</p>
      </div>
      <button
        onClick={() => {
          setSlotToCancel(booking.time);
          setSelectedLab(booking.lab);
          setSelectedDate(booking.date);
          setShowCancelModal(true);
        }}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Cancel
      </button>
    </div>
  ))
)}

  const pendingUpdates = {};
  myBookings.forEach(booking => {
    if (booking.status === "pending") {
      if (!pendingUpdates[booking.lab]) pendingUpdates[booking.lab] = [];
      pendingUpdates[booking.lab].push(booking.time);
    }
  });
  setPendingApprovals(pendingUpdates);
}, []);

  useEffect(() => {
    localStorage.setItem('pendingApprovals', JSON.stringify(pendingApprovals));
}, [pendingApprovals]);

  const [labSlots, setLabSlots] = useState(() => {
    const obj = {};
    labList.forEach(lab => {
      obj[lab] = generateSlots();
    });
    return obj;
  });

  const confirmBooking = () => {
  const existing = JSON.parse(localStorage.getItem('myBookings')) || [];

  const alreadyBooked = existing.some(
    booking =>
      booking.lab === selectedLab &&
      booking.date === selectedDate &&
      booking.time === slotToBook &&
      booking.user === user
  );

  if (alreadyBooked) {
    alert("You have already requested this slot! Wait for the approval");
    setShowBookModal(false);
    setSlotToBook(null);
    return;
  }

    const newRequest = {
      id: Date.now(),
      lab: selectedLab,
      time: slotToBook,
      date: selectedDate,
      user: user,
      status: "pending"   // added status
    };
    
    existing.push(newRequest);
    localStorage.setItem('myBookings', JSON.stringify(existing));

  setPendingApprovals(prev => ({
    ...prev,
    [selectedLab]: [...(prev[selectedLab] || []), slotToBook]
  }));

  setLabSlots(prev => ({
    ...prev,
    [selectedLab]: prev[selectedLab].filter(s => s !== slotToBook)
  }));

  setShowBookModal(false);
  setShowRequestSent(true);
  setSlotToBook(null);
};

  const confirmCancel = () => {
  let existing = JSON.parse(localStorage.getItem("myBookings")) || [];

  // Remove booking from localStorage
  let updated = existing.filter(
    (b) =>
      !(
        b.lab === selectedLab &&
        b.date === selectedDate &&
        b.time === slotToCancel
      )
  );
  localStorage.setItem("myBookings", JSON.stringify(updated));

  // Remove from pendingApprovals state
  const updatedPendingApprovals = { ...pendingApprovals };
  if (updatedPendingApprovals[selectedLab]) {
    updatedPendingApprovals[selectedLab] = updatedPendingApprovals[selectedLab].filter(
      (s) => s !== slotToCancel
    );
  }
  setPendingApprovals(updatedPendingApprovals);

  // Add back to available labSlots
  const updatedLabSlots = { ...labSlots };
  if (!updatedLabSlots[selectedLab].includes(slotToCancel)) {
    updatedLabSlots[selectedLab].push(slotToCancel);
    // Optional: sort slots if you want them in time order again
    updatedLabSlots[selectedLab].sort();
  }
  setLabSlots(updatedLabSlots);

  // Close cancel modal and reset state
  setShowCancelModal(false);
  setSlotToCancel(null);
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

      {labList.map((lab, index) => (
        <div
        key={index}
        onClick={() => setSelectedLab(lab)}
        className={`p-4 rounded shadow cursor-pointer transition-transform hover:scale-105 ${
          selectedLab === lab 
          ? 'bg-blue-100 border-2 border-blue-600'
          : 'bg-white hover:shadow-md'
          }`}
        >

            <h3 className="text-lg font-semibold text-blue-700">{lab}</h3>
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
          <h3 className="text-xl font-bold text-blue-800 mb-2">{selectedLab}</h3>
          <p className="mb-2 text-gray-700">{labDetails[selectedLab].description}</p>
          <p><strong>Incharge:</strong> {labDetails[selectedLab].incharge.name}</p>
          <p><strong>Phone:</strong> {labDetails[selectedLab].incharge.phone}</p>
          <p><strong>Email:</strong> {labDetails[selectedLab].incharge.email}</p>

          <h4 className="mt-4 font-semibold text-blue-600"> Slots:</h4>
          <div className="flex flex-wrap gap-3 mt-3">
            {generateSlots().map((slot, i) => {
              const isBooked = bookedSlots[selectedLab]?.includes(slot);
              const isPending = pendingApprovals[selectedLab]?.includes(slot);
              const isAvailable = labSlots[selectedLab]?.includes(slot);

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