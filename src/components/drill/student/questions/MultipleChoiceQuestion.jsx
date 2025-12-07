import React, { useState, useEffect } from 'react';

const MultipleChoiceQuestion = ({ question, onAnswer, currentAnswer, answerStatus, wrongAnswers = [] }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className={`grid gap-4 sm:gap-6 mx-auto ${isSmallScreen ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {question.choices.map((choice, index) => {
          const isSelected = currentAnswer === index;
          const isWrong = wrongAnswers?.includes(index);
          const isCorrect = answerStatus === 'correct' && isSelected;
          
          let buttonClass = `rounded-2xl text-center transition-all transform hover:scale-105 ${isSmallScreen ? 'p-3 sm:p-6' : 'p-6'}`;
          if (isCorrect) {
            buttonClass += ' bg-green-500 text-white shadow-lg scale-105';
          } else if (isWrong) {
            buttonClass += ' bg-red-500 text-white shadow-lg scale-105';
          } else {
            buttonClass += ' bg-white text-gray-800 shadow-md hover:shadow-lg';
          }

          let mediaElement = null;
          if (choice.image) {
            mediaElement = (
              <img 
                src={choice.image.startsWith('http') ? choice.image : `http://127.0.0.1:8000${choice.image}`} 
                alt={choice.text || `Option ${index + 1}`}
                className={`w-full object-contain mb-2 rounded-lg ${isSmallScreen ? 'h-24' : 'h-32'}`}
              />
            );
          } else if (choice.video) {
            mediaElement = (
              <video 
                src={choice.video.startsWith('http') ? choice.video : `http://127.0.0.1:8000${choice.video}`}
                className={`w-full object-contain mb-2 rounded-lg ${isSmallScreen ? 'h-24' : 'h-32'}`}
                controls
              />
            );
          }

          return (
            <button
              key={index}
              className={buttonClass}
              onClick={() => !isCorrect && onAnswer(index)}
              disabled={isCorrect}
            >
              <div className={`flex ${isSmallScreen ? 'items-center gap-3' : 'items-center'}`}>
                <div className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isSmallScreen ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl mr-4'} ${
                  isSelected ? 'bg-white text-[#8e44ad]' : 'bg-[#f1f2f6] text-[#8e44ad]'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className={isSmallScreen ? 'flex-1 text-center' : 'flex-1'}>
                  {mediaElement}
                  {choice.text && <div className={`font-medium ${isSmallScreen ? 'text-sm' : 'text-lg'}`}>{choice.text}</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
