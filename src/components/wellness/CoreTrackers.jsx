import React from 'react';

const CoreTrackers = ({ progress, goalTargets, setGoalTargets, updateProgress, isEditingGoals, setIsEditingGoals, handleSaveGoals, DEFAULT_GOALS }) => {
  
  const completedGoals = Object.keys(goalTargets).filter(key => progress[key] >= goalTargets[key].target).length;
  const totalGoals = Object.keys(goalTargets).length;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Core Trackers ({completedGoals}/{totalGoals} done)</h3>
        {isEditingGoals ? (
          <div className="flex gap-2">
            <button onClick={handleSaveGoals} className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">Save</button>
            <button onClick={() => setIsEditingGoals(false)} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setIsEditingGoals(true)} className="px-3 py-1 text-sm font-semibold text-green-600 bg-green-100 rounded-full">Edit Goals</button>
        )}
      </div>

      {Object.keys(DEFAULT_GOALS).map(key => {
        const icon = { waterIntake: '💧', activityMinutes: '🏃‍♂️', sleepHours: '😴', mindfulnessMinutes: '🧘‍♀️', screenTimeHours: '💻' }[key];
        const currentGoal = goalTargets[key] || DEFAULT_GOALS[key];
        const increment = currentGoal.increment || 1;

        return (
          <div key={key} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-lg" htmlFor={key}>{icon} {currentGoal.label}</label>
              {!isEditingGoals && <span className="text-sm text-gray-500">Target: {currentGoal.target} {currentGoal.unit}</span>}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button onClick={() => updateProgress(key, progress[key] - increment)} className="w-12 h-10 rounded-lg bg-gray-200 text-xl font-bold hover:bg-gray-300">-</button>
              <input id={key} type="number" step={increment} value={progress[key]} onChange={(e) => updateProgress(key, parseFloat(e.target.value) || 0)} className="w-24 px-3 py-2 text-center text-lg font-semibold border-t-0 border-b-2 border-x-0 border-gray-300 focus:outline-none focus:border-green-500 bg-transparent"/>
              <button onClick={() => updateProgress(key, progress[key] + increment)} className="w-12 h-10 rounded-lg bg-gray-200 text-xl font-bold hover:bg-gray-300">+</button>
              {isEditingGoals ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Target:</span>
                  <input type="number" value={currentGoal.target} onChange={(e) => setGoalTargets({...goalTargets, [key]: {...currentGoal, target: parseFloat(e.target.value) || 0}})} className="w-16 text-center border-2 border-green-400 rounded-md"/>
                </div>
              ) : (
                <div className="w-16"></div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default CoreTrackers;