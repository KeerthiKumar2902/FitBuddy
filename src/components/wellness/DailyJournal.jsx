import React from 'react';

const DailyJournal = ({ journalText, updateProgress }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Journal</h3>
      <textarea 
        value={journalText}
        onChange={(e) => updateProgress('journal', e.target.value)}
        placeholder="What's on your mind? Any wins today?"
        className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
};

export default DailyJournal;
