import React, { useState, useEffect, useMemo } from 'react';
import exercisesData from '../../data/exercises.json'; 

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const ExerciseLibrary = ({ addToPlan }) => {
  const [displayedExercises, setDisplayedExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filterOptions = useMemo(() => {
    const muscles = new Set();
    const equipment = new Set();
    const levels = new Set();
    exercisesData.forEach(ex => {
      if (ex.primaryMuscles) ex.primaryMuscles.forEach(m => muscles.add(m));
      if (ex.equipment) equipment.add(ex.equipment);
      if (ex.level) levels.add(ex.level);
    });
    return {
      muscles: ['All', ...Array.from(muscles).sort()],
      equipment: ['All', ...Array.from(equipment).sort()],
      levels: ['All', ...Array.from(levels).sort()]
    };
  }, []);

  useEffect(() => {
    let result = exercisesData;
    if (searchTerm.trim() !== '') result = result.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedMuscle !== 'All') result = result.filter(ex => ex.primaryMuscles && ex.primaryMuscles.includes(selectedMuscle));
    if (selectedEquipment !== 'All') result = result.filter(ex => ex.equipment === selectedEquipment);
    if (selectedLevel !== 'All') result = result.filter(ex => ex.level === selectedLevel);
    result.sort((a, b) => a.name.localeCompare(b.name));
    setDisplayedExercises(result);
  }, [searchTerm, selectedMuscle, selectedEquipment, selectedLevel]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-100 bg-white space-y-3">
        <input type="text" placeholder="Search exercises..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: selectedMuscle, set: setSelectedMuscle, opts: filterOptions.muscles, label: "Muscles" },
            { val: selectedEquipment, set: setSelectedEquipment, opts: filterOptions.equipment, label: "Equipment" },
            { val: selectedLevel, set: setSelectedLevel, opts: filterOptions.levels, label: "Level" }
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={(e) => f.set(e.target.value)} className="w-full p-2 text-xs border rounded-md outline-none">
              <option value="All">All {f.label}</option>
              {f.opts.map(o => o !== 'All' && <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {displayedExercises.map(ex => (
          <div key={ex.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group hover:bg-white hover:shadow-md border border-transparent hover:border-green-100 transition-all">
             <div className="w-12 h-12 flex-shrink-0 bg-white rounded overflow-hidden border border-gray-100 relative">
                {ex.images && ex.images.length > 0 ? (
                  <img src={`${IMAGE_BASE_URL}${ex.images[0]}`} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                ) : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Img</div>}
             </div>
             <div className="flex-grow min-w-0">
               <p className="font-semibold text-gray-800 text-sm truncate">{ex.name}</p>
               <p className="text-xs text-gray-500 truncate capitalize">{ex.primaryMuscles[0]} • {ex.equipment || 'Body'}</p>
             </div>
             <button onClick={() => addToPlan(ex)} className="w-8 h-8 flex items-center justify-center rounded-full text-green-600 bg-green-50 hover:bg-green-100">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseLibrary;