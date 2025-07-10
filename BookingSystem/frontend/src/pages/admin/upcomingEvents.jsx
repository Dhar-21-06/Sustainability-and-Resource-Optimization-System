import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
const ViewUpcomingEvents = () => {
const [upcomingEvents, setUpcomingEvents] = useState([]);
const Backend_url = import.meta.env.VITE_BACKEND;

useEffect(() => {
  const fetchEvents = async () => {
    const res = await fetch(`${Backend_url}/api/bookings/upcoming`);
    const data = await res.json();

    const mapped = data.map(item => ({
      id: item._id,
      title: item.purpose,
      location: item.lab,
      time: `${item.date} | ${item.time}`,
      staff: {
        name: item.userId?.name || 'N/A',
        email: item.userId?.email || 'N/A',
        phone: item.userId?.phone || 'N/A',
        department: item.userId?.department || 'N/A'
      }
    }));

    setUpcomingEvents(mapped);
  };

  fetchEvents();
}, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
    <div className="flex-grow bg-gray-100 dark:bg-gray-900 pt-24 px-6">
  <h2 className="text-3xl font-bold mb-6 text-blue-800 dark:text-white">Upcoming Slots</h2>
  {upcomingEvents.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400">No upcoming slots found.</p>
  ) : (
    <ul className="space-y-4">
      {upcomingEvents.map((event) => (
        <li
          key={event.id}
          className="p-4 border rounded-lg shadow hover:shadow-md hover:scale-[1.01] transition-transform duration-300 bg-white dark:bg-gray-800 dark:border-gray-700"
        >
          <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{event.title}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Location: <span className="font-medium">{event.location}</span></p>
          <p className="text-sm text-gray-700 dark:text-gray-300">Time: <span className="font-medium">{event.time}</span></p>

          <div className="text-sm text-gray-700 space-y-1 mt-2">
            <p>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Staff Name:</span> <span className='text-sm text-gray-700 dark:text-gray-300'>{event.staff.name}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Email:</span> <span className='text-sm text-gray-700 dark:text-gray-300'>{event.staff.email}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Phone:</span> <span className='text-sm text-gray-700 dark:text-gray-300'>{event.staff.phone}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-800 dark:text-gray-100">Department:</span> <span className='text-sm text-gray-700 dark:text-gray-300'>{event.staff.department}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
};

export default ViewUpcomingEvents;