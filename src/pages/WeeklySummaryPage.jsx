import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

// --- CONFIGURATION ---
const METRICS = {
  steps: { label: 'Steps', color: '#10B981', unit: '' },
  calories: { label: 'Calories', color: '#EF4444', unit: 'kcal' },
  activeMinutes: { label: 'Active', color: '#F59E0B', unit: 'min' },
  sleepHours: { label: 'Sleep', color: '#6366F1', unit: 'hr' },
  waterIntake: { label: 'Water', color: '#3B82F6', unit: 'gls' },
  mindfulnessMinutes: { label: 'Mindfulness', color: '#8B5CF6', unit: 'min' },
};

// --- COMPONENTS ---
const Spinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
  </div>
);

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  </div>
);

const WeeklySummaryPage = () => {
  const [goals, setGoals] = useState({});
  const [weekData, setWeekData] = useState([]);
  const [bmiData, setBmiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // 1. Fetch User Goals
    const unsubGoals = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      setGoals(docSnap.data()?.goalTargets || {});
    });

    // 2. Fetch Last 7 Days of Progress
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString().split('T')[0];

    // Note: Firestore string comparison works for ISO dates
    const qProgress = query(
      collection(db, "users", user.uid, "dailyProgress"),
      where("__name__", ">=", dateString), // Filter by Doc ID (Date)
      limit(7)
    );

    // 3. Fetch BMI History
    const qBmi = query(
      collection(db, "users", user.uid, "bmiHistory"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    Promise.all([getDocs(qProgress), getDocs(qBmi)]).then(([progSnap, bmiSnap]) => {
      // Map Progress Data
      const progressDocs = progSnap.docs.map(doc => ({ date: doc.id, ...doc.data() }));
      // Sort by date ascending for charts
      progressDocs.sort((a, b) => new Date(a.date) - new Date(b.date));
      setWeekData(progressDocs);

      // Map BMI Data
      const bmiDocs = bmiSnap.docs.map(doc => ({
        date: doc.data().timestamp?.toDate().toLocaleDateString() || 'N/A',
        bmi: doc.data().bmi
      })).reverse(); // Oldest first for chart
      setBmiData(bmiDocs);

      setLoading(false);
    });

    return () => unsubGoals();
  }, [user]);

  // --- AGGREGATION LOGIC ---
  const summary = useMemo(() => {
    if (!weekData.length) return null;

    const totals = { steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0, waterIntake: 0 };
    let journalCount = 0;
    const moodCounts = {};

    weekData.forEach(day => {
      totals.steps += day.steps || 0;
      totals.calories += day.calories || 0;
      totals.activeMinutes += day.activeMinutes || 0;
      totals.sleepHours += day.sleepHours || 0;
      totals.waterIntake += day.waterIntake || 0;
      if (day.journal) journalCount++;
      if (day.mood) moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1;
    });

    const days = weekData.length;
    const averages = {
      steps: Math.round(totals.steps / days),
      calories: Math.round(totals.calories / days),
      sleep: (totals.sleepHours / days).toFixed(1),
      water: Math.round(totals.waterIntake / days)
    };

    const dominantMood = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];

    return { totals, averages, journalCount, dominantMood };
  }, [weekData]);

  // --- CHART FORMATTERS ---
  const formatXAxis = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>;

  if (!summary) return (
    <div className="min-h-screen bg-gray-50 p-10 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">No Data Yet</h2>
      <p className="text-gray-500 mb-6">Start tracking your week to see insights!</p>
      <Link to="/wellness-tracker" className="bg-green-600 text-white px-6 py-2 rounded-lg">Go to Tracker</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
             <Link to="/" className="text-gray-500 hover:text-green-600 font-medium mb-1 inline-block">&larr; Dashboard</Link>
             <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
             <p className="text-gray-500">Overview of your last 7 active days</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-semibold text-gray-600">
             {weekData.length} Days Logged
          </div>
        </div>

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <StatCard 
             title="Avg Steps" 
             value={summary.averages.steps} 
             subtext={`Total: ${(summary.totals.steps / 1000).toFixed(1)}k`}
             color="bg-emerald-100 text-emerald-600"
             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
           />
           <StatCard 
             title="Avg Calories" 
             value={summary.averages.calories} 
             subtext="kcal / day"
             color="bg-red-100 text-red-600"
             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>}
           />
           <StatCard 
             title="Avg Sleep" 
             value={summary.averages.sleep} 
             subtext="hours / night"
             color="bg-indigo-100 text-indigo-600"
             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
           />
           <StatCard 
             title="Total Active" 
             value={summary.totals.activeMinutes} 
             subtext="minutes this week"
             color="bg-orange-100 text-orange-600"
             icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
           />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
           
           {/* 1. Activity Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Activity Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 12}} />
                    <YAxis yAxisId="left" orientation="left" stroke="#10B981" />
                    <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="steps" name="Steps" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="activeMinutes" name="Active Mins" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* 2. Sleep Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Sleep Quality</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weekData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 12}} />
                    <YAxis domain={[0, 12]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Line type="monotone" dataKey="sleepHours" name="Hours" stroke="#6366F1" strokeWidth={3} dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* BOTTOM SECTION: Habits & Weight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Habit Consistency */}
           <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Habit Consistency</h3>
              <div className="space-y-5">
                 {['waterIntake', 'mindfulnessMinutes', 'screenTimeHours'].map(key => {
                    const goal = goals[key]?.target || (key === 'screenTimeHours' ? 2 : 10); // Defaults
                    const label = METRICS[key]?.label || key;
                    const color = METRICS[key]?.color || '#9CA3AF';
                    
                    // Logic: Count days where goal was met
                    const daysMet = weekData.filter(d => {
                        const val = d[key] || 0;
                        return key === 'screenTimeHours' ? (val > 0 && val <= goal) : val >= goal;
                    }).length;
                    
                    const percent = (daysMet / Math.max(weekData.length, 1)) * 100;

                    return (
                       <div key={key}>
                          <div className="flex justify-between mb-1 text-sm">
                             <span className="font-semibold text-gray-700">{label}</span>
                             <span className="text-gray-500">{daysMet}/{weekData.length} days met</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                             <div 
                               className="h-2.5 rounded-full transition-all duration-1000" 
                               style={{ width: `${percent}%`, backgroundColor: color }}
                             ></div>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>

           {/* Weight & Mood */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 mb-4">Mood</h3>
                 <div className="text-center py-4">
                    <span className="text-6xl">{summary.dominantMood || '😐'}</span>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Most frequent mood</p>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 mb-2">Weight Trend</h3>
                 {bmiData.length > 0 ? (
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bmiData}>
                                <Tooltip />
                                <Line type="monotone" dataKey="bmi" stroke="#10B981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                 ) : (
                    <p className="text-sm text-gray-400 py-4">Log your weight in BMI Calculator to see trends.</p>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryPage;