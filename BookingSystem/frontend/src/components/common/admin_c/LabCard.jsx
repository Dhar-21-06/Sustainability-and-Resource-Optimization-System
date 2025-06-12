import React, { useState } from 'react';
import SlotRow from './SlotRow';

const LabCard = ({ labName, slots }) => {
  const [open, setOpen] = useState(false);

  const toggleSlots = () => {
    setOpen(!open);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleSlots}
      >
        <h3 className="text-lg font-semibold text-blue-800">{labName}</h3>
        <span className="text-gray-500">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="mt-3">
          {slots.length > 0 ? (
            slots.map((slot, idx) => (
              <SlotRow key={idx} time={slot.time} status={slot.status} />
            ))
          ) : (
            <p className="text-gray-500 text-sm mt-2">No slots available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LabCard;
