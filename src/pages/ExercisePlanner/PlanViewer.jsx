import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
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

const PlanViewer = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (user && id) {
        getDoc(doc(db, "users", user.uid, "exercisePlans", id))
            .then(snap => { if(snap.exists()) setPlan(snap.data()); })
            .finally(() => setLoading(false));
    }
  }, [user, id]);

  if(loading) return <div className="p-10 text-center">Loading...</div>;
  if(!plan) return <div className="p-10 text-center">Plan not found</div>;

  return (
    <div className="min-h-screen bg-white">
       <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
             <div className="flex items-center gap-4">
                <Link to="/exercise-plans" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                    <p className="text-gray-500">{plan.exercises.length} Exercises • Read Only Mode</p>
                </div>
             </div>
             <Link 
                to={`/exercise-plans/${id}/active`}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 flex items-center gap-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Start Workout
             </Link>
          </div>

          <div className="space-y-6">
             {plan.exercises.map((item, i) => {
                const details = getExerciseDetails(item.name);

                return (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                   <div className="p-5 flex items-start gap-5">
                      <img src={`${IMAGE_BASE_URL}${item.image}`} className="w-20 h-20 bg-gray-100 rounded-lg object-cover" alt={item.name} />
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                                {/* BADGES */}
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getLevelColor(details.level)}`}>{details.level}</span>
                                    {details.primaryMuscles.map(m => <span key={m} className="text-[10px] px-2 py-0.5 rounded border border-gray-200 bg-white text-gray-500 uppercase font-bold">{m}</span>)}
                                </div>
                            </div>
                            <a href={getYoutubeUrl(item.name)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                               <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Watch Tutorial
                            </a>
                         </div>

                         {/* INSTRUCTIONS DROPDOWN */}
                         {details.instructions.length > 0 && (
                            <details className="group mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <summary className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer hover:text-green-600 transition-colors select-none list-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    How to perform
                                </summary>
                                <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm text-gray-600">
                                    {details.instructions.map((step, idx) => <li key={idx}>{step}</li>)}
                                </ol>
                            </details>
                         )}

                         <div className="mt-4 space-y-1">
                            {item.sets.map((set, idx) => (
                               <div key={idx} className="grid grid-cols-3 gap-4 text-sm text-gray-700 py-1 border-b border-gray-50 last:border-0">
                                  <div className="font-semibold text-gray-400">Set {idx + 1}</div>
                                  <div>{set.weight} kg</div>
                                  <div>{set.reps} reps</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             )})}
          </div>
       </div>
    </div>
  );
};
export default PlanViewer;