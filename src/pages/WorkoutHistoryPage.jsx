import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const WorkoutHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const q = query(
        collection(db, "users", user.uid, "workoutHistory"),
        orderBy("date", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date() 
      }));
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- ANALYTICS ---
  const stats = useMemo(() => {
    let totalWorkouts = history.length;
    let totalMinutes = 0;
    let totalVolume = 0;

    history.forEach(log => {
        totalMinutes += (log.durationSeconds || 0) / 60;
        if(log.exercises) {
            log.exercises.forEach(ex => {
                ex.sets.forEach(s => {
                    if(s.completed) totalVolume += (s.weight * s.reps);
                });
            });
        }
    });

    return {
        workouts: totalWorkouts,
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        volume: Math.round(totalVolume / 1000) // in Tons
    };
  }, [history]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const getDateParts = (date) => {
    return {
        month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: date.getDate()
    };
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  const calculateExerciseVolume = (sets) => {
    return sets.reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
           <Link to="/" className="text-gray-400 hover:text-indigo-600 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           </Link>
           <h1 className="text-xl font-bold text-gray-900">Workout Log</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
        
        {/* STATS SUMMARY */}
        {history.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-indigo-600">{stats.workouts}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Workouts</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-indigo-600">{stats.hours}</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Hours</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-50 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-indigo-600">{stats.volume}k</span>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wide">Vol (kg)</span>
                </div>
            </div>
        )}

        {/* EMPTY STATE */}
        {history.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <h3 className="text-lg font-bold text-gray-800">No History Yet</h3>
             <p className="text-gray-500 mb-6 max-w-xs">Start a workout from your dashboard to see your progress here.</p>
             <Link to="/exercise-plans" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all">
                Start a Workout
             </Link>
           </div>
        ) : (
          // HISTORY LIST
          history.map(log => {
            const { month, day } = getDateParts(log.date);
            const isExpanded = expandedId === log.id;
            
            return (
            <div key={log.id} className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-gray-200 hover:shadow-md'}`}>
              
              {/* CARD HEADER */}
              <div 
                onClick={() => toggleExpand(log.id)}
                className="p-4 sm:p-5 cursor-pointer flex items-center gap-4 group"
              >
                {/* Date Badge */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-500 group-hover:border-indigo-200 group-hover:text-indigo-500'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                    <span className="text-xl font-black leading-none">{day}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg truncate mb-1 ${isExpanded ? 'text-indigo-900' : 'text-gray-900'}`}>{log.planName}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        {formatDuration(log.durationSeconds)}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <div className={`text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* --- NEW REDESIGNED DETAILS --- */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 divide-y divide-gray-100">
                  {log.exercises.map((ex, i) => (
                    <div key={i} className="p-4 sm:p-5">
                      {/* Exercise Header */}
                      <div className="flex items-center gap-3 mb-3">
                         {ex.image && (
                           <img src={`${IMAGE_BASE_URL}${ex.image}`} className="w-10 h-10 rounded-lg bg-white border object-cover shadow-sm" alt="icon" />
                         )}
                         <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm leading-tight">{ex.name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                               {calculateExerciseVolume(ex.sets)} kg Volume
                            </p>
                         </div>
                      </div>

                      {/* Sets Table */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                         <div className="grid grid-cols-12 bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 py-1.5 px-3 border-b border-gray-100">
                            <div className="col-span-2 text-center">Set</div>
                            <div className="col-span-5 text-center">Weight</div>
                            <div className="col-span-5 text-center">Reps</div>
                         </div>
                         <div className="divide-y divide-gray-50">
                            {ex.sets.map((s, j) => (
                               <div key={j} className="grid grid-cols-12 text-xs py-2 px-3 text-gray-700">
                                  <div className="col-span-2 text-center font-semibold text-gray-400">#{j + 1}</div>
                                  <div className="col-span-5 text-center font-bold">{s.weight} <span className="text-[10px] font-normal text-gray-400">kg</span></div>
                                  <div className="col-span-5 text-center">{s.reps}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )})
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryPage;