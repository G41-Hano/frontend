const Stepper = ({ step, setStep }) => (
  <div className="flex justify-center gap-4 mb-8">
    {["Overview", "Word List", "Add Questions", "Review"].map((label, i) => {
      const isClickable = i < step;
      return (
        <div
          key={label}
          className={`flex items-center gap-2 ${step === i ? 'font-bold text-[#4C53B4]' : 'text-gray-400'}`}
        >
          <button
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && setStep(i)}
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition
              ${step === i ? 'border-[#4C53B4] bg-[#EEF1F5]' : 'border-gray-300 bg-white'}
              ${isClickable ? 'cursor-pointer hover:border-[#4C53B4] hover:bg-[#EEF1F5]' : 'cursor-default'}
            `}
            style={{ outline: 'none', border: 'none', padding: 0 }}
            tabIndex={isClickable ? 0 : -1}
          >
            {i + 1}
          </button>
          <span
            className={isClickable ? 'cursor-pointer hover:text-[#4C53B4]' : ''}
            onClick={() => isClickable && setStep(i)}
          >
            {label}
          </span>
          {i < 3 && <div className="w-8 h-1 bg-gray-200 rounded-full" />}
        </div>
      );
    })}
  </div>
);

export default Stepper;