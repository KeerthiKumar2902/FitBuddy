import React from 'react';

const CoreTrackers = ({ progress, goalTargets, setGoalTargets, updateProgress, isEditingGoals, setIsEditingGoals, handleSaveGoals, HABIT_GOALS }) => {
  const completedGoals = Object.keys(HABIT_GOALS).filter(key => progress[key] >= goalTargets[key].target).length;
  const totalGoals = Object.keys(HABIT_GOALS).length;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-xl font-bold text-gray-800">Daily Habits</h3>
            <p className="text-xs text-gray-500">{completedGoals}/{totalGoals} completed</p>
        </div>
        {isEditingGoals ? (
          <div className="flex gap-2">
            <button onClick={handleSaveGoals} className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 rounded-full shadow-md hover:bg-green-700 transition-all">Save</button>
            <button onClick={() => setIsEditingGoals(false)} className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-all">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setIsEditingGoals(true)} className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-full hover:bg-green-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {Object.keys(HABIT_GOALS).map(key => {
          const icon = { waterIntake: '💧', mindfulnessMinutes: '🧘‍♀️', screenTimeHours: '💻', sleepHours: '😴' }[key];
          const currentGoal = goalTargets[key] || HABIT_GOALS[key];
          const increment = currentGoal.increment || 1;
          const percentage = Math.min((progress[key] / currentGoal.target) * 100, 100);

          return (
            <div key={key} className="group relative bg-gray-50 rounded-xl p-4 transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100">
               {/* Progress Background Bar */}
               <div className="absolute bottom-0 left-0 h-1 bg-green-500 opacity-20 rounded-b-xl transition-all duration-500" style={{ width: `${percentage}%` }}></div>
               
               <div className="flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-3">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-xl">{icon}</div>
                   <div>
                     <p className="font-bold text-gray-700 text-sm">{currentGoal.label}</p>
                     <p className="text-xs text-gray-400">Goal: {currentGoal.target} {currentGoal.unit}</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <button onClick={() => updateProgress(key, progress[key] - increment)} className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-red-500 hover:shadow-md transition-all font-bold flex items-center justify-center">-</button>
                    <div className="text-center w-16">
                        <input 
                            type="number" 
                            value={progress[key]} 
                            onChange={(e) => updateProgress(key, parseFloat(e.target.value) || 0)}
                            className="w-full text-center bg-transparent font-bold text-lg text-gray-800 focus:outline-none border-b border-transparent focus:border-green-500"
                        />
                    </div>
                    <button onClick={() => updateProgress(key, progress[key] + increment)} className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-green-500 hover:shadow-md transition-all font-bold flex items-center justify-center">+</button>
                 </div>
               </div>
               
               {isEditingGoals && (
                 <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end items-center gap-2 animate-fade-in">
                   <span className="text-xs font-bold text-green-600">New Target:</span>
                   <input 
                     type="number" 
                     value={currentGoal.target} 
                     onChange={(e) => setGoalTargets({...goalTargets, [key]: {...currentGoal, target: parseFloat(e.target.value) || 0}})} 
                     className="w-16 px-2 py-1 text-xs border border-green-300 rounded text-center font-bold"
                   />
                 </div>
               )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default CoreTrackers;