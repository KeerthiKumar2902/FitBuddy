import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ExerciseLibrary from '../../components/exercise-planner/ExerciseLibrary';
import BuilderPanel from '../../components/exercise-planner/BuilderPanel';

const PlanEditor = () => {
  const { id } = useParams(); // If ID exists, we are editing
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [currentPlan, setCurrentPlan] = useState([]);
  const [planName, setPlanName] = useState("New Workout Routine");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  // Load existing plan if in edit mode
  useEffect(() => {
    if (id && user) {
        const fetchPlan = async () => {
            const docSnap = await getDoc(doc(db, "users", user.uid, "exercisePlans", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlanName(data.name);
                setCurrentPlan(data.exercises);
            }
            setLoading(false);
        };
        fetchPlan();
    }
  }, [id, user]);

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

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        const planData = { name: planName, exercises: currentPlan, updatedAt: serverTimestamp() };
        if (id) {
            await updateDoc(doc(db, "users", user.uid, "exercisePlans", id), planData);
        } else {
            planData.createdAt = serverTimestamp();
            await addDoc(collection(db, "users", user.uid, "exercisePlans"), planData);
        }
        navigate('/exercise-plans');
    } catch (error) { console.error(error); alert("Failed to save."); } 
    finally { setIsSaving(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading plan...</div>;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/exercise-plans')} className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800">{id ? 'Edit Plan' : 'Create Plan'}</h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 flex-shrink-0 flex flex-col shadow-lg z-10">
            <ExerciseLibrary addToPlan={handleAddToPlan} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
            <BuilderPanel 
                plan={currentPlan} setPlan={setCurrentPlan} 
                planName={planName} setPlanName={setPlanName} 
                onSave={handleSave} onDiscard={() => navigate('/exercise-plans')} isSaving={isSaving}
            />
        </div>
      </div>
    </div>
  );
};
export default PlanEditor;