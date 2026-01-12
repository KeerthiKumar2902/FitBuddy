import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import ExerciseLibrary from '../../components/exercise-planner/ExerciseLibrary';
import BuilderPanel from '../../components/exercise-planner/BuilderPanel';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase'; 
import exercisesData from '../../data/exercises.json';
// 1. IMPORT THE NEW MODAL
import AIWizardModal from '../../components/exercise-planner/AIWizardModal';

const PlanEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [currentPlan, setCurrentPlan] = useState([]);
  const [planName, setPlanName] = useState("New Workout Routine");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [mobileTab, setMobileTab] = useState('library');
  
  // 2. NEW STATE FOR MODAL
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Tracks loading state

  useEffect(() => {
    if (id && user) {
        const fetchPlan = async () => {
            const docSnap = await getDoc(doc(db, "users", user.uid, "exercisePlans", id));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlanName(data.name);
                setCurrentPlan(data.exercises);
                setMobileTab('builder');
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

  // 3. REFACTORED GENERATE FUNCTION (Accepts params from Modal)
  const handleAIGenerate = async (userGoal, userEquipment) => {
    // Note: We don't set loading state here because the Modal handles the "Processing" UI
    // But we keep isGenerating for the button spinner if needed
    setIsGenerating(true); 

    try {
      const generateWorkout = httpsCallable(functions, 'generateWorkoutPlan');
      
      const response = await generateWorkout({ 
        goal: userGoal, 
        equipment: userEquipment, 
        duration: 45, 
        availableExercises: exercisesData.map(e => ({ name: e.name })) 
      });

      const aiPlan = response.data.workoutPlan;

      const newExercises = aiPlan.map(aiItem => {
        const fullExercise = exercisesData.find(e => e.name === aiItem.exerciseName);
        if (!fullExercise) return null;

        return {
          exerciseId: fullExercise.id,
          instanceId: crypto.randomUUID(),
          name: fullExercise.name,
          image: fullExercise.images?.[0] || null,
          sets: Array.from({ length: aiItem.sets }).map(() => ({ 
            id: Date.now() + Math.random(), 
            weight: 0, 
            reps: aiItem.reps 
          }))
        };
      }).filter(e => e !== null);

      if (newExercises.length === 0) {
        alert("AI couldn't match exercises. Try a different goal.");
      } else {
        setCurrentPlan(prev => [...prev, ...newExercises]);
        setMobileTab('builder'); 
        setIsAIModalOpen(false); // Close modal on success
      }

    } catch (error) {
      console.error("AI Error:", error);
      alert(`AI Generation Failed: ${error.message}`);
      setIsAIModalOpen(false); // Close on error too
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading plan...</div>;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      
      {/* 4. RENDER THE MODAL */}
      <AIWizardModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleAIGenerate}
      />

      <header className="h-14 md:h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0 z-20 shadow-sm gap-2">
        <div className="flex items-center gap-3 overflow-hidden">
            <button onClick={() => navigate('/exercise-plans')} className="text-gray-500 hover:text-green-600 p-1.5 rounded-full hover:bg-gray-100 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">{id ? 'Edit Plan' : 'Create Plan'}</h1>
        </div>
        
        <div className="flex items-center gap-2">
            
            {/* 5. UPDATE BUTTON TO OPEN MODAL */}
            <button 
                onClick={() => setIsAIModalOpen(true)}
                disabled={isGenerating}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                <span>AI Auto-Build</span>
            </button>

            {/* Mobile Button */}
            <button 
                onClick={() => setIsAIModalOpen(true)}
                disabled={isGenerating}
                className="md:hidden p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            </button>

            {/* Mobile Tabs */}
            <div className="flex md:hidden bg-gray-100 rounded-lg p-1 ml-2">
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
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`${mobileTab === 'library' ? 'flex' : 'hidden'} md:flex w-full md:w-96 flex-shrink-0 flex-col shadow-lg z-10 bg-white absolute md:relative h-full`}>
            <ExerciseLibrary addToPlan={handleAddToPlan} />
        </div>
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