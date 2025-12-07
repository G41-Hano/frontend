import React from 'react';

const DrillHeader = ({ onBack, progress, points, drillTitle, wordlistName }) => {
  return (
    <>
      {/* Top Row: Back Button, Drill Title/Wordlist, Points */}
      <div className="w-full flex items-center justify-between px-8 pt-4 pb-2 gap-6">
        {/* Back button */}
        <button
          type="button"
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center flex-shrink-0"
          onClick={onBack}
          aria-label="Exit drill"
          title="Return to Classroom"
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
        </button>
        
        {/* Drill Title and Wordlist Name - Center */}
        <div className="flex-1 text-center">
          {drillTitle && (
            <h1 className="text-2xl font-bold text-[#4C53B4] mb-1">
              {drillTitle}
            </h1>
          )}
          {wordlistName && (
            <p className="text-sm text-gray-600 font-medium">
              <i className="fa-solid fa-book mr-2"></i>
              {wordlistName}
            </p>
          )}
        </div>
        
        {/* Points */}
        <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right flex-shrink-0">
          Points: {points}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full flex items-center px-8 pb-2 gap-6">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DrillHeader;
