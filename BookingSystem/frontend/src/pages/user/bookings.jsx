import React, { useState, useEffect } from 'react';

const CheckAllocation = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const allLabs = [
    'Gen AI Lab', 'IoT Lab', 'Rane NSK Lab', 'PEGA Lab', 'CAM Lab', 'CAD Lab',
    'Sustainable Material and Surface Metamorphosis Lab', 'Quantum Science Lab',
    'MRuby Lab', 'Cisco Lab', 'Aryabatta Lab'
  ];

  // Load bookings from localStorage
  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
    setBookings(savedBookings);
  }, []);

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

  return (
    <div className="p-6 min-h-screen bg-[#f9fafb]">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">My Bookings</h2>

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

      {filteredBookings.length === 0 ? (
        <p className="text-gray-500">No bookings found for the selected filters.</p>
      ) : (
        <ul className="space-y-4">
          {filteredBookings.map((booking) => (
            <li
              key={booking.id}
              className="p-4 border rounded-xl shadow-md bg-white transition-all transform hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-blue-700">{booking.lab}</p>
                  <p className="text-sm text-gray-600">{booking.time} | {booking.date}</p>
                </div>
                <button
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
                  onClick={() => handleCancelClick(booking)}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
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