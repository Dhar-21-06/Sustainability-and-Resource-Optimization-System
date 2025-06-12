import React from 'react';

const SlotRow = ({ time, status }) => {
  const statusColor = status === 'Booked' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="flex justify-between items-center border-b py-2">
      <span className="text-gray-700">{time}</span>
      <span
        className={`text-white text-xs px-3 py-1 rounded-full ${statusColor}`}
      >
        {status}
      </span>
    </div>
  );
};

export default SlotRow;
