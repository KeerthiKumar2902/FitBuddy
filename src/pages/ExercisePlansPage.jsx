// src/pages/ExercisePlansPage.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import allExercisePlans from '../data/exercisePlans.json';

const PlanDetailModal = ({ plan, onClose }) => {
  // This component remains the same
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{plan.planName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          <p className="italic text-gray-700">{plan.description}</p>
          <div>
            <h4 className="font-bold text-lg text-gray-800 mb-2">Weekly Schedule</h4>
            <ul className="list-disc list-inside ml-4 text-gray-600">
              {plan.weeklySchedule.map((item, index) => <li key={index}><strong>{item.day}:</strong> {item.activity}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-800 mb-2">Exercise Details</h4>
            <div className="space-y-3">
              {plan.exercises.map((exercise, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{exercise.name}</p>
                    <p className="text-sm text-gray-500">{exercise.setsReps}</p>
                  </div>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' tutorial')}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600">
                    Search Video
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExercisePlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bmiCategory, setBmiCategory] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    // This logic remains the same
    const fetchBmiAndFilterPlans = async () => {
      if (auth.currentUser) {
        const bmiHistoryRef = collection(db, "users", auth.currentUser.uid, "bmiHistory");
        const qBmi = query(bmiHistoryRef, orderBy("timestamp", "desc"), limit(1));
        const bmiSnapshot = await getDocs(qBmi);

        if (bmiSnapshot.empty) {
          setBmiCategory('NoData');
          setLoading(false);
          return;
        }

        const latestBmi = bmiSnapshot.docs[0].data().bmi;
        let category = '';
        if (latestBmi < 18.5) category = 'Underweight';
        else if (latestBmi >= 18.5 && latestBmi < 25) category = 'Normal';
        else if (latestBmi >= 25 && latestBmi < 30) category = 'Overweight';
        else category = 'Obesity';
        setBmiCategory(category);

        const matchedPlans = allExercisePlans.filter(plan => plan.targetBmiCategory === category);
        setPlans(matchedPlans);
        setLoading(false);
      }
    };
    fetchBmiAndFilterPlans();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading plans...</div>;
  }
  
  if (bmiCategory === 'NoData') {
    return (
      <div className="text-center p-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Unlock Your Personalized Exercise Plans</h2>
        <p className="mb-6">We need your BMI to suggest the best plans for you. Please calculate your BMI first.</p>
        <Link to="/bmi-calculator" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
          Go to BMI Calculator
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Exercise Plans</h1>
          <p className="text-lg text-gray-600 mb-8">Based on your BMI category of <span className="font-bold text-green-600">{bmiCategory}</span>, here are some suggested workout plans.</p>
        </div>

        {/* --- CHANGE 1: Switched from 'grid' to 'flex' and centered the items --- */}
        <div className="flex flex-wrap justify-center gap-8">
          {plans.length > 0 ? plans.map(plan => (
            // --- CHANGE 2: Added width constraints to the cards so they wrap properly ---
            <div key={plan.id} className="w-full md:max-w-sm bg-white rounded-lg shadow-lg overflow-hidden flex flex-col group cursor-pointer" onClick={() => setSelectedPlan(plan)}>
              <div className="relative">
                <img src={plan.imageUrl} alt={plan.planName} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-0 left-0 p-4">
                  <h2 className="text-2xl font-bold text-white">{plan.planName}</h2>
                  <span className="text-sm bg-green-500 text-white px-2 py-1 rounded-full">{plan.focus}</span>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <p className="text-gray-600 text-sm flex-grow">{plan.description}</p>
                <button className="mt-4 w-full text-center py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
                  View Plan Details
                </button>
              </div>
            </div>
          )) : <p className="col-span-full text-center text-gray-500">No specific exercise plans found for your BMI category at this time.</p>}
        </div>
      </div>

      {selectedPlan && <PlanDetailModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
};

export default ExercisePlansPage;