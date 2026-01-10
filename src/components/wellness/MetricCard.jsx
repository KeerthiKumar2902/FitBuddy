import React from 'react';

const MetricCard = ({ title, value, unit, icon, color, source, isLoading, onEdit }) => {
  if (isLoading) {
    return <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>;
  }

  const isAuto = source === 'fitbit';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
      {/* Source Badge */}
      <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isAuto ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
        {isAuto ? (
          <>
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 16.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm3-2.5c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm3-2.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/></svg>
            Auto
          </>
        ) : (
          'Manual'
        )}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color} text-white`}>{icon}</div>
        <h4 className="font-semibold text-gray-700">{title}</h4>
      </div>

      <div className="mt-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-sm text-gray-500 ml-1">{unit}</span>
      </div>

      {/* Edit Button (Visible on Hover) */}
      <button 
        onClick={onEdit}
        className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
        title="Manually Override"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
};

export default MetricCard;