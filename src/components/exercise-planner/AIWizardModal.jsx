// src/components/exercise-planner/AIWizardModal.jsx
import React, { useState } from 'react';

const AIWizardModal = ({ isOpen, onClose, onGenerate }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: Goal, 2: Equip, 3: Time, 4: Loading
  const [goal, setGoal] = useState('');
  const [equipment, setEquipment] = useState('');
  const [duration, setDuration] = useState('45'); // Default

  // Chips
  const GOAL_CHIPS = ["Build Muscle", "Weight Loss", "HIIT Cardio", "Strength", "Flexibility"];
  const EQUIP_CHIPS = ["Full Gym", "Dumbbells Only", "Bodyweight", "Home Gym", "Kettlebells"];
  const TIME_CHIPS = ["15", "30", "45", "60", "90"];

  const handleNext = () => {
    if (step === 1 && goal) setStep(2);
    else if (step === 2 && equipment) setStep(3);
    else if (step === 3 && duration) {
      setStep(4);
      onGenerate(goal, equipment, duration); // Pass all 3 inputs!
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">FitBuddy AI Trainer</h3>
              <p className="text-[10px] opacity-80">Powered by Gemini 2.5</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">&times;</button>
        </div>

        {/* Chat Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* STEP 1: GOAL */}
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">💪</div>
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 shadow-sm">
              Hi! Let's build your workout. <strong>What is your main goal?</strong>
            </div>
          </div>

          {step === 1 && (
            <div className="pl-11 space-y-3 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {GOAL_CHIPS.map(chip => (
                  <button key={chip} onClick={() => setGoal(chip)} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${goal === chip ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>{chip}</button>
                ))}
              </div>
              <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Or type here..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
            </div>
          )}

          {step > 1 && (
            <div className="flex justify-end animate-slide-up">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-md max-w-[80%]">{goal}</div>
            </div>
          )}

          {/* STEP 2: EQUIPMENT */}
          {step >= 2 && (
            <div className="flex gap-3 animate-slide-up delay-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">🏋️</div>
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 shadow-sm">
                Got it. <strong>What equipment do you have?</strong>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="pl-11 space-y-3 animate-fade-in">
               <div className="flex flex-wrap gap-2">
                {EQUIP_CHIPS.map(chip => (
                  <button key={chip} onClick={() => setEquipment(chip)} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${equipment === chip ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>{chip}</button>
                ))}
              </div>
              <input type="text" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="e.g. None, Bench..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
            </div>
          )}

          {step > 2 && (
            <div className="flex justify-end animate-slide-up">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-md max-w-[80%]">{equipment}</div>
            </div>
          )}

          {/* STEP 3: DURATION (NEW) */}
          {step >= 3 && (
            <div className="flex gap-3 animate-slide-up delay-100">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">⏱️</div>
              <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 shadow-sm">
                Last question. <strong>How much time do you have?</strong>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="pl-11 space-y-3 animate-fade-in">
               <div className="flex flex-wrap gap-2">
                {TIME_CHIPS.map(mins => (
                  <button key={mins} onClick={() => setDuration(mins)} className={`px-4 py-2 text-sm rounded-xl border transition-all ${duration === mins ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          )}

          {step > 3 && (
            <div className="flex justify-end animate-slide-up">
              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-md max-w-[80%]">{duration} mins</div>
            </div>
          )}

          {/* STEP 4: LOADING */}
          {step === 4 && (
             <div className="flex gap-3 animate-pulse delay-200">
             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">✨</div>
             <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm text-gray-500 italic shadow-sm flex items-center gap-2">
               <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Designing your {duration}-minute routine...
             </div>
           </div>
          )}

        </div>

        {/* Footer Actions */}
        {step < 4 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
              onClick={handleNext}
              disabled={(step === 1 && !goal) || (step === 2 && !equipment) || (step === 3 && !duration)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {step === 3 ? 'Generate Plan ✨' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWizardModal;