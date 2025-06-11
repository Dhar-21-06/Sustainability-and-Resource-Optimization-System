import React from 'react';

const ViewUpcomingEvents = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'AI Workshop',
      location: 'Gen AI Lab',
      time: '10:00 AM - 12:00 PM',
      staff: 'Dr. Priya Kumar'
    },
    {
      id: 2,
      title: 'IoT Hands-on Session',
      location: 'IoT Lab',
      time: '01:00 PM - 03:00 PM',
      staff: 'Mr. Arjun Mehta'
    },
    {
      id: 3,
      title: 'Cyber Security Seminar',
      location: 'Security Lab',
      time: '03:30 PM - 05:00 PM',
      staff: 'Ms. Neha Sharma'
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Upcoming Events</h2>
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
  );
};

export default ViewUpcomingEvents;