import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';

const DEFAULT_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00"
];

const AdminCheckAllocation = () => {
  const [labName, setLabName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [activeTab, setActiveTab] = useState('available');
  const [slotData, setSlotData] = useState([]); // holds all slot info
  const [historyFilter, setHistoryFilter] = useState('All');
  const Backend_url = import.meta.env.VITE_BACKEND;

  // 🧠 Set tab based on URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (['available', 'approved', 'history'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // 🧠 Update URL hash on tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // 🧠 Get lab name from profile
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.email) {
      axios.get(`${Backend_url}/api/profile/get-profile/${user.email}`)
        .then(res => setLabName(res.data.labIncharge))
        .catch(err => console.error('❌ Profile fetch error:', err));
    }
  }, []);

  // 📦 Fetch bookings for lab+date and compute slot status
// 📦 Fetch bookings based on tab
useEffect(() => {
  if (!labName || !date) return;

    const fetchAndComputeSlots = async () => {
      let url = `${Backend_url}/api/bookings/lab/${encodeURIComponent(labName)}/${date}/slots`;

      // Add status query only for 'approved' and 'history' tabs
      if (activeTab === 'approved') url += '?status=approved';
      else if (activeTab === 'history') url += '?status=history';

      const res = await axios.get(url);
      const bookings = res.data;

      // For 'available', remove Approved and Completed slots
      if (activeTab === 'available') {
        const blockedTimes = bookings
          .filter(b => ['Approved', 'Completed'].includes(b.status))
          .map(b => b.time);

        const availableSlots = DEFAULT_SLOTS
          .filter(time => !blockedTimes.includes(time))
          .map(time => ({
            time,
            status: 'Available',
            isAvailable: true
          }));

        setSlotData(availableSlots);
        return;
      }

      // For other tabs (approved/history), map full slot info
      const slots = DEFAULT_SLOTS.map(time => {
        const booking = bookings.find(b => b.time === time);
        if (!booking) return { time, status: 'Available', isAvailable: true };

        return {
          time,
          status: booking.status,
          purpose: booking.purpose,
          isAvailable: !['Approved', 'Completed'].includes(booking.status)
        };
      });

      setSlotData(slots);
    };
  fetchAndComputeSlots();
}, [labName, date, activeTab]);

  const renderAvailable = () => {
    const availableSlots = slotData.filter(slot => slot.isAvailable);

    return availableSlots.length === 0
      ? <p className="text-gray-500">No available slots for this date.</p>
      : <ul className="space-y-2">
          {availableSlots.map((slot, i) => (
            <li key={i} className="p-3 bg-white shadow rounded flex justify-between">
              <span>{slot.time}</span>
              <span className="text-green-600">Available</span>
            </li>
          ))}
        </ul>;
  };

  const renderApproved = () => {
    const approvedSlots = slotData.filter(slot => slot.status === 'Approved');

    return approvedSlots.length === 0
      ? <p className="text-gray-500">No approved bookings for this date.</p>
      : <ul className="space-y-2">
          {approvedSlots.map((slot, i) => (
            <li key={i} className="p-3 bg-white shadow rounded flex justify-between">
              <div>
                <div className="font-semibold">{slot.time}</div>
                  {slot.purpose && <div className="text-sm text-gray-500">Purpose: {slot.purpose}</div>}
                </div>
              <span className="text-blue-600">Approved</span>
            </li>
          ))}
        </ul>;
  };

  const renderHistory = () => {
    const historyStatuses = ['Cancelled', 'Rejected', 'Completed'];
    let historySlots = slotData.filter(slot => historyStatuses.includes(slot.status));

    if (historyFilter !== 'All') {
      historySlots = historySlots.filter(slot => slot.status === historyFilter);
    }

    return (
      <div>
        {/* 🔍 Filter Dropdown */}
        <div className="mb-4">
          <label className="mr-2 font-medium">Filter by:</label>
          <select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option>All</option>
            <option>Completed</option>
            <option>Cancelled</option>
            <option>Rejected</option>
          </select>
        </div>

        {historySlots.length === 0
          ? <p className="text-gray-500">No history for this date.</p>
          : <ul className="space-y-2">
              {historySlots.map((slot, i) => (
                <li key={i} className="p-3 bg-white shadow rounded flex justify-between">
                  <div>
                    <div className="font-semibold">{slot.time}</div>
                    {slot.purpose && <div className="text-sm text-gray-500">Purpose: {slot.purpose}</div>}
                  </div>
                  <span className={{
                    'Rejected': 'text-red-500',
                    'Cancelled': 'text-yellow-500',
                    'Completed': 'text-gray-500'
                  }[slot.status]}>
                    {slot.status}
                  </span>
                </li>
              ))}
            </ul>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
        <AdminNavbar />

        <main className="p-6 flex-1 mt-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Check Allocation: <span className="text-blue-600">{labName}</span>
            </h1>
          </div>

          {/* 📅 Date & Tabs */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded px-3 py-2 shadow-sm"
          />
          <div className="flex gap-2">
            {['available', 'approved', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 🧾 Slot List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 capitalize">{activeTab} slots</h3>
          {activeTab === 'available' && renderAvailable()}
          {activeTab === 'approved' && renderApproved()}
          {activeTab === 'history' && renderHistory()}
        </div>
      </main>
    </div>
  );
};

export default AdminCheckAllocation;