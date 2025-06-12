import React from 'react';

const EventCard = ({ eventName, location, time, staffInCharge }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800">{eventName}</h3>
      <p className="text-gray-600 mt-1">📍 {location}</p>
      <p className="text-gray-600 mt-1">🕒 {time}</p>
      <p className="text-gray-600 mt-1">👤 {staffInCharge}</p>
    </div>
  );
};

export default EventCard;
