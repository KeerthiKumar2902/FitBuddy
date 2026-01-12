import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

const IMAGE_BASE_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const PlansDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const q = query(collection(db, "users", user.uid, "exercisePlans"));
      const snapshot = await getDocs(q);
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if(!window.confirm("Delete this plan?")) return;
    try {
        await deleteDoc(doc(db, "users", user.uid, "exercisePlans", planId));
        setPlans(plans.filter(p => p.id !== planId));
    } catch (error) { alert("Failed to delete"); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white shadow-sm">
         <Link to="/" className="text-gray-500 hover:text-green-600 font-medium">&larr; Back to Dashboard</Link>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-gray-800">My Workout Plans</h1><p className="text-gray-600">Manage your routines</p></div>
          <Link to="/exercise-plans/create" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 flex items-center gap-2">
            + Create New Plan
          </Link>
        </div>

        {loading ? <div className="text-center py-20">Loading...</div> : 
         plans.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-xl font-semibold text-gray-600">No plans found</p>
             <Link to="/exercise-plans/create" className="text-green-600 hover:underline">Create your first one &rarr;</Link>
           </div>
         ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{plan.exercises.length} Exercises</p>
                  <div className="flex -space-x-2 overflow-hidden mb-6">
                    {plan.exercises.slice(0, 4).map((ex, i) => (
                       <img key={i} src={`${IMAGE_BASE_URL}${ex.image}`} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100" />
                    ))}
                  </div>
                </div>

                {/* --- START WORKOUT BUTTON ADDED HERE --- */}
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <Link 
                    to={`/exercise-plans/${plan.id}/active`}
                    className="block w-full text-center bg-green-600 text-white py-2.5 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    Start Workout
                  </Link>

                  <div className="flex gap-2">
                    <Link to={`/exercise-plans/${plan.id}`} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-semibold text-center hover:bg-blue-100">View</Link>
                    <Link to={`/exercise-plans/${plan.id}/edit`} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg font-semibold text-center hover:bg-green-100">Edit</Link>
                    <button onClick={() => handleDelete(plan.id)} className="px-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                  </div>
                </div>
                {/* --- END BUTTON SECTION --- */}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default PlansDashboard;