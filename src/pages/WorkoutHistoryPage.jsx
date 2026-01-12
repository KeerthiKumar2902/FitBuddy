import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

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
        limit(20) // Limit to last 20 workouts for performance
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to JS Date
        date: doc.data().date?.toDate() || new Date() 
      }));
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: 'numeric'
    }).format(date);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Calculate total volume (weight * reps) for the workout
  const calculateVolume = (exercises) => {
    let volume = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) volume += (s.weight * s.reps);
      });
    });
    return volume;
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading history...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <Link to="/" className="text-gray-500 hover:text-green-600 font-medium">&larr; Dashboard</Link>
           <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Workout Log</h1>
        </div>
        <div className="text-sm text-gray-500">
           {history.length} Workouts Completed
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
        {history.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-xl font-semibold text-gray-600 mb-2">No workout history yet</p>
             <p className="text-gray-500 mb-6">Complete a workout to see it here!</p>
             <Link to="/exercise-plans" className="text-green-600 font-bold hover:underline">Go to Plans &rarr;</Link>
           </div>
        ) : (
          history.map(log => (
            <div key={log.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Card Summary (Clickable) */}
              <div 
                onClick={() => toggleExpand(log.id)}
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{log.planName}</h3>
                  <p className="text-sm text-gray-500">{formatDate(log.date)}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">{formatDuration(log.durationSeconds)}</div>
                  <div className="text-xs text-gray-400">{calculateVolume(log.exercises)} kg Vol</div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === log.id && (
                <div className="bg-gray-50 border-t border-gray-100 p-5 space-y-4">
                  {log.exercises.map((ex, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-gray-700 mb-2 text-sm">{ex.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {ex.sets.map((s, j) => (
                          <span 
                            key={j} 
                            className={`text-xs px-2 py-1 rounded border ${s.completed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                          >
                            {s.weight}kg x {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutHistoryPage;