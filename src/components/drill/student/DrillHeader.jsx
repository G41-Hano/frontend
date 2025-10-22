import React from 'react';

const DrillHeader = ({ onBack, progress, points }) => {
  return (
    <div className="w-full flex items-center px-8 pt-6 mb-2 gap-6">
      {/* Back button */}
      <button
        className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
        onClick={onBack}
        aria-label="Exit drill"
        title="Return to Classroom"
        style={{ minWidth: 48, minHeight: 48 }}
      >
        <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
      </button>
      
      {/* Progress bar */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Points */}
      <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
        Points: {points}
      </div>
    </div>
  );
};

export default DrillHeader;
