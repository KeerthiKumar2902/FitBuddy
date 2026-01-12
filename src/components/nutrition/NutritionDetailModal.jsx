// src/components/wellness/NutritionDetailModal.jsx

import React from 'react';

// A helper to find a specific nutrient from the large array
const getNutrient = (nutrients, name) => {
  const nutrient = nutrients.find(n => n.name === name);
  return nutrient ? `${nutrient.amount}${nutrient.unit}` : 'N/A';
};

const NutritionDetailModal = ({ item, onClose }) => {
  const { name, image, possibleUnits, nutrition } = item;
  const nutrients = nutrition?.nutrients || [];

  // We'll display these key nutrients
  const keyNutrients = [
    { label: 'Calories', value: getNutrient(nutrients, 'Calories') },
    { label: 'Protein', value: getNutrient(nutrients, 'Protein') },
    { label: 'Fat', value: getNutrient(nutrients, 'Fat') },
    { label: 'Carbohydrates', value: getNutrient(nutrients, 'Carbohydrates') },
    { label: 'Vitamin C', value: getNutrient(nutrients, 'Vitamin C') },
    { label: 'Iron', value: getNutrient(nutrients, 'Iron') },
    { label: 'Potassium', value: getNutrient(nutrients, 'Potassium') },
    { label: 'Fiber', value: getNutrient(nutrients, 'Fiber') },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">{name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <img 
            src={`https://spoonacular.com/cdn/ingredients_500x500/${image}`} 
            alt={name} 
            className="w-full h-64 object-contain rounded-lg mb-4"
          />
          <p className="text-gray-600 mb-4">
            Nutritional information is based on a standard serving of <strong>100g</strong>.
          </p>
          
          {/* Nutrition Table */}
          <div className="space-y-2">
            {keyNutrients.map(n => (
              <div key={n.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">{n.label}</span>
                <span className="font-bold text-gray-900">{n.value}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Common units: {possibleUnits.join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutritionDetailModal;