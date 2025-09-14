// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: 'female',
    height: '', // Added height
    weight: '', // Added weight
    activityLevel: 'sedentary',
  });
  const [message, setMessage] = useState('');
  const user = auth.currentUser;

  // Fetch existing profile data when the component loads
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          setProfileData(prev => ({ ...prev, ...docSnap.data() }));
        }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        // Ensure numeric fields are stored as numbers
        const dataToSave = {
          ...profileData,
          age: parseInt(profileData.age) || 0,
          height: parseFloat(profileData.height) || 0,
          weight: parseFloat(profileData.weight) || 0,
        };
        await setDoc(userDocRef, dataToSave, { merge: true });
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error("Error updating profile: ", error);
        setMessage('Failed to update profile.');
      }
    }
  };


  return (
    <div className="max-w-2xl mx-auto mt-10 p-8">
      <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" value={profileData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
            <input type="number" name="age" id="age" value={profileData.age} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
            <select name="gender" id="gender" value={profileData.gender} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
              <input type="number" name="height" id="height" value={profileData.height} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input type="number" name="weight" id="weight" value={profileData.weight} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
            <select name="activityLevel" id="activityLevel" value={profileData.activityLevel} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly_active">Lightly Active (light exercise/sports 1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
              <option value="very_active">Very Active (hard exercise/sports 6-7 days a week)</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Save Profile</button>
          {message && <p className="text-center text-green-600 mt-4">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;