// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    gender: 'female',
    height: '',
    weight: '',
    activityLevel: 'sedentary',
    photoURL: '',
  });
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const user = auth.currentUser;

  // useEffect for loading data (no change)
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfileData(prev => ({ ...prev, ...docSnap.data() }));
        } else {
          console.log("No profile document found, using initial state.");
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // handleChange function (no change)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // handleSubmit function (no change)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
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

  // handleImageUpload function (no change)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setIsUploading(true);
    const storage = getStorage();
    const storageRef = ref(storage, `profilePictures/${user.uid}/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });
      setMessage('Profile photo updated!');
    } catch (error) {
      console.error("Error uploading image: ", error);
      setMessage('Failed to upload image.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* --- 1. MODIFIED: The layout is now a single, centered column --- */}
      <div className="max-w-3xl mx-auto space-y-8">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
        
        {/* --- Top Card: Profile --- */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            {/* Circular Profile Picture */}
            <div className="relative w-32 h-32 mx-auto">
              {profileData.photoURL ? (
                <img 
                  src={profileData.photoURL} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center border-4 border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <label 
              htmlFor="photoInput" 
              className="mt-4 inline-block text-sm font-semibold text-green-600 hover:text-green-700 cursor-pointer"
            >
              Change Photo
            </label>
            <input 
              type="file" 
              id="photoInput" 
              className="hidden" 
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
            />
            
            <h2 className="text-2xl font-bold mt-4">{profileData.name || 'Your Name'}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* --- Bottom Card: Details Form --- */}
        <div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Profile Details</h1>
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
      </div>
    </div>
  );
};

export default ProfilePage;