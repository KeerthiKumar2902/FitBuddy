import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

// Helper: YouTube Search URL
const getYoutubeUrl = (exerciseName) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + " proper form")}`;
};

const ActiveWorkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState("");
  const [exercises, setExercises] = useState([]);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // 1. Live Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 2. Fetch & Init
  useEffect(() => {
    if (user && id) {
      const fetchPlan = async () => {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid, "exercisePlans", id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPlanName(data.name);
            
            const sessionExercises = data.exercises.map(ex => ({
              ...ex,
              sets: ex.sets.map(s => ({
                ...s,
                completed: false,
                actualWeight: s.weight, 
                actualReps: s.reps      
              }))
            }));
            setExercises(sessionExercises);
          }
        } catch (error) {
          console.error("Error loading plan:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPlan();
    }
  }, [user, id]);

  // 3. Interactions
  const toggleSet = (exIdx, setIdx) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx].completed = !updated[exIdx].sets[setIdx].completed;
    setExercises(updated);
  };

  const updateInput = (exIdx, setIdx, field, value) => {
    const updated = [...exercises];
    updated[exIdx].sets[setIdx][field] = value;
    setExercises(updated);
  };

  // 4. Calculate Progress Percentage
  const calculateProgress = () => {
    if (!exercises.length) return 0;
    let totalSets = 0;
    let completedSets = 0;
    exercises.forEach(ex => {
        ex.sets.forEach(s => {
            totalSets++;
            if (s.completed) completedSets++;
        });
    });
    return totalSets === 0 ? 0 : (completedSets / totalSets) * 100;
  };

  const handleFinish = async () => {
    if (!window.confirm("Great work! Ready to save this workout?")) return;
    try {
      const workoutLog = {
        planId: id,
        planName: planName,
        date: serverTimestamp(),
        durationSeconds: elapsedTime,
        exercises: exercises.map(ex => ({
           name: ex.name,
           image: ex.image,
           sets: ex.sets.map(s => ({
             weight: s.actualWeight,
             reps: s.actualReps,
             completed: s.completed
           }))
        }))
      };
      await addDoc(collection(db, "users", user.uid, "workoutHistory"), workoutLog);
      alert("Workout saved! 💪");
      navigate('/exercise-plans');
    } catch (error) {
      alert("Failed to save workout.");
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Cancel workout? No progress will be saved.")) {
      navigate('/exercise-plans');
    }
  };

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-medium">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
    Loading your session...
  </div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      
      {/* --- STICKY HEADER (Dark Mode for Contrast) --- */}
      <div className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg shadow-slate-200/50">
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800">
            <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                style={{width: `${calculateProgress()}%`}}
            ></div>
        </div>

        <div className="px-5 py-3 flex justify-between items-center">
            <div>
                <h1 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Session</h1>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black font-mono text-emerald-400 drop-shadow-sm">{formatTime(elapsedTime)}</span>
                    <span className="text-sm font-semibold text-slate-300 truncate max-w-[150px]">{planName}</span>
                </div>
            </div>

            <div className="flex gap-3">
                 <button 
                    onClick={handleDiscard}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                    title="Cancel Workout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <button 
                    onClick={handleFinish}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span>Finish</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
            </div>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="max-w-3xl mx-auto p-4 space-y-6 mt-4">
        {exercises.map((ex, exIdx) => (
          <div key={ex.instanceId} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
            
            {/* Colored Top Border for Personality */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>

            {/* Exercise Header */}
            <div className="p-5 flex items-start gap-4">
              <div className="relative">
                 <img src={`${IMAGE_BASE_URL}${ex.image}`} className="w-16 h-16 rounded-xl bg-slate-100 object-cover shadow-inner" alt={ex.name} />
                 {/* YouTube Floating Badge */}
                 <a 
                    href={getYoutubeUrl(ex.name)} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-md hover:scale-110 transition-transform"
                    title="Watch tutorial"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                 </a>
              </div>
              
              <div className="flex-1">
                 <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{ex.name}</h3>
                 <p className="text-sm text-slate-500 mt-1">Target: <span className="capitalize">{ex.sets.length} Sets</span></p>
              </div>
            </div>

            {/* Sets Table */}
            <div className="pb-4 px-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-2 px-3">
                <div className="col-span-2">Set</div>
                <div className="col-span-3">kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-4">Status</div>
              </div>

              <div className="space-y-2">
                {ex.sets.map((set, setIdx) => (
                  <div 
                    key={set.id} 
                    className={`grid grid-cols-12 gap-3 items-center py-2 px-3 rounded-xl transition-all duration-300 border ${
                        set.completed 
                            ? 'bg-emerald-50/50 border-emerald-200 shadow-sm translate-x-1' 
                            : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    {/* Set Number */}
                    <div className="col-span-2 flex justify-center">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold ${set.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {setIdx + 1}
                        </span>
                    </div>
                    
                    {/* Weight Input */}
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.actualWeight} 
                        onChange={(e) => updateInput(exIdx, setIdx, 'actualWeight', e.target.value)}
                        className={`w-full text-center py-1.5 rounded-lg font-bold text-sm outline-none transition-colors ${
                            set.completed 
                            ? 'bg-white text-emerald-800 border-2 border-emerald-100' 
                            : 'bg-slate-50 text-slate-700 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        }`}
                        placeholder="kg"
                      />
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <input 
                        type="number" 
                        value={set.actualReps} 
                        onChange={(e) => updateInput(exIdx, setIdx, 'actualReps', e.target.value)}
                        className={`w-full text-center py-1.5 rounded-lg font-bold text-sm outline-none transition-colors ${
                            set.completed 
                            ? 'bg-white text-emerald-800 border-2 border-emerald-100' 
                            : 'bg-slate-50 text-slate-700 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                        }`}
                        placeholder="reps"
                      />
                    </div>

                    {/* Checkbox Button */}
                    <div className="col-span-4 flex justify-center">
                      <button 
                        onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-full h-9 rounded-lg font-bold text-xs uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-1 shadow-sm ${
                          set.completed 
                            ? 'bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600' 
                            : 'bg-white border border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'
                        }`}
                      >
                        {set.completed ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                Done
                            </>
                        ) : 'Log Set'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveWorkout;