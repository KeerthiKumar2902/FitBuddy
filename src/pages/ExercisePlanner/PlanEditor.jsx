import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ExerciseLibrary from '../../components/exercise-planner/ExerciseLibrary';
import BuilderPanel from '../../components/exercise-planner/BuilderPanel';

const PlanEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [currentPlan, setCurrentPlan] = useState([]);
  const [planName, setPlanName] = useState("New Workout Routine");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  
  // NEW: State for Mobile Tab Switching ('library' or 'builder')
  const [mobileTab, setMobileTab] = useState('library');

  // Load existing plan if in edit mode
  useEffect(() => {
    if (id && user) {
        const fetchPlan = async () => {
            const docSnap = await getDoc(doc(db, "users", user.uid, "exercisePlans", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlanName(data.name);
                setCurrentPlan(data.exercises);
                setMobileTab('builder'); // Default to builder if editing
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
    
    // Optional: Auto-switch to builder on mobile when adding first exercise
    if (window.innerWidth < 768 && currentPlan.length === 0) {
        setMobileTab('builder');
    }
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
      {/* HEADER */}
      <header className="h-14 md:h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/exercise-plans')} className="text-gray-500 hover:text-green-600 p-1.5 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">{id ? 'Edit Plan' : 'Create Plan'}</h1>
        </div>
        
        {/* MOBILE TABS (Visible only on small screens) */}
        <div className="flex md:hidden bg-gray-100 rounded-lg p-1">
            <button 
                onClick={() => setMobileTab('library')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mobileTab === 'library' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
                + Add
            </button>
            <button 
                onClick={() => setMobileTab('builder')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${mobileTab === 'builder' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
            >
                Plan <span className="bg-gray-200 text-gray-600 px-1.5 rounded-full text-[10px]">{currentPlan.length}</span>
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: LIBRARY */}
        {/* On Mobile: Only show if tab is 'library' */}
        {/* On Desktop: Always show (md:flex) */}
        <div className={`${mobileTab === 'library' ? 'flex' : 'hidden'} md:flex w-full md:w-96 flex-shrink-0 flex-col shadow-lg z-10 bg-white absolute md:relative h-full`}>
            <ExerciseLibrary addToPlan={handleAddToPlan} />
        </div>
        
        {/* RIGHT PANEL: BUILDER */}
        {/* On Mobile: Only show if tab is 'builder' */}
        {/* On Desktop: Always show (md:flex) */}
        <div className={`${mobileTab === 'builder' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 bg-gray-50 h-full`}>
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