import React from 'react';
import exercisesData from '../../data/exercises.json';

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const getYoutubeUrl = (exerciseName) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " proper form")}`;
};

const getExerciseDetails = (name) => {
  const found = exercisesData.find(e => e.name === name);
  return found || { level: 'intermediate', primaryMuscles: [], instructions: [] };
};

const getLevelColor = (level) => {
    switch(level) {
        case 'beginner': return 'bg-green-50 text-green-700 border-green-100';
        case 'intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        case 'expert': return 'bg-red-50 text-red-700 border-red-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
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
      {/* Title Input */}
      <div className="p-4 md:p-6 bg-white shadow-sm z-10 border-b border-gray-100">
        <input 
          type="text" 
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          placeholder="Name your workout (e.g., Chest Day)"
          className="text-xl md:text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400 w-full" 
        />
        <p className="text-sm text-gray-500 mt-1">{plan.length} Exercises in this plan</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-24">
        {plan.length === 0 ? (
           <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded-xl m-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p>Add exercises from the library</p>
           </div>
        ) : (
          plan.map((item, exIdx) => {
            const details = getExerciseDetails(item.name);
            return (
            <div key={item.instanceId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between p-3 md:p-4 bg-gray-50 border-b border-gray-100 items-start">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <img src={`${IMAGE_BASE_URL}${item.image}`} className="w-12 h-12 rounded bg-white object-cover border flex-shrink-0" alt={item.name} />
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-800 truncate text-sm md:text-base">{item.name}</h3>
                            <a href={getYoutubeUrl(item.name)} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1 rounded-full transition-colors flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg></a>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                             <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getLevelColor(details.level)}`}>{details.level}</span>
                             {details.primaryMuscles.map(m => <span key={m} className="text-[10px] px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-500 uppercase font-bold">{m}</span>)}
                          </div>

                          {details.instructions.length > 0 && (
                            <details className="group mt-1">
                                <summary className="flex items-center gap-1 text-xs font-semibold text-green-600 cursor-pointer hover:text-green-700 select-none list-none">
                                    <span>Instructions</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </summary>
                                <ol className="list-decimal pl-4 mt-2 text-[10px] md:text-xs text-gray-600 space-y-1">
                                    {details.instructions.slice(0, 3).map((step, i) => <li key={i}>{step}</li>)}
                                    {details.instructions.length > 3 && <li>...</li>}
                                </ol>
                            </details>
                          )}
                      </div>
                    </div>
                    <button onClick={() => removeExercise(exIdx)} className="text-gray-400 hover:text-red-500 ml-1 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                </div>

                {/* Sets Table - Adjusted Grid Gap for Mobile */}
                <div className="p-3 md:p-4 space-y-2 bg-white">
                    <div className="grid grid-cols-10 gap-1 md:gap-2 text-xs font-bold text-gray-500 uppercase text-center mb-1">
                        <div className="col-span-2">Set</div><div className="col-span-3">kg</div><div className="col-span-3">Reps</div><div className="col-span-2"></div>
                    </div>
                    {item.sets.map((set, setIdx) => (
                        <div key={set.id} className="grid grid-cols-10 gap-1 md:gap-2 items-center">
                            <div className="col-span-2 text-center text-sm font-bold text-gray-600 bg-gray-100 rounded-full w-6 h-6 mx-auto flex items-center justify-center">{setIdx + 1}</div>
                            <div className="col-span-3"><input type="number" value={set.weight} onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)} className="w-full text-center border rounded p-1 text-sm" /></div>
                            <div className="col-span-3"><input type="number" value={set.reps} onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)} className="w-full text-center border rounded p-1 text-sm" /></div>
                            <div className="col-span-2 text-center"><button onClick={() => removeSet(exIdx, setIdx)} disabled={item.sets.length===1} className="text-gray-300 hover:text-red-500 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button></div>
                        </div>
                    ))}
                    <button onClick={() => addSet(exIdx)} className="w-full py-2 mt-2 text-xs font-bold text-green-600 bg-green-50 rounded hover:bg-green-100">+ Add Set</button>
                </div>
            </div>
          )})
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={onDiscard} className="px-4 md:px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm md:text-base">Discard</button>
        <button onClick={onSave} disabled={isSaving || plan.length === 0 || !planName.trim()} className="px-4 md:px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-md text-sm md:text-base">
          {isSaving ? 'Saving...' : 'Save Plan'}
        </button>
      </div>
    </div>
  );
};

export default BuilderPanel;