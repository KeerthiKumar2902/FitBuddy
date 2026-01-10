import React from 'react';

const Ring = ({ radius, stroke, progress, color, icon, label, value, target, unit, onEdit }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center group relative">
      <div className="relative flex items-center justify-center">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full blur-xl opacity-20 transform scale-90" style={{ backgroundColor: color }}></div>
        
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 relative z-10">
          <circle stroke="#f3f4f6" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out', strokeLinecap: 'round' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute text-2xl">{icon}</div>
        
        {/* Manual Edit Button Overlay (On Hover) */}
        <button 
            onClick={onEdit}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all cursor-pointer"
            title="Edit Manually"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 opacity-0 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-extrabold text-gray-800">
          {value.toLocaleString()} <span className="text-xs text-gray-400 font-medium">/ {target.toLocaleString()} {unit}</span>
        </p>
      </div>
    </div>
  );
};

const ActivityRings = ({ steps, stepGoal, calories, calorieGoal, activeMinutes, activeGoal, loading, updateProgress }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse flex justify-around h-64 items-center">
        {[1, 2, 3].map(i => <div key={i} className="w-24 h-24 bg-gray-100 rounded-full"></div>)}
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-around items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
      <Ring 
        radius={60} stroke={8} progress={Math.min((steps / stepGoal) * 100, 100)} 
        color="#10B981" icon="👣" label="Steps" value={steps} target={stepGoal} unit=""
        onEdit={() => updateProgress('steps', prompt("Manually enter steps:", steps))}
      />
      <Ring 
        radius={60} stroke={8} progress={Math.min((activeMinutes / activeGoal) * 100, 100)} 
        color="#F59E0B" icon="⚡" label="Active" value={activeMinutes} target={activeGoal} unit="m"
        onEdit={() => updateProgress('activeMinutes', prompt("Manually enter active minutes:", activeMinutes))}
      />
      <Ring 
        radius={60} stroke={8} progress={Math.min((calories / calorieGoal) * 100, 100)} 
        color="#EF4444" icon="🔥" label="Calories" value={calories} target={calorieGoal} unit="kcal"
        onEdit={() => updateProgress('calories', prompt("Manually enter calories:", calories))}
      />
    </div>
  );
};

export default ActivityRings;