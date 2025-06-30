import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
const ViewUpcomingEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);

useEffect(() => {
  const fetchEvents = async () => {
    const res = await fetch('http://localhost:5000/api/bookings/upcoming');
    const data = await res.json();

    const mapped = data.map(item => ({
      id: item._id,
      title: item.purpose,
      location: item.lab,
      time: `${item.date} | ${item.time}`,
      staff: item.userId?.name || 'N/A'
    }));

    setUpcomingEvents(mapped);
  };

  fetchEvents();
}, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
    <div className="flex-grow bg-gray-100 pt-24 px-6">
  <h2 className="text-3xl font-bold mb-6 text-blue-800">Upcoming Events</h2>
  {upcomingEvents.length === 0 ? (
    <p className="text-gray-500">No upcoming events found.</p>
  ) : (
    <ul className="space-y-4">
      {upcomingEvents.map((event) => (
        <li
          key={event.id}
          className="p-4 border rounded-lg shadow hover:shadow-md hover:scale-[1.01] transition-transform duration-300"
        >
          <p className="text-lg font-semibold text-blue-700">{event.title}</p>
          <p className="text-sm text-gray-700">Location: <span className="font-medium">{event.location}</span></p>
          <p className="text-sm text-gray-700">Time: <span className="font-medium">{event.time}</span></p>
          <p className="text-sm text-gray-700">Staff In-charge: <span className="font-medium">{event.staff}</span></p>
        </li>
      ))}
    </ul>
  )}
</div>
    </div>
  );
};

export default ViewUpcomingEvents;