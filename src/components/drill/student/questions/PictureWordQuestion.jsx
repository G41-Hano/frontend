import React, { useState, useEffect } from 'react';
import AnswerFeedback from '../AnswerFeedback';

const PictureWordQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);
  const [answer, setAnswer] = useState(currentAnswer || '');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setAnswer(currentAnswer || '');
  }, [currentAnswer]);

  const handleSubmit = () => {
    const correctAnswer = question.answer?.toLowerCase().trim() || '';
    const userAnswer = answer.toLowerCase().trim();
    const isAnswerCorrect = userAnswer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    
    // Show feedback popup
    setAnswerStatus(isAnswerCorrect ? 'correct' : 'incorrect');
    
    // Hide feedback after fade animation completes (2 seconds total: 1.5s display + 0.5s fade)
    setTimeout(() => {
      setAnswerStatus(null);
    }, 2000);
    
    // Always call onAnswer with the result, whether correct or incorrect
    onAnswer(answer, isAnswerCorrect);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className={`grid gap-3 sm:gap-4 ${isSmallScreen ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {(question.pictureWord || []).map((pic, index) => (
          <div key={pic.id} className="border rounded-lg p-2 sm:p-4 bg-white">
            {pic.media && pic.media.url && (
              <img
                src={pic.media.url.startsWith('http') ? pic.media.url : `http://127.0.0.1:8000${pic.media.url}`}
                alt={`Picture ${index + 1}`}
                className={`w-full object-cover rounded border ${isSmallScreen ? 'h-32' : 'h-48'}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          className={`w-full max-w-md border-2 border-gray-200 rounded-xl focus:border-[#4C53B4] ${isSmallScreen ? 'px-3 py-2 text-sm' : 'px-4 py-2'}`}
        />
        <div className={`flex gap-2 ${isSmallScreen ? 'flex-col w-full' : ''}`}>
          <button
            onClick={() => setShowHint(!showHint)}
            className={`text-gray-600 hover:text-gray-800 transition ${isSmallScreen ? 'px-4 py-2 bg-gray-100 rounded-lg w-full' : 'px-4 py-2'}`}
          >
            <i className="fa-solid fa-lightbulb"></i> Hint
          </button>
          <button
            onClick={handleSubmit}
            className={`bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095] transition ${isSmallScreen ? 'px-4 py-2 w-full' : 'px-6 py-2'}`}
          >
            Submit
          </button>
        </div>
        {showHint && (
          <div className={`text-gray-600 ${isSmallScreen ? 'text-xs' : 'text-sm'}`}>
            <i className="fa-solid fa-lightbulb mr-2"></i>
            Look at the pictures carefully and try to find a common word that connects them all.
          </div>
        )}
      </div>
      {answerStatus && <AnswerFeedback status={answerStatus} />}
    </div>
  );
};

export default PictureWordQuestion;
