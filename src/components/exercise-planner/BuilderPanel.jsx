import React from 'react';

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const getYoutubeUrl = (exerciseName) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " proper form")}`;
};

const BuilderPanel = ({ plan, setPlan, planName, setPlanName, onSave, onDiscard, isSaving }) => {
  
  const updateSet = (exIdx, setIdx, field, val) => {
    const newPlan = [...plan];
    newPlan[exIdx].sets[setIdx][field] = val;
    setPlan(newPlan);
  };
  const addSet = (exIdx) => {
    const newPlan = [...plan];
    const prev = newPlan[exIdx].sets[newPlan[exIdx].sets.length - 1];
    newPlan[exIdx].sets.push({ id: Date.now(), weight: prev ? prev.weight : 0, reps: prev ? prev.reps : 0 });
    setPlan(newPlan);
  };
  const removeSet = (exIdx, setIdx) => {
    const newPlan = [...plan];
    if (newPlan[exIdx].sets.length > 1) { newPlan[exIdx].sets.splice(setIdx, 1); setPlan(newPlan); }
  };
  const removeExercise = (idx) => setPlan(plan.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 bg-white shadow-sm z-10 border-b border-gray-100">
        <input 
          type="text" 
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="Name your workout (e.g., Chest Day)"
          className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 w-full" 
        />
        <p className="text-sm text-gray-500 mt-1">{plan.length} Exercises in this plan</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {plan.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
             <p>Drag exercises here to build your plan</p>
           </div>
        ) : (
          plan.map((item, exIdx) => (
            <div key={item.instanceId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between p-4 bg-gray-50 border-b border-gray-100 items-center">
                    <div className="flex items-center gap-3">
                      <img src={`${IMAGE_BASE_URL}${item.image}`} className="w-10 h-10 rounded bg-white object-cover" />
                      <h3 className="font-bold text-gray-800">{item.name}</h3>
                      <a href={getYoutubeUrl(item.name)} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-red-600 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                      </a>
                    </div>
                    <button onClick={() => removeExercise(exIdx)} className="text-gray-400 hover:text-red-500">&times;</button>
                </div>
                <div className="p-4 space-y-2">
                    <div className="grid grid-cols-10 gap-2 text-xs font-bold text-gray-500 uppercase text-center mb-1">
                        <div className="col-span-2">Set</div><div className="col-span-3">kg</div><div className="col-span-3">Reps</div><div className="col-span-2"></div>
                    </div>
                    {item.sets.map((set, setIdx) => (
                        <div key={set.id} className="grid grid-cols-10 gap-2 items-center">
                            <div className="col-span-2 text-center text-sm font-bold text-gray-600 bg-gray-100 rounded-full w-6 h-6 mx-auto flex items-center justify-center">{setIdx + 1}</div>
                            <div className="col-span-3"><input type="number" value={set.weight} onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)} className="w-full text-center border rounded p-1" /></div>
                            <div className="col-span-3"><input type="number" value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)} className="w-full text-center border rounded p-1" /></div>
                            <div className="col-span-2 text-center"><button onClick={() => removeSet(exIdx, setIdx)} disabled={item.sets.length===1} className="text-gray-300 hover:text-red-500">&minus;</button></div>
                        </div>
                    ))}
                    <button onClick={() => addSet(exIdx)} className="w-full py-1 mt-2 text-xs font-bold text-green-600 bg-green-50 rounded hover:bg-green-100">+ Add Set</button>
                </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 z-20">
        <button onClick={onDiscard} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Discard</button>
        <button onClick={onSave} disabled={isSaving || plan.length === 0 || !planName.trim()} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-md">
          {isSaving ? 'Saving...' : 'Save Plan'}
        </button>
      </div>
    </div>
  );
};

export default BuilderPanel;