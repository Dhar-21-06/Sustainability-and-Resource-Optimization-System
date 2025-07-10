import React from 'react';

const RequestCard = ({ lab, date, time, facultyName, purpose, onApprove, onReject, highlight }) => {
  return (
    <div className={`rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between transition-all duration-500
      ${highlight ? 'bg-blue-100 dark:bg-blue-200' : 'bg-white dark:bg-gray-800'}`}>
      <div>
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">{lab}</h3>
        <p className="text-gray-600 dark:text-gray-300">📅 {date}</p>
        <p className="text-gray-600 dark:text-gray-300">🕒 {time}</p>
        <p className="text-gray-600 dark:text-gray-300">👤 {facultyName}</p>
        {purpose && <p className="text-gray-600 dark:text-gray-300">📌 {purpose}</p>}
      </div>

      <div className="mt-3 md:mt-0 flex flex-col gap-2">
        <button
          onClick={onApprove}
          className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Approve
        </button>

        <button
          onClick={onReject}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default RequestCard;