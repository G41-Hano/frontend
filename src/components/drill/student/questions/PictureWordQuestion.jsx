import React, { useState, useEffect } from 'react';

const PictureWordQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [answer, setAnswer] = useState(currentAnswer || '');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);

  useEffect(() => {
    setAnswer(currentAnswer || '');
  }, [currentAnswer]);

  const handleSubmit = () => {
    const correctAnswer = question.answer?.toLowerCase().trim() || '';
    const userAnswer = answer.toLowerCase().trim();
    const isAnswerCorrect = userAnswer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    
    // Handle "Try again!" message timing
    if (!isAnswerCorrect) {
      setShowTryAgain(true);
      // Hide "Try again!" after 2 seconds
      setTimeout(() => {
        setShowTryAgain(false);
      }, 2000);
    } else {
      setShowTryAgain(false);
    }
    
    // Always call onAnswer with the result, whether correct or incorrect
    onAnswer(answer, isAnswerCorrect);
  };

  return (
    <div className="space-y-6">
      {isCorrect === true && (
        <div className="text-center text-2xl font-bold mb-4 text-green-600">
          Correct!
        </div>
      )}
      {showTryAgain && (
        <div className="text-center text-2xl font-bold mb-4 text-red-600">
          Try again!
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {(question.pictureWord || []).map((pic, index) => (
          <div key={pic.id} className="border rounded-lg p-4 bg-white">
            {pic.media && pic.media.url && (
              <img
                src={pic.media.url.startsWith('http') ? pic.media.url : `http://127.0.0.1:8000${pic.media.url}`}
                alt={`Picture ${index + 1}`}
                className="w-full h-48 object-cover rounded border"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer"
          className="w-full max-w-md border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-[#4C53B4]"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <i className="fa-solid fa-lightbulb"></i> Hint
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095]"
          >
            Submit
          </button>
        </div>
        {showHint && (
          <div className="text-sm text-gray-600">
            <i className="fa-solid fa-lightbulb mr-2"></i>
            Look at the pictures carefully and try to find a common word that connects them all.
          </div>
        )}
      </div>
    </div>
  );
};

export default PictureWordQuestion;
