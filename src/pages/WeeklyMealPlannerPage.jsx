// src/pages/WeeklyMealPlannerPage.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Helper function to get the start of the current week (Monday) in YYYY-MM-DD format
const getStartOfWeekId = () => {
  const today = new Date();
  const day = today.getDay(); // Sunday - 0, Monday - 1, ...
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(new Date(today).setDate(diff));
  return monday.toISOString().split('T')[0];
};

const WeeklyMealPlannerPage = () => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [userProfile, setUserProfile] = useState(null);
  const [goal, setGoal] = useState('maintain');
  const [diet, setDiet] = useState('');

  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase());

  const user = auth.currentUser;
  const startOfWeekId = getStartOfWeekId();

  // useEffect now listens for REAL-TIME updates to both profile and plans
  useEffect(() => {
    if (user) {
      // Listen for REAL-TIME profile updates
      const userDocRef = doc(db, "users", user.uid);
      const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
        setUserProfile(docSnap.exists() ? docSnap.data() : {});
      });

      // Listen for weekly plan updates
      const planDocRef = doc(db, "users", user.uid, "weeklyPlans", startOfWeekId);
      const unsubPlan = onSnapshot(planDocRef, (docSnap) => {
        setWeeklyPlan(docSnap.exists() ? docSnap.data() : {});
        setLoading(false);
      });

      // Cleanup both listeners on unmount
      return () => {
        unsubProfile();
        unsubPlan();
      };
    }
  }, [user, startOfWeekId]);

  const generatePlan = async (e) => {
    e.preventDefault();
    if (!userProfile || !userProfile.height || !userProfile.weight || !userProfile.age || !userProfile.gender || !userProfile.activityLevel) {
      setError("Please complete your profile with height, weight, age, and gender before generating a plan.");
      return;
    }

    setIsGenerating(true);
    setError('');

    let bmr;
    if (userProfile.gender === 'male') {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
      bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }

    const activityMultipliers = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725 };
    const tdee = bmr * activityMultipliers[userProfile.activityLevel];

    let targetCalories;
    if (goal === 'lose') targetCalories = Math.round(tdee - 500);
    else if (goal === 'gain') targetCalories = Math.round(tdee + 300);
    else targetCalories = Math.round(tdee);

    const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
    let url = `https://api.spoonacular.com/mealplanner/generate?timeFrame=week&targetCalories=${targetCalories}&apiKey=${apiKey}`;
    if (diet) url += `&diet=${diet}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error!`);
      const data = await response.json();

      const planToSave = { generatedAt: new Date(), targetCalories, diet, goal, weekData: data.week };
      const docRef = doc(db, "users", user.uid, "weeklyPlans", startOfWeekId);
      await setDoc(docRef, planToSave);

    } catch (err) {
      setError('Failed to generate meal plan. The API may be temporarily unavailable. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (loading || userProfile === null) {
    return <div className="text-center p-10">Loading your data...</div>;
  }

  if (!userProfile.age || !userProfile.height || !userProfile.weight) {
    return (
      <div className="text-center p-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile to Continue</h2>
        <p className="mb-6">Our smart planner needs your age, height, and weight to create a personalized plan. Please update your profile.</p>
        <Link to="/profile" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>

        {weeklyPlan && weeklyPlan.weekData ? (
          // RENDER THE PLAN if it exists
          <div>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-gray-800">Your Meal Plan for the Week</h1>
              <p className="text-lg text-gray-600">Target: {weeklyPlan.targetCalories} kcal/day {weeklyPlan.diet && `(${weeklyPlan.diet})`}</p>
            </div>

            <div className="flex justify-center flex-wrap gap-2 mb-6 border-b">
              {days.map(day => (
                <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 capitalize font-semibold rounded-t-lg ${selectedDay === day ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {day}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {weeklyPlan.weekData[selectedDay]?.meals.map(meal => (
                <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <img src={`https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`} alt={meal.title} className="w-full h-48 object-cover" />
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-2 flex-grow">{meal.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Ready in {meal.readyInMinutes} mins</p>
                    <a href={meal.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-auto text-center w-full px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600">
                      View Recipe
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <button onClick={() => setWeeklyPlan({})} className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg">Generate a New Plan</button>
            </div>
          </div>
        ) : (
          // RENDER THE GENERATION FORM if no plan exists
          <div className="max-w-2xl mx-auto text-center bg-white p-10 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Create Your Weekly Meal Plan</h1>
            <p className="text-gray-600 mb-8">Set your goal, and we'll calculate the optimal calories to generate a personalized 7-day meal plan for you.</p>
            <form onSubmit={generatePlan} className="space-y-6">
              <div>
                <label htmlFor="goal" className="block text-lg font-medium text-gray-700">What is your primary goal?</label>
                <select id="goal" value={goal} onChange={e => setGoal(e.target.value)} className="mt-2 w-full max-w-xs mx-auto px-4 py-2 border rounded-lg">
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>
              <div>
                <label htmlFor="diet" className="block text-lg font-medium text-gray-700">Dietary Preference (Optional)</label>
                <select id="diet" value={diet} onChange={e => setDiet(e.target.value)} className="mt-2 w-full max-w-xs mx-auto px-4 py-2 border rounded-lg">
                  <option value="">Omnivore (No Restriction)</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescetarian">Pescetarian</option>
                  <option value="gluten free">Gluten-Free</option>
                  <option value="ketogenic">Ketogenic</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>
              <button type="submit" disabled={isGenerating} className="w-full max-w-xs mx-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                {isGenerating ? 'Generating...' : 'Generate My Smart Plan'}
              </button>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyMealPlannerPage;