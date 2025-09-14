import React from 'react';

const DateNavigator = ({ selectedDate, changeDay }) => {
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center justify-between mb-8">
      <button onClick={() => changeDay(-1)} className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100">
        &larr;
      </button>
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h2>
      <button onClick={() => changeDay(1)} disabled={isToday} className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50">
        &rarr;
      </button>
    </div>
  );
};

export default DateNavigator;
