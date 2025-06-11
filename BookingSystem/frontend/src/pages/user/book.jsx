import axios from 'axios';
import React, { useState, useEffect } from 'react';

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
  const [selectedLab, setSelectedLab] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [slotToBook, setSlotToBook] = useState(null);
  const [slotToCancel, setSlotToCancel] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [user, setUser] = useState('');
  useEffect(() => {
  const loggedUser = localStorage.getItem('loggedInUser');
  if (loggedUser) {
    setUser(loggedUser);

    // 🆕 Fetch user's bookings
    axios.get(`http://localhost:5000/api/bookings/${loggedUser}`)
      .then(res => {
        const newBookedSlots = {};
        res.data.forEach(booking => {
          if (!newBookedSlots[booking.lab]) {
            newBookedSlots[booking.lab] = [];
          }
          newBookedSlots[booking.lab].push(booking.time);
        });
        setBookedSlots(newBookedSlots);
      })
      .catch(err => {
        console.error('Failed to fetch bookings');
      });
  }
}, []);


  const [labSlots, setLabSlots] = useState(() => {
    const obj = {};
    labList.forEach(lab => {
      obj[lab] = generateSlots();
    });
    return obj;
  });

  const confirmBooking = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/bookings', {
      username: user,
      lab: selectedLab,
      date: selectedDate,
      time: slotToBook,
    });

    setBookedSlots(prev => ({
      ...prev,
      [selectedLab]: [...(prev[selectedLab] || []), slotToBook]
    }));

    setLabSlots(prev => ({
      ...prev,
      [selectedLab]: prev[selectedLab].filter(s => s !== slotToBook)
    }));

    setShowBookModal(false);
    setSlotToBook(null);
  } catch (err) {
    alert(err.response?.data?.message || 'Booking failed');
    setShowBookModal(false);
    setSlotToBook(null);
  }
};

  const confirmCancel = async () => {
  try {
    await axios.delete('http://localhost:5000/api/bookings', {
      data: {
        username: user,
        lab: selectedLab,
        date: selectedDate,
        time: slotToCancel
      }
    });

    setBookedSlots(prev => ({
      ...prev,
      [selectedLab]: prev[selectedLab].filter(s => s !== slotToCancel)
    }));

    setLabSlots(prev => ({
      ...prev,
      [selectedLab]: [...prev[selectedLab], slotToCancel].sort()
    }));

    setShowCancelModal(false);
    setSlotToCancel(null);
  } catch (err) {
    alert('Failed to cancel booking');
    setShowCancelModal(false);
    setSlotToCancel(null);
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

          <h4 className="mt-4 font-semibold text-blue-600">Available Slots:</h4>
          <div className="flex flex-wrap gap-3 mt-3">
            {labSlots[selectedLab].map((slot, i) => {
              const isBooked = bookedSlots[selectedLab]?.includes(slot);
              return (
              <button
              key={i}
              className={`px-4 py-2 rounded text-sm border transition 
                ${isBooked 
                  ? "bg-red-200 text-red-800 cursor-not-allowed" 
                  : "bg-gray-100 hover:bg-blue-100 cursor-pointer"}`}
                  onClick={() => {
                    if (!isBooked) {
                      setSlotToBook(slot);
                      setShowBookModal(true);
                    }
                  }}
                  disabled={isBooked}
                  >
                    {slot}
                    </button>
                    );
            })}

          </div>

          {(bookedSlots[selectedLab] && bookedSlots[selectedLab].length > 0) && (
            <div className="mt-6">
              <h4 className="font-semibold text-green-700 mb-2">Booked Slots:</h4>
              <div className="flex flex-wrap gap-3">
                {bookedSlots[selectedLab].map((slot, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSlotToCancel(slot);
                      setShowCancelModal(true);
                    }}
                    className="bg-green-100 text-green-800 px-3 py-2 rounded hover:bg-green-200 border border-green-300"
                  >
                    {slot} <span className="ml-2 text-red-600 underline">Cancel</span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
              <button
                onClick={confirmBooking}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBookModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
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
    </div>
  );
};

export default Book;
