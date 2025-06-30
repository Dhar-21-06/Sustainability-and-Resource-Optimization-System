import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import EventCard from '../../components/common/admin_c/EventCard';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

useEffect(() => {
  const fetchEvents = async () => {
    const res = await fetch('http://localhost:5000/api/bookings/upcoming');
    const data = await res.json();

    const mapped = data.map(item => ({
      eventName: item.purpose,        // your event name
      location: item.lab,             // lab is location
      time: `${item.date} | ${item.time}`,
      staffInCharge: item.userId?.name || 'N/A'
    }));

    setEvents(mapped);
  };

  fetchEvents();
}, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="flex-grow p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-blue-800 mb-6">Upcoming Events</h1>
        <div>
        {events.map((event, index) => (
          <EventCard key={index} {...event} />
        ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;