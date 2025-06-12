import React from 'react';
import AdminNavbar from '../../components/common/admin_c/AdminNavbar';
import AdminHeader from '../../components/common/admin_c/AdminHeader';
import AdminFooter from '../../components/common/admin_c/AdminFooter';
import EventCard from '../../components/common/admin_c/EventCard';

const UpcomingEvents = () => {
  const events = [
    {
      eventName: 'AI Seminar',
      location: 'Auditorium A',
      time: '2025-06-15 | 11:00 AM',
      staffInCharge: 'Dr. Priya Sharma'
    },
    {
      eventName: 'Robotics Workshop',
      location: 'Lab 2',
      time: '2025-06-18 | 2:00 PM',
      staffInCharge: 'Prof. Karthik R'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-grow p-6 bg-gray-100">
        <h1 className="text-2xl font-semibold text-blue-800 mb-6">Upcoming Events</h1>
        {events.map((event, index) => (
          <EventCard key={index} {...event} />
        ))}
      </main>
    </div>
  );
};

export default UpcomingEvents;