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
        {/* Icon is also clickable for quick edit */}
        <div className="absolute text-2xl cursor-pointer hover:scale-110 transition-transform" onClick={onEditValue} title="Click to edit value">
            {icon}
        </div>
      </div>
      
      <div className="text-center mt-3">
        <p className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline justify-center gap-1">
            {/* --- ACTUAL VALUE (Clickable) --- */}
            <div 
                onClick={onEditValue}
                className="group/val flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-2 rounded-md transition-colors"
                title="Click to edit actual value"
            >
                <span className="text-2xl font-bold text-gray-800 group-hover/val:text-green-600 transition-colors">{value}</span>
                {/* Tiny pencil that appears on hover */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-300 opacity-0 group-hover/val:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
            </div>

            <span className="text-xs text-gray-400 font-medium">
                / {isEditingGoals ? (
                    <input 
                        type="number" 
                        value={target} 
                        onChange={(e) => onEditGoal(parseFloat(e.target.value) || 0)}
                        className="w-16 border-b border-gray-300 focus:border-green-500 outline-none text-center bg-transparent font-bold text-gray-600"
                        autoFocus
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

  // Helpers to prompt user for actual values
  const handleEditSteps = () => {
      const val = prompt("Enter Steps:", steps);
      if (val !== null) updateProgress('steps', parseInt(val) || 0);
  };
  const handleEditActive = () => {
      const val = prompt("Enter Active Minutes:", activeMinutes);
      if (val !== null) updateProgress('activeMinutes', parseInt(val) || 0);
  };
  const handleEditCalories = () => {
      const val = prompt("Enter Calories Burned:", calories);
      if (val !== null) updateProgress('calories', parseInt(val) || 0);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row justify-around items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500"></div>
      
      <Ring 
        radius={60} stroke={8} progress={Math.min((steps / stepGoal) * 100, 100)} 
        color="#10B981" icon="👣" label="Steps" value={steps} target={stepGoal} unit=""
        onEditValue={handleEditSteps}
        isEditingGoals={isEditingGoals}
        onEditGoal={updateStepGoal}
      />
      
      <Ring 
        radius={60} stroke={8} progress={Math.min((activeMinutes / activeGoal) * 100, 100)} 
        color="#F59E0B" icon="⚡" label="Active" value={activeMinutes} target={activeGoal} unit="m"
        onEditValue={handleEditActive}
        isEditingGoals={isEditingGoals}
        onEditGoal={updateActiveGoal}
      />
      
      <Ring 
        radius={60} stroke={8} progress={Math.min((calories / calorieGoal) * 100, 100)} 
        color="#EF4444" icon="🔥" label="Calories" value={calories} target={calorieGoal} unit="kcal"
        onEditValue={handleEditCalories}
        isEditingGoals={isEditingGoals}
        onEditGoal={updateCalorieGoal}
      />
    </div>
  );
};

export default ActivityRings;