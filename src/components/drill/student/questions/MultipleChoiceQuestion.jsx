import React from 'react';

const MultipleChoiceQuestion = ({ question, onAnswer, currentAnswer, answerStatus, wrongAnswers = [] }) => {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
        {question.choices.map((choice, index) => {
          const isSelected = currentAnswer === index;
          const isWrong = wrongAnswers?.includes(index);
          const isCorrect = answerStatus === 'correct' && isSelected;
          
          let buttonClass = 'p-6 rounded-2xl text-center transition-all transform hover:scale-105 ';
          if (isCorrect) {
            buttonClass += 'bg-green-500 text-white shadow-lg scale-105';
          } else if (isWrong) {
            buttonClass += 'bg-red-500 text-white shadow-lg scale-105';
          } else {
            buttonClass += 'bg-white text-gray-800 shadow-md hover:shadow-lg';
          }

          let mediaElement = null;
          if (choice.image) {
            mediaElement = (
              <img 
                src={choice.image.startsWith('http') ? choice.image : `http://127.0.0.1:8000${choice.image}`} 
                alt={choice.text || `Option ${index + 1}`}
                className="w-full h-32 object-contain mb-2 rounded-lg"
              />
            );
          } else if (choice.video) {
            mediaElement = (
              <video 
                src={choice.video.startsWith('http') ? choice.video : `http://127.0.0.1:8000${choice.video}`}
                className="w-full h-32 object-contain mb-2 rounded-lg"
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
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mr-4 ${
                  isSelected ? 'bg-white text-[#8e44ad]' : 'bg-[#f1f2f6] text-[#8e44ad]'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">
                  {mediaElement}
                  {choice.text && <div className="text-lg font-medium">{choice.text}</div>}
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
