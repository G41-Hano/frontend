const Stepper = ({ step, setStep }) => {
  const steps = [
    { label: "Overview", shortLabel: "Info" },
    { label: "Word List", shortLabel: "Words" },
    { label: "Add Questions", shortLabel: "Questions" },
    { label: "Review", shortLabel: "Review" }
  ];

  return (
    <div className="mb-8">
      {/* Desktop/Tablet Horizontal Layout */}
      <div className="hidden sm:flex justify-center items-center gap-2 md:gap-4">
        {steps.map((stepItem, i) => {
          const isClickable = i < step;
          const isActive = step === i;
          
          return (
            <div key={stepItem.label} className="flex items-center">
              <div className={`flex items-center gap-2 ${isActive ? 'font-bold text-[#4C53B4]' : 'text-gray-400'}`}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setStep(i)}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition text-sm md:text-base
                    ${isActive ? 'border-[#4C53B4] bg-[#EEF1F5] text-[#4C53B4]' : 'border-gray-300 bg-white text-gray-600'}
                    ${isClickable ? 'cursor-pointer hover:border-[#4C53B4] hover:bg-[#EEF1F5] hover:text-[#4C53B4]' : 'cursor-default'}
                  `}
                >
                  {i + 1}
                </button>
                <span
                  className={`text-sm md:text-base whitespace-nowrap ${isClickable ? 'cursor-pointer hover:text-[#4C53B4]' : ''}`}
                  onClick={() => isClickable && setStep(i)}
                >
                  <span className="hidden md:inline">{stepItem.label}</span>
                  <span className="md:hidden">{stepItem.shortLabel}</span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-4 md:w-8 h-1 bg-gray-200 rounded-full mx-2 md:mx-4" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Layout */}
      <div className="sm:hidden">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step + 1} of {steps.length}
            </span>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="flex items-center gap-1">
            {steps.map((stepItem, i) => {
              const isClickable = i < step;
              const isActive = step === i;
              const isCompleted = i < step;
              
              return (
                <button
                  key={stepItem.label}
                  type="button"
                  disabled={!isClickable && !isActive}
                  onClick={() => (isClickable || isActive) && setStep(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-200
                    ${isActive ? 'bg-[#4C53B4] scale-125' : 
                      isCompleted ? 'bg-[#4C53B4]/60 hover:bg-[#4C53B4]' : 
                      'bg-gray-300'}
                    ${(isClickable || isActive) ? 'cursor-pointer' : 'cursor-default'}
                  `}
                  title={stepItem.label}
                />
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-3">
          <h3 className="text-lg font-semibold text-[#4C53B4]">
            {steps[step].label}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Stepper;