import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';

const DEFAULT_SLOTS = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00"
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

// 📦 Fetch bookings based on tab
useEffect(() => {
  if (!labName || !date) return;

  const fetchAndComputeSlots = async () => {
    const isAuditorium = labName.toLowerCase().includes("auditorium");
    let url = '';

    if (isAuditorium) {
      url = `${Backend_url}/api/bookings/labs/auditorium/${encodeURIComponent(labName)}/${date}`;
    } else if (activeTab === 'history') {
      url = `${Backend_url}/api/bookings/lab/${encodeURIComponent(labName)}/${date}/slots?status=history`;
    } else {
      url = `${Backend_url}/api/bookings/lab/${encodeURIComponent(labName)}/${date}/slots`;
    }

    try {
      const res = await axios.get(url);
      let bookings = [];

      if (isAuditorium) {
        if (activeTab === 'available') {
          const blockedTimes = bookings
            .filter(b => ['approved', 'completed'].includes(b.status))
            .map(b => b.time);

          const availableSlots = DEFAULT_SLOTS
            .filter(time => !blockedTimes.includes(time))
            .map(time => ({
              time,
              status: 'available',
              isAvailable: true
            }));

          setSlotData(availableSlots);
          return;
        }
        if (activeTab === 'approved') {
          bookings = res.data.booked;

          const mapped = bookings.map(b => ({
            time: b.time || 'N/A',
            lab: b.lab || labName,
            status: b.status,
            purpose: b.purpose,
            updatedAt: b.updatedAt,
            userName: b.userId?.name || 'Unknown',
            userEmail: b.userId?.email || '',
          }));

          setSlotData(mapped);
          return;
        }

        else if (activeTab === 'history') {
          bookings = [
            ...res.data.cancelled,
            ...res.data.rejected,
            ...res.data.completed
          ];

          const mapped = bookings.map(b => ({
            time: b.time || 'N/A',
            lab: b.lab || labName,
            status: b.status,
            purpose: b.purpose,
            updatedAt: b.updatedAt,
            isAvailable: false,
            userName: b.userId?.name || 'Unknown',
            userEmail: b.userId?.email || '',
          }));

          setSlotData(mapped);
          return;
        }
      } else {
        bookings = res.data;
      }

      // 💡 LABS ONLY: Handle available/approved/history
      if (!isAuditorium) {
        if (activeTab === 'available') {
          const blockedTimes = bookings
            .filter(b => ['Approved', 'Completed'].includes(b.status))
            .map(b => b.time);

          const availableSlots = DEFAULT_SLOTS
            .filter(time => !blockedTimes.includes(time))
            .map(time => ({
              time,
              status: 'available',
              isAvailable: true
            }));

          setSlotData(availableSlots);
          return;
        }

        let slots = DEFAULT_SLOTS.map(time => {
          const booking = bookings.find(b => b.time === time);
          if (!booking) return { time, status: 'available', isAvailable: true };

          return {
            time,
            status: booking.status,
            purpose: booking.purpose,
            isAvailable: !['approved', 'completed'].includes(booking.status),
            userName: booking.user?.name || booking.userId?.name || 'Unknown',
            userEmail: booking.user?.email || booking.userId?.email || '',
            updatedAt: booking.updatedAt
          };
        });

        // Append extra non-default time bookings
        if (activeTab === 'history') {
          const extra = bookings
            .filter(b => !DEFAULT_SLOTS.includes(b.time))
            .map(b => ({
              time: b.time || 'N/A',
              status: b.status,
              purpose: b.purpose,
              isAvailable: false,
              userName: b.user?.name || b.userId?.name || 'Unknown',
              userEmail: b.user?.email || b.userId?.email || '',
              updatedAt: b.updatedAt
            }));
          slots = [...slots, ...extra];
        }

        setSlotData(slots);
      }

    } catch (err) {
      console.error("❌ Fetch slot data error:", err);
    }
  };

  fetchAndComputeSlots();
}, [labName, date, activeTab]);


  const renderAvailable = () => {
    const availableSlots = slotData.filter(slot => slot.isAvailable);

    return availableSlots.length === 0
      ? <p className="text-gray-500">No available slots for this date.</p>
      : <ul className="space-y-2">
          {availableSlots.map((slot, i) => (
            <li key={i} className="p-3 bg-white dark:bg-gray-700 shadow rounded flex justify-between">
              <span className="font-medium dark:text-white">{slot.time}</span>
              <span className="text-green-600 dark:text-green-400">Available</span>
            </li>
          ))}
        </ul>;
  };

  const renderApproved = () => {
    if (!slotData || slotData.length === 0) {
      return <p className="text-gray-500">No approved bookings for this date.</p>;
    }

    return (
      <ul className="space-y-2">
        {slotData.map((slot, i) => (
          <li key={i} className="p-3 bg-white dark:bg-gray-700 shadow rounded flex justify-between">
            <div>
              <div className="font-semibold">Slot: {slot.time}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Lab: {slot.lab}</div>
                {slot.purpose && (
                  <div className="text-sm text-gray-500 dark:text-gray-300">Purpose: {slot.purpose}</div>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  By: {slot.userName} ({slot.userEmail || 'No email'})
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-400">
                  At: {slot.updatedAt ? new Date(slot.updatedAt).toLocaleString() : 'Unknown time'}
                </div>
            </div>
            <span className="text-blue-600">Approved</span>
          </li>
        ))}
      </ul>
    );
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
            className="border rounded px-3 py-1 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
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
                <li key={i} className="p-3 bg-white dark:bg-gray-700 shadow rounded flex justify-between">
                  <div>
                    <div className="font-semibold">{slot.time}</div>
                    {slot.purpose && <div className="text-sm text-gray-500 dark:text-gray-300">Purpose: {slot.purpose}</div>}
                    <div className="text-sm text-gray-500 dark:text-gray-300">By: {slot.userName} ({slot.userEmail || 'No email'})</div>
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col text-gray-800 dark:text-gray-100">
        <AdminNavbar />

        <main className="p-6 flex-1 mt-20">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Check Allocation: <span className="text-blue-600">{labName}</span>
            </h1>
          </div>

          {/* 📅 Date & Tabs */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border rounded px-3 py-2 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
          />
          <div className="flex gap-2">
            {['available', 'approved', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 🧾 Slot List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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