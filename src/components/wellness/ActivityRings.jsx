import React from 'react';

// Reusable Ring Component
const Ring = ({ radius, stroke, progress, color, icon, label, value, target, unit, onEditValue, isEditingGoals, onEditGoal }) => {
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
        <div className="absolute text-2xl cursor-pointer" onClick={onEditValue}>{icon}</div>
      </div>
      
      <div className="text-center mt-3">
        <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            <span className="text-xs text-gray-400 font-medium">
                / {isEditingGoals ? (
                    <input 
                        type="number" 
                        value={target} 
                        onChange={(e) => onEditGoal(parseFloat(e.target.value) || 0)}
                        className="w-16 border-b border-gray-300 focus:border-green-500 outline-none text-center bg-transparent"
                    />
                ) : (
                    `${target} ${unit}`
                )}
            </span>
        </div>
      </div>
    </div>
  );
};

const ActivityRings = ({ steps, stepGoal, activeMinutes, activeGoal, calories, calorieGoal, loading, updateProgress, isEditingGoals, setGoalTargets, goalTargets }) => {
  
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-pulse flex justify-around h-64 items-center">
        {[1, 2, 3].map(i => <div key={i} className="w-24 h-24 bg-gray-100 rounded-full"></div>)}
      </div>
    );
  }

  // Helpers to update specific goals
  const updateStepGoal = (val) => setGoalTargets(prev => ({...prev, steps: {...prev.steps, target: val}}));
  const updateCalorieGoal = (val) => setGoalTargets(prev => ({...prev, calories: {...prev.calories, target: val}}));
  const updateActiveGoal = (val) => setGoalTargets(prev => ({...prev, activeMinutes: {...prev.activeMinutes, target: val}}));

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-around items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
      
      <Ring 
        radius={60} stroke={8} progress={Math.min((steps / stepGoal) * 100, 100)} 
        color="#10B981" icon="👣" label="Steps" value={steps} target={stepGoal} unit=""
        onEditValue={() => updateProgress('steps', prompt("Manually enter steps:", steps))}
        isEditingGoals={isEditingGoals}
        onEditGoal={updateStepGoal}
      />
      
      <Ring 
        radius={60} stroke={8} progress={Math.min((activeMinutes / activeGoal) * 100, 100)} 
        color="#F59E0B" icon="⚡" label="Active" value={activeMinutes} target={activeGoal} unit="m"
        onEditValue={() => updateProgress('activeMinutes', prompt("Manually enter active minutes:", activeMinutes))}
        isEditingGoals={isEditingGoals}
        onEditGoal={updateActiveGoal}
      />
      
      <Ring 
        radius={60} stroke={8} progress={Math.min((calories / calorieGoal) * 100, 100)} 
        color="#EF4444" icon="🔥" label="Calories" value={calories} target={calorieGoal} unit="kcal"
        onEditValue={() => updateProgress('calories', prompt("Manually enter calories burned:", calories))}
        isEditingGoals={isEditingGoals}
        onEditGoal={updateCalorieGoal}
      />
    </div>
  );
};

export default ActivityRings;