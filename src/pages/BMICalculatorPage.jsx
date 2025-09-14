// src/pages/BMICalculatorPage.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
// --- 1. ADDED: Firebase imports for deletion ---
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Enhanced styling helper with gradients and richer colors
const getBmiStyle = (category) => {
  switch (category) {
    case 'Underweight': return { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500', from: 'from-blue-400', to: 'to-blue-600' };
    case 'Normal weight': return { text: 'text-green-500', bg: 'bg-green-50', border: 'border-green-500', from: 'from-green-400', to: 'to-green-600' };
    case 'Overweight': return { text: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-500', from: 'from-yellow-400', to: 'to-yellow-600' };
    case 'Obesity': return { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-500', from: 'from-red-400', to: 'to-red-600' };
    default: return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-500', from: 'from-gray-400', to: 'to-gray-600' };
  }
};

const BMICalculatorPage = ({ user }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [history, setHistory] = useState([]);
  const [newBmiResult, setNewBmiResult] = useState(null);
  const [displayData, setDisplayData] = useState({ bmi: null, category: '', range: null });

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "users", user.uid, "bmiHistory"), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHistory(historyData);
        
        if (historyData.length > 0) {
          const latestEntry = historyData[historyData.length - 1];
          updateDisplayData(latestEntry.bmi, latestEntry.height || height);
        } else {
          // --- 2. CRUCIAL FIX: This ensures the display resets when history is empty ---
          setDisplayData({ bmi: null, category: '', range: null });
        }
      });
      return () => unsubscribe();
    }
  }, [user, height]);

  const updateDisplayData = (bmiValue, currentHeight = height) => {
    if (!bmiValue) return;
    let category = '';
    if (bmiValue < 18.5) category = 'Underweight';
    else if (bmiValue >= 18.5 && bmiValue < 25) category = 'Normal weight';
    else if (bmiValue >= 25 && bmiValue < 30) category = 'Overweight';
    else category = 'Obesity';
    let range = null;
    if (currentHeight) {
      const heightInMeters = currentHeight / 100;
      const min = (18.5 * heightInMeters * heightInMeters).toFixed(1);
      const max = (24.9 * heightInMeters * heightInMeters).toFixed(1);
      range = { min, max };
    }
    setDisplayData({ bmi: bmiValue.toFixed(2), category, range });
  };

  const calculateBmi = (e) => {
    e.preventDefault();
    if (!height || !weight) return;
    const heightInMeters = height / 100;
    const bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
    setNewBmiResult(bmiValue);
    updateDisplayData(bmiValue, height);
  };

  const handleSaveResult = async () => {
    if (!newBmiResult || !user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "bmiHistory"), {
        bmi: newBmiResult,
        height: parseFloat(height), // Save height with the record
        timestamp: serverTimestamp()
      });
      setNewBmiResult(null);
      setHeight('');
      setWeight('');
    } catch (error) {
      console.error("Error saving BMI result:", error);
    }
  };

  // --- 3. ADDED: Function to handle resetting history ---
  const handleResetHistory = async () => {
    if (!user || history.length === 0) return;
    const isConfirmed = window.confirm("Are you sure you want to delete all your BMI history? This action cannot be undone.");

    if (isConfirmed) {
      try {
        const historyCollectionRef = collection(db, "users", user.uid, "bmiHistory");
        const querySnapshot = await getDocs(historyCollectionRef);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log("History successfully deleted!");
      } catch (error) {
        console.error("Error deleting history: ", error);
      }
    }
  };

  const displayStyle = getBmiStyle(displayData.category);
  const insights = { /* ... insights object remains the same ... */ };
  const chartData = history.map(entry => ({
    date: entry.timestamp ? new Date(entry.timestamp.seconds * 1000).toLocaleDateString() : 'N/A',
    bmi: entry.bmi
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-blue-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 mb-6 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* Calculator Card - UNCHANGED */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200">
              {/* ... form content is exactly the same as your working code ... */}
              <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  <h2 className="text-xl font-bold text-gray-800">BMI Calculator</h2>
              </div>
              <form onSubmit={calculateBmi} className="space-y-4">
                  <div>
                      <label className="block mb-1 font-semibold text-gray-600 text-sm">Height (cm)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                      <label className="block mb-1 font-semibold text-gray-600 text-sm">Weight (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-full px-4 py-2 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <button type="submit" className={`w-full py-3 px-4 text-white font-semibold rounded-lg bg-gradient-to-r ${displayStyle.from} ${displayStyle.to} hover:opacity-90 transition-opacity shadow-md`}>Calculate</button>
              </form>
            </div>

            {/* Always-Visible Insights Card - UNCHANGED */}
            {displayData.bmi && (
              <div className={`p-6 rounded-2xl shadow-lg border-l-4 ${displayStyle.border} ${displayStyle.bg}`}>
                {/* ... insights content is exactly the same as your working code ... */}
                <p className="font-semibold text-gray-700">{newBmiResult ? "Your New Result" : "Your Latest BMI"}</p>
                <p className={`text-6xl font-bold ${displayStyle.text}`}>{displayData.bmi}</p>
                <p className={`text-2xl font-semibold -mt-1 ${displayStyle.text}`}>{displayData.category}</p>
                {displayData.range && (
                  <div className="mt-4 p-3 bg-white/50 rounded-lg text-center">
                    <p className="font-semibold text-gray-700 text-sm">Healthy Weight Range for Your Height:</p>
                    <p className={`text-lg font-bold ${getBmiStyle('Normal weight').text}`}>{displayData.range.min} kg - {displayData.range.max} kg</p>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{insights[displayData.category]}</p>
                </div>
                {newBmiResult && (
                  <button onClick={handleSaveResult} className="w-full mt-6 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 shadow-md">Save Result</button>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200">
            {/* --- 4. ADDED: Reset button to the card header --- */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                <h3 className="text-xl font-bold text-gray-800">Your Progress Over Time</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={handleResetHistory}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Reset
                </button>
              )}
            </div>
            
            {/* Chart and History List - UNCHANGED */}
            {history.length > 1 ? (
              <div className="h-80 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={['dataMin - 2', 'dataMax + 2']} /><Tooltip /><Legend /><Line type="monotone" dataKey="bmi" stroke="#4CAF50" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-center bg-gray-50/50 rounded-lg"><p className="text-gray-500">Your progress chart will appear here once you have at least two saved entries.</p></div>
            )}
            <h4 className="text-lg font-bold text-gray-800 mt-6 mb-2">History</h4>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {chartData.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-md hover:bg-gray-100">
                  <span className="text-gray-600">{entry.date}</span>
                  <span className={`font-bold text-lg ${getBmiStyle(displayData.category).text}`}>{entry.bmi.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculatorPage;