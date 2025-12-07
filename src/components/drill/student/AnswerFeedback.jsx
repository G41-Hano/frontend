import React, { useState, useEffect } from 'react';

const AnswerFeedback = ({ status }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (status) {
      // Start fade out after 1.5 seconds
      const timer = setTimeout(() => {
        setIsFading(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!status) return null;

  const isCorrect = status === 'correct';
  const bgColor = isCorrect ? 'bg-green-500' : 'bg-red-500';
  const icon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
  const text = isCorrect ? 'Correct!' : 'Incorrect!';

  return (
    <div className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`${bgColor} text-white px-12 py-8 rounded-2xl shadow-lg flex flex-col items-center gap-4 animate-bounceIn transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <i className={`fa-solid ${icon} text-5xl`}></i>
        <span className="font-semibold text-3xl">{text}</span>
      </div>
    </div>
  );
};

export default AnswerFeedback;
