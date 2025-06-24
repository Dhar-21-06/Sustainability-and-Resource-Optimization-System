import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar.jsx';
import AdminHeader from '../../components/common/admin_c/AdminHeader.jsx';
import AdminFooter from '../../components/common/admin_c/AdminFooter.jsx';

const AdminCheckAllocation = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Fetch labs on mount
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/labs');
        setLabs(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch labs:", err);
      }
    };
    fetchLabs();
  }, []);

  // Fetch booked slots when lab or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedLab || !selectedDate) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/lab/${selectedLab.name}/${selectedDate}`);
        const allBookings = res.data.booked || [];

        const approvedOnly = allBookings
          .filter(b => b.status?.toLowerCase() === "approved")
          .map(b => ({
            time: b.time,
            date: selectedDate
          }));

        setBookedSlots(approvedOnly);
      } catch (err) {
        console.error("❌ Failed to fetch booked slots:", err);
      }
    };

    fetchBookedSlots();
  }, [selectedLab, selectedDate]);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Check Lab Allocations</h2>

      {/* Select Date */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-gray-700 mr-2">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {/* Lab Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {labs.map((lab) => (
          <div
            key={lab._id}
            onClick={() => setSelectedLab(lab)}
            className={`p-4 rounded shadow cursor-pointer transition hover:scale-105 ${
              selectedLab?._id === lab._id ? 'bg-blue-100 border-2 border-blue-600' : 'bg-white'
            }`}
          >
            <h3 className="text-lg font-semibold text-blue-700">{lab.name}</h3>
            <p className="text-sm text-gray-600">{lab.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Incharge: {lab.incharge?.name} ({lab.incharge?.email})
            </p>
          </div>
        ))}
      </div>

      {/* Booked Slots */}
      {selectedLab && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Booked Slots for {selectedLab.name}</h3>
          {bookedSlots.length === 0 ? (
            <p className="text-gray-500">No booked slots on {selectedDate}.</p>
          ) : (
            <ul className="space-y-2">
              {bookedSlots.map((slot, i) => (
                <li key={i} className="bg-white p-3 rounded shadow border text-sm">
                  <span className="font-semibold text-gray-700">{slot.time}</span> on <span>{slot.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminCheckAllocation;