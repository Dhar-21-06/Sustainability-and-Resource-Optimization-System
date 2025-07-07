import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/user_c/navbar';
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
      <Navbar />
    <div className="flex-grow bg-gray-100 pt-24 px-6">
  <h2 className="text-3xl font-bold mb-6 text-blue-800">Upcoming Slots</h2>
  {upcomingEvents.length === 0 ? (
    <p className="text-gray-500">No upcoming slots found.</p>
  ) : (
    <ul className="space-y-4">
      {upcomingEvents.map((event) => (
        <li
          key={event.id}
          className="p-4 border rounded-lg shadow hover:shadow-md hover:scale-[1.01] transition-transform duration-300 bg-white"
        >
          <p className="text-lg font-semibold text-blue-700">{event.title}</p>
          <p className="text-sm text-gray-700">Location: <span className="font-medium">{event.location}</span></p>
          <p className="text-sm text-gray-700">Time: <span className="font-medium">{event.time}</span></p>

          <div className="text-sm text-gray-700 space-y-1 mt-2">
            <p>
              <span className="font-semibold text-gray-800">Staff Name:</span> {event.staff.name}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Email:</span> {event.staff.email}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Phone:</span> {event.staff.phone}
            </p>
            <p>
              <span className="font-semibold text-gray-800">Department:</span> {event.staff.department}
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