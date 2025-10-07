import React, { useState, useEffect } from 'react';
import DrillHeader from './DrillHeader';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import MemoryGameQuestion from './questions/MemoryGameQuestion';
import PictureWordQuestion from './questions/PictureWordQuestion';
import BlankBusterQuestion from './questions/BlankBusterQuestion';
import SentenceBuilderQuestion from './questions/SentenceBuilderQuestion';
import HippoCurious from '../../../assets/MascotHippoCurious.gif';
import HippoHappy from '../../../assets/MascotHippoHappy.gif';
import HippoSad from '../../../assets/MascotHippoSad.gif';

const QuestionRenderer = ({
  drillBg,
  currentQuestion,
  progress,
  points,
  answerStatus,
  currentAnswer,
  wrongAnswers,
  isTeacherPreview,
  showTimer,
  timeSpent,
  currentWordIdx,
  currentQuestionIdx,
  onBack,
  onAnswer,
  onNext
}) => {
  const totalPoints = Object.values(points).reduce((a, b) => a + (b || 0), 0);
  const [showSadTemporarily, setShowSadTemporarily] = useState(false);

  // Handle temporary sad animation when answer is wrong
  useEffect(() => {
    if (answerStatus === 'wrong' && 
        ((currentQuestion.type === 'D' && currentAnswer?.every(a => a !== null)) ||
         currentQuestion.type !== 'D')) {
      setShowSadTemporarily(true);
      // Return to curious after 2 seconds
      const timer = setTimeout(() => {
        setShowSadTemporarily(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (answerStatus === 'correct' || answerStatus === null) {
      // Reset sad state when correct or new question
      setShowSadTemporarily(false);
    }
  }, [answerStatus, currentAnswer, currentQuestion.type]);

  // Reset sad state when question changes
  useEffect(() => {
    setShowSadTemporarily(false);
  }, [currentQuestion.id]);

  // Determine mascot based on answer status
  let mascot = HippoCurious;
  if (answerStatus === 'correct') mascot = HippoHappy;
  if (showSadTemporarily) mascot = HippoSad;

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'M':
        return (
          <MultipleChoiceQuestion 
            question={currentQuestion} 
            onAnswer={answer => answerStatus !== 'correct' && onAnswer(answer, false)}
            currentAnswer={currentAnswer}
            answerStatus={answerStatus}
            wrongAnswers={wrongAnswers}
          />
        );
      case 'F':
        return (
          <BlankBusterQuestion 
            question={currentQuestion} 
            onAnswer={(answer, correct) => {
              onAnswer(answer, correct);
            }}
            currentAnswer={currentAnswer}
            answerStatus={answerStatus}
          />
        );
      case 'D':
        return (
          <SentenceBuilderQuestion 
            question={currentQuestion} 
            onAnswer={(answer, isCorrect) => answerStatus !== 'correct' && onAnswer(answer, isCorrect)}
            currentAnswer={currentAnswer}
          />
        );
      case 'G':
        return (
          <MemoryGameQuestion
            question={currentQuestion}
            onAnswer={(answer, attempts) => answerStatus !== 'correct' && onAnswer(answer, attempts)}
            currentAnswer={currentAnswer}
          />
        );
      case 'P':
        return (
          <PictureWordQuestion
            question={currentQuestion}
            onAnswer={answer => answerStatus !== 'correct' && onAnswer(answer, false)}
            currentAnswer={currentAnswer}
          />
        );
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
      {/* Header - Reduced bottom margin */}
      <DrillHeader 
        onBack={onBack}
        progress={progress}
        points={totalPoints}
      />

      {/* Main content - Reduced top margin */}
      <div className="w-full flex flex-col items-center justify-start mt-2">
        {/* Mascot and Speech Bubble Container */}
        <div className="w-full max-w-6xl px-10">
          <div className="flex items-center gap-8">
            {/* Mascot */}
            <div className="w-64 flex-shrink-0 ml-10">
              <img 
                src={mascot} 
                alt="Hippo" 
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Speech Bubble */}
            <div className="relative bg-white rounded-3xl p-6 shadow-lg" style={{ width: '600px' }}>
              <div className="text-xl font-semibold">{currentQuestion.text}</div>
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
          
          {/* Timer Display */}
          {showTimer && currentQuestion && (
            <div className="flex justify-center mt-4">
              {(() => {
                const key = `${currentWordIdx}_${currentQuestionIdx}`;
                const timeUsed = timeSpent[key] || 0;
                const minutes = Math.floor(timeUsed / 60);
                const seconds = timeUsed % 60;
                const timeString = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
                
                // Determine timer color based on time and question type
                const isMemoryGame = currentQuestion.type === 'G';
                const penaltyThreshold = isMemoryGame ? 10 : 5; // Memory games have 10s threshold, others 5s
                
                let timerColor = 'from-blue-500 to-purple-600'; // Default blue
                let timerText = isMemoryGame ? 'Memory Game' : 'Question';
                
                if (timeUsed >= penaltyThreshold) {
                  timerColor = 'from-yellow-500 to-orange-500'; // Warning yellow
                  timerText = isMemoryGame ? 'Memory Game (Time Penalty)' : 'Question (Time Penalty)';
                }
                
                if (timeUsed >= penaltyThreshold * 2) {
                  timerColor = 'from-red-500 to-pink-500'; // Danger red
                  timerText = isMemoryGame ? 'Memory Game (High Penalty)' : 'Question (High Penalty)';
                }
                
                return (
                  <div className={`bg-gradient-to-r ${timerColor} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 transition-all duration-300`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-lg">{timeString}</span>
                    <div className="text-sm opacity-90">{timerText}</div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Question Choices */}
        <div className="w-full px-8 mt-8">
          <div className="max-w-4xl mx-auto">
            {renderQuestion()}
          </div>
        </div>
      </div>
      
      {/* Next button - Show for teacher preview or when student has correct answer */}
      {(isTeacherPreview || answerStatus === 'correct') && (
        <button
          className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg transition-all hover:scale-105"
          onClick={onNext}
        >
          Next
        </button>
      )}
    </div>
  );
};

export default QuestionRenderer;
