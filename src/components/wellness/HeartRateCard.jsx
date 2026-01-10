import React from 'react';

const HeartRateCard = ({ value, source, isLoading }) => {
  if (isLoading) return <div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse"></div>;

  const isAuto = source === 'fitbit';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative flex items-center justify-between">
      {/* Background Graphic */}
      <svg className="absolute bottom-0 left-0 w-full h-16 opacity-10 text-red-500" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0 10 Q 10 20, 20 10 T 40 10 T 60 10 T 80 10 T 100 10" fill="transparent" stroke="currentColor" strokeWidth="2" />
      </svg>

      <div>
        <div className="flex items-center gap-2 mb-1">
           <h3 className="font-bold text-gray-700">Resting HR</h3>
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAuto ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
             {isAuto ? 'Live' : 'Manual'}
           </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-gray-900">{value || '--'}</span>
          <span className="text-sm text-gray-500 font-medium">bpm</span>
        </div>
      </div>

      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${value > 0 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-gray-50 text-gray-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default HeartRateCard;