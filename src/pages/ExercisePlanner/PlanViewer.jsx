import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

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
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
             <Link to="/exercise-plans" className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             </Link>
             <div><h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1></div>
          </div>

          <div className="space-y-6">
             {plan.exercises.map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                   <div className="p-5 flex items-start gap-5">
                      <img src={`${IMAGE_BASE_URL}${item.image}`} className="w-20 h-20 bg-gray-100 rounded-lg object-cover" />
                      <div className="flex-1">
                         <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.name + " proper form")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100">
                               <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Watch Tutorial
                            </a>
                         </div>
                         <div className="mt-4 space-y-1">
                            {item.sets.map((set, idx) => (
                               <div key={idx} className="grid grid-cols-3 gap-4 text-sm text-gray-700 py-1 border-b border-gray-50">
                                  <div className="font-semibold text-gray-400">Set {idx + 1}</div>
                                  <div>{set.weight} kg</div>
                                  <div>{set.reps} reps</div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
export default PlanViewer;