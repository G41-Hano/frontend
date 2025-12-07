import React from 'react';

const DrillHeader = ({ onBack, progress, points, drillTitle, wordlistName }) => {
  const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Single Row Header */}
      <div className={`w-full flex items-center justify-between ${isSmallScreen ? 'px-4 py-2 gap-2' : 'px-8 py-4 gap-6'}`}>
        {/* Back button */}
        <button
          type="button"
          className={`bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center flex-shrink-0 ${isSmallScreen ? 'p-2' : 'p-3'}`}
          onClick={onBack}
          aria-label="Exit drill"
          title="Return to Classroom"
          style={{ minWidth: isSmallScreen ? 40 : 48, minHeight: isSmallScreen ? 40 : 48 }}
        >
          <i className={`fa-solid fa-arrow-left text-[#8e44ad] ${isSmallScreen ? 'text-base' : 'text-lg'}`}></i>
        </button>
        
        {/* Drill Title - Center */}
        <div className="flex-1 text-center min-w-0">
          {drillTitle && (
            <h1 className={`font-bold text-[#4C53B4] truncate ${isSmallScreen ? 'text-sm' : 'text-xl'}`}>
              {drillTitle}
            </h1>
          )}
        </div>
        
        {/* Points */}
        <div className={`font-bold text-[#4C53B4] text-right flex-shrink-0 ${isSmallScreen ? 'text-xs min-w-[70px]' : 'text-lg min-w-[120px]'}`}>
          Points: {points}
        </div>
      </div>
      
      {/* Progress bar - Single row */}
      <div className={`w-full flex items-center ${isSmallScreen ? 'px-4 pb-2' : 'px-8 pb-3'}`}>
        <div className="flex-1 flex justify-center">
          <div className={`w-full max-w-[900px] bg-gray-200 rounded-full overflow-hidden ${isSmallScreen ? 'h-2' : 'h-4'}`}>
            <div 
              className={`bg-[#f39c12] rounded-full transition-all duration-500 ${isSmallScreen ? 'h-2' : 'h-4'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DrillHeader;
