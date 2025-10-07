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
            onAnswer={answer => answerStatus !== 'correct' && onAnswer(answer, false)}
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
