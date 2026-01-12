import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import exercisesData from '../data/exercises.json'; 
import { Link } from 'react-router-dom';

// --- CONSTANTS ---
const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

// Helper: Generate YouTube Search URL
const getYoutubeUrl = (exerciseName) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " proper form")}`;
};

// ==========================================
// 1. COMPONENT: PLAN LIST (DASHBOARD)
// ==========================================
const PlanList = ({ plans, onCreateNew, onEdit, onView, onDelete, loading }) => {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Workout Plans</h1>
          <p className="text-gray-600 mt-1">Manage your custom routines</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Create New Plan
        </button>
      </div>

      {loading ? (
         <div className="text-center py-20 text-gray-500">Loading your plans...</div>
      ) : plans.length === 0 ? (
         <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
           <p className="text-xl font-semibold text-gray-600 mb-2">No plans found</p>
           <p className="text-gray-500 mb-6">Create your first workout routine to get started!</p>
           <button onClick={onCreateNew} className="text-green-600 font-bold hover:underline">Create Now &rarr;</button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow relative group flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.exercises.length} Exercises</p>
                
                <div className="flex -space-x-2 overflow-hidden mb-6">
                  {plan.exercises.slice(0, 4).map((ex, i) => (
                     <img key={i} src={`${IMAGE_BASE_URL}${ex.image}`} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100" />
                  ))}
                  {plan.exercises.length > 4 && <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">+{plan.exercises.length - 4}</div>}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => onView(plan)} 
                  className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View
                </button>
                <button 
                  onClick={() => onEdit(plan)} 
                  className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                   Edit
                </button>
                <button 
                  onClick={() => onDelete(plan.id)} 
                  className="px-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Plan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. COMPONENT: EXERCISE LIBRARY (LEFT PANEL)
// ==========================================
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

// ==========================================
// 3. COMPONENT: PLAN BUILDER (RIGHT PANEL)
// ==========================================
const PlanBuilder = ({ plan, setPlan, planName, setPlanName, onSave, onDiscard, isSaving }) => {
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
                      
                      {/* --- YOUTUBE SEARCH ICON (SMALL) --- */}
                      <a 
                        href={getYoutubeUrl(item.name)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Search proper form on YouTube"
                      >
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
        <button 
          onClick={onSave} 
          disabled={isSaving || plan.length === 0 || !planName.trim()}
          className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSaving ? 'Saving...' : 'Save Plan'}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. COMPONENT: PLAN VIEWER (READ ONLY)
// ==========================================
const PlanViewer = ({ plan, planName, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
       {/* HEADER */}
       <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
             <h1 className="text-3xl font-bold text-gray-900">{planName}</h1>
             <p className="text-gray-500">{plan.length} Exercises • Read Only Mode</p>
          </div>
       </div>

       {/* CONTENT */}
       <div className="space-y-6">
          {plan.map((item, i) => (
             <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 flex items-start gap-5">
                   {/* Image */}
                   <img src={`${IMAGE_BASE_URL}${item.image}`} alt={item.name} className="w-20 h-20 bg-gray-100 rounded-lg object-cover border border-gray-100" />
                   
                   <div className="flex-1">
                      <div className="flex justify-between items-start">
                         <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                         
                         {/* --- YOUTUBE SEARCH BUTTON (BIG) --- */}
                         <a 
                            href={getYoutubeUrl(item.name)}
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            Watch Tutorial
                         </a>
                      </div>

                      {/* Sets Table */}
                      <div className="mt-4">
                         <div className="grid grid-cols-3 gap-4 text-xs font-bold text-gray-500 uppercase mb-2">
                            <div>Set</div>
                            <div>Weight (kg)</div>
                            <div>Reps</div>
                         </div>
                         <div className="space-y-1">
                            {item.sets.map((set, setIdx) => (
                               <div key={setIdx} className="grid grid-cols-3 gap-4 text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0">
                                  <div className="font-semibold text-gray-400">#{setIdx + 1}</div>
                                  <div>{set.weight}</div>
                                  <div>{set.reps}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

// ==========================================
// 5. MAIN PAGE CONTROLLER
// ==========================================
const ExercisePlansPage = () => {
  // View State: 'list' | 'builder' | 'view'
  const [viewMode, setViewMode] = useState('list'); 
  
  // Data State
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Builder/Viewer State
  const [currentPlan, setCurrentPlan] = useState([]);
  const [planName, setPlanName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const user = auth.currentUser;

  // --- 1. Fetch Plans on Load ---
  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "exercisePlans"));
      const snapshot = await getDocs(q);
      const fetchedPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Action Handlers ---
  const handleCreateNew = () => {
    setEditingId(null);
    setPlanName("New Workout Routine");
    setCurrentPlan([]);
    setViewMode('builder');
  };

  const handleEdit = (plan) => {
    setEditingId(plan.id);
    setPlanName(plan.name);
    setCurrentPlan(plan.exercises);
    setViewMode('builder');
  };

  const handleView = (plan) => {
    setPlanName(plan.name);
    setCurrentPlan(plan.exercises);
    setViewMode('view'); // Switch to View Mode
  };

  const handleDelete = async (planId) => {
    if(!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
        await deleteDoc(doc(db, "users", user.uid, "exercisePlans", planId));
        setPlans(plans.filter(p => p.id !== planId));
    } catch (error) {
        alert("Failed to delete plan");
    }
  };

  const handleAddToPlan = (exercise) => {
    const newExercise = {
        exerciseId: exercise.id,
        instanceId: crypto.randomUUID(),
        name: exercise.name,
        image: exercise.images?.[0] || null,
        sets: [{ id: Date.now(), weight: 0, reps: 0 }]
    };
    setCurrentPlan(prev => [...prev, newExercise]);
  };

  const handleSavePlan = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        const planData = {
            name: planName,
            exercises: currentPlan,
            updatedAt: serverTimestamp()
        };

        if (editingId) {
            await updateDoc(doc(db, "users", user.uid, "exercisePlans", editingId), planData);
        } else {
            planData.createdAt = serverTimestamp();
            await addDoc(collection(db, "users", user.uid, "exercisePlans"), planData);
        }
        
        await fetchPlans(); 
        setViewMode('list');
    } catch (error) {
        console.error("Error saving plan:", error);
        alert("Failed to save plan.");
    } finally {
        setIsSaving(false);
    }
  };

  // --- 3. Render Views ---
  
  // VIEW 1: Dashboard List
  if (viewMode === 'list') {
      return (
         <div className="min-h-screen bg-white">
            <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white"><Link to="/" className="text-gray-500 hover:text-green-600">&larr; Dashboard</Link></header>
            <PlanList 
              plans={plans} 
              loading={loading} 
              onCreateNew={handleCreateNew} 
              onEdit={handleEdit} 
              onView={handleView}
              onDelete={handleDelete} 
            />
         </div>
      );
  }

  // VIEW 2: Read-Only Viewer
  if (viewMode === 'view') {
    return (
      <PlanViewer 
        plan={currentPlan} 
        planName={planName} 
        onBack={() => setViewMode('list')} 
      />
    );
  }

  // VIEW 3: Interactive Builder
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Builder: {planName}</h1>
        </div>
        <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full uppercase tracking-wider">{editingId ? 'Editing' : 'New Plan'}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 flex-shrink-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
            <ExerciseLibrary addToPlan={handleAddToPlan} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
            <PlanBuilder 
                plan={currentPlan} setPlan={setCurrentPlan} 
                planName={planName} setPlanName={setPlanName} 
                onSave={handleSavePlan} onDiscard={() => setViewMode('list')} isSaving={isSaving}
            />
        </div>
      </div>
    </div>
  );
};

export default ExercisePlansPage;