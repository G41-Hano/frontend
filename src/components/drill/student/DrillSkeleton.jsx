import React from 'react';
import Skeleton from '../../Skeleton';

const DrillSkeleton = ({ drillBg, onBack }) => {
  
  return (
    <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
      {/* Header Skeleton */}
      <div className="w-full flex items-center px-8 pt-6 mb-2 gap-6">
        <button
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
          onClick={onBack}
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
        </button>
        
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="bg-[#f39c12] h-full rounded-full animate-pulse" style={{ width: '5%' }} />
          </div>
        </div>
        
        <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
          Points: 0
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="w-full flex flex-col items-center justify-start mt-2">
        {/* Mascot and Speech Bubble Container */}
        <div className="w-full max-w-6xl px-10">
          <div className="flex items-center gap-8">
            {/* Mascot Skeleton */}
            <div className="w-64 flex-shrink-0 ml-10">
              <Skeleton className="w-full h-64 rounded-2xl" />
            </div>

            {/* Speech Bubble Skeleton */}
            <div className="relative bg-white rounded-3xl p-6 shadow-lg" style={{ width: '600px' }}>
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-5/6" />
              </div>
              {/* Arrow */}
              <div 
                className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-0 h-0"
                style={{
                  borderTop: '16px solid transparent',
                  borderBottom: '16px solid transparent',
                  borderRight: '16px solid white'
                }}
              />
            </div>
          </div>
        </div>

        {/* Question Area Skeleton */}
        <div className="w-full px-8 mt-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <Skeleton className="w-10 h-10 rounded-full mr-4" />
                    <div className="flex-1">
                      <Skeleton className="h-32 w-full rounded-lg mb-2" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="fixed bottom-1/4 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-white/90 rounded-xl px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8e44ad]"></div>
            <span className="text-lg font-semibold text-[#8e44ad]">Loading your drill...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrillSkeleton;
