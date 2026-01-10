import React from 'react';

const SleepBar = ({ label, minutes, color, totalMinutes }) => {
  const percent = totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0;
  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="text-gray-700 font-bold">{Math.round(percent)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`} 
          style={{ width: `${percent}%`, transition: 'width 1s ease-in-out' }}
        ></div>
      </div>
      <p className="text-[10px] text-gray-400 mt-1">{Math.floor(minutes / 60)}h {minutes % 60}m</p>
    </div>
  );
};

const SleepStagesCard = ({ totalHours, stages, source, isLoading }) => {
  if (isLoading) return <div className="h-48 bg-white rounded-2xl shadow-sm animate-pulse"></div>;

  const totalMinutes = (stages?.deep || 0) + (stages?.light || 0) + (stages?.rem || 0) + (stages?.awake || 0) || 1;
  const isAuto = source === 'fitbit';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
      {/* Source Badge */}
      <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isAuto ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
        {isAuto ? <span>⌚ Auto</span> : <span>✏️ Manual</span>}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Sleep Analysis</h3>
          <p className="text-2xl font-extrabold text-indigo-900">{totalHours} <span className="text-sm font-normal text-gray-500">hrs total</span></p>
        </div>
      </div>

      {/* Visual Sleep Stages */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <SleepBar label="Awake" minutes={stages?.awake || 0} color="bg-red-400" totalMinutes={totalMinutes} />
        <SleepBar label="REM" minutes={stages?.rem || 0} color="bg-blue-400" totalMinutes={totalMinutes} />
        <SleepBar label="Light" minutes={stages?.light || 0} color="bg-indigo-400" totalMinutes={totalMinutes} />
        <SleepBar label="Deep" minutes={stages?.deep || 0} color="bg-purple-600" totalMinutes={totalMinutes} />
      </div>
    </div>
  );
};

export default SleepStagesCard;