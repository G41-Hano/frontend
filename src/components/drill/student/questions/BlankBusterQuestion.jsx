import React, { useState, useEffect, useCallback, useReducer } from 'react';

const BlankBusterQuestion = ({ question, onAnswer, currentAnswer, answerStatus }) => {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeQuestion = question || {};
  const letterChoices = Array.isArray(safeQuestion.letterChoices) && safeQuestion.letterChoices.length > 0
    ? safeQuestion.letterChoices
    : (Array.isArray(safeQuestion.choices) ? safeQuestion.choices.map(c => c.text) : []);
  const pattern = (safeQuestion.pattern || '').toString().split(' ');
  const blanksCount = pattern.filter(p => p === '_').length;

  const getInitialSelectedIndexes = useCallback(() =>
    Array.isArray(currentAnswer) && currentAnswer.length === blanksCount
      ? currentAnswer
      : Array(blanksCount).fill(undefined)
  , [currentAnswer, blanksCount]);

  const reducer = useCallback((state, action) => {
    switch (action.type) {
      case 'RESET':
        return action.payload;
      case 'SET_INDEX': {
        const newState = [...state];
        newState[action.blankIdx] = action.choiceIdx;
        return newState;
      }
      case 'REMOVE_INDEX': {
        const newState = [...state];
        newState[action.blankIdx] = undefined;
        return newState;
      }
      case 'CLEAR_ALL':
        return Array(blanksCount).fill(undefined);
      default:
        return state;
    }
  }, [blanksCount]);

  const [selectedIndexes, dispatch] = useReducer(reducer, getInitialSelectedIndexes());
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  // Reset check state if user changes answer
  useEffect(() => {
    setChecked(false);
    setIsCorrect(null);
  }, [selectedIndexes]);

  const getLetterCount = useCallback((idx) =>
    selectedIndexes.filter(i => i === idx).length,
    [selectedIndexes]
  );

  const getMaxCount = useCallback((idx) => {
    // Count how many times this specific letter choice can be used
    const letter = letterChoices[idx];
    const correctAnswer = (safeQuestion.answer || '').toUpperCase();
    
    // Count how many times this letter appears in the correct answer
    const letterCountInAnswer = correctAnswer.split('').filter(char => char === letter).length;
    
    // Count how many times this letter appears in the letterChoices array
    const letterCountInChoices = letterChoices.filter(l => l === letter).length;
    
    // For letters in the answer: use the minimum of what's needed and what's available
    // For letters not in the answer: allow 1 use (for wrong attempts)
    if (letterCountInAnswer > 0) {
      return Math.min(letterCountInAnswer, letterCountInChoices);
    } else {
      return 1; // Allow one wrong attempt
    }
  }, [letterChoices, safeQuestion.answer]);

  // Helper: Build user answer and check correctness
  const buildUserAnswer = () => {
    let userAnswerArr = [];
    let blankIdx = 0;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === '_') {
        const selectedIdx = selectedIndexes[blankIdx];
        userAnswerArr.push(selectedIdx !== undefined ? letterChoices[selectedIdx] : '');
        blankIdx++;
      } else {
        userAnswerArr.push(pattern[i]);
      }
    }
    return userAnswerArr.join('').replace(/ /g, '');
  };

  // Choices: fill first empty blank, but allow selecting same letter multiple times
  const handleLetterChoiceClick = (choiceIdx) => {
    if (answerStatus === 'correct') return;
    
    const letter = letterChoices[choiceIdx];
    const correctAnswer = (safeQuestion.answer || '').toUpperCase();
    
    // Count total usage of this letter across all instances
    const totalUsageOfLetter = selectedIndexes
      .filter(selIdx => selIdx !== undefined && letterChoices[selIdx] === letter)
      .length;
    
    // Count how many times this letter appears in the correct answer
    const letterCountInAnswer = correctAnswer.split('').filter(char => char === letter).length;
    
    // Check if this letter can still be used
    let canUse;
    if (letterCountInAnswer > 0) {
      // For letters in the answer: can use if total usage < what's needed
      canUse = totalUsageOfLetter < letterCountInAnswer;
    } else {
      // For letters not in the answer: can use if total usage < 1
      canUse = totalUsageOfLetter < 1;
    }
    
    if (!canUse) return; // Can't use this letter anymore
    
    const firstEmpty = selectedIndexes.findIndex(idx => idx === undefined);
    if (firstEmpty === -1) return;
    dispatch({ type: 'SET_INDEX', blankIdx: firstEmpty, choiceIdx });
  };

  // Remove letter from blank by clicking the blank
  const handleBlankClick = (blankIdx) => {
    if (answerStatus === 'correct') return;
    if (selectedIndexes[blankIdx] !== undefined) {
      dispatch({ type: 'REMOVE_INDEX', blankIdx });
    }
  };

  // Check answer logic
  const checkAnswer = () => {
    if (!selectedIndexes.every(idx => idx !== undefined)) return;
    const userAnswer = buildUserAnswer();
    const correct = userAnswer.toUpperCase() === (safeQuestion.answer || '').toUpperCase();
    setChecked(true);
    setIsCorrect(correct);
    onAnswer(userAnswer, correct); // Pass the built string, not the array
    if (!correct) {
      setIsShaking(true);
      setTimeout(() => {
        dispatch({ type: 'CLEAR_ALL' });
        setIsShaking(false);
        setChecked(false);
      }, 1000);
    }
  };

  let blankCounter = 0;
  const display = pattern.map((char, idx) => {
    if (char !== '_') {
      return (
        <div key={idx} className={`flex items-center justify-center rounded bg-[#4C53B4] text-white font-bold ${isSmallScreen ? 'w-10 h-10 text-lg mx-1' : 'w-14 h-14 text-2xl mx-2'}`}>{char}</div>
      );
    } else {
      const thisBlankIdx = blankCounter;
      const selectedIdx = selectedIndexes[thisBlankIdx];
      const box = (
        <div
          key={idx}
          className={`flex items-center justify-center rounded bg-[#EEF1F5] text-[#4C53B4] font-bold border-2 relative cursor-pointer 
            ${isSmallScreen ? 'w-10 h-10 text-lg mx-1' : 'w-14 h-14 text-2xl mx-2'}
            ${isShaking ? 'animate-shake' : ''}
            ${checked 
              ? isCorrect 
                ? 'border-green-500' 
                : 'border-red-500' 
              : 'border-[#4C53B4]/30'
            }`}
          onClick={() => handleBlankClick(thisBlankIdx)}
        >
          {selectedIdx !== undefined ? letterChoices[selectedIdx] : ''}
        </div>
      );
      blankCounter++;
      return box;
    }
  });

  // Show all choices, but disable those that can't be used anymore
  const availableChoices = letterChoices.map((letter, idx) => {
    // Count total usage of this letter across all instances
    const totalUsageOfLetter = selectedIndexes
      .filter(selIdx => selIdx !== undefined && letterChoices[selIdx] === letter)
      .length;
    
    // Count how many times this letter appears in choices
    const letterCountInChoices = letterChoices.filter(l => l === letter).length;
    
    // Count how many times this letter appears in the correct answer
    const correctAnswer = (safeQuestion.answer || '').toUpperCase();
    const letterCountInAnswer = correctAnswer.split('').filter(char => char === letter).length;
    
    // Determine if this specific choice can still be used
    let canUse;
    if (letterCountInAnswer > 0) {
      // For letters in the answer: can use if total usage < what's needed
      canUse = totalUsageOfLetter < letterCountInAnswer;
    } else {
      // For letters not in the answer: can use if total usage < 1
      canUse = totalUsageOfLetter < 1;
    }
    
    return {
      letter,
      idx,
      canUse
    };
  });

  return (
    <div className="animate-fadeIn">
      <div className={`flex justify-center flex-wrap ${isSmallScreen ? 'gap-1 mb-4' : 'gap-2 mb-8'}`}>{display}</div>
      <div className={`flex flex-wrap justify-center ${isSmallScreen ? 'gap-2 mb-4' : 'gap-4 mb-6'}`}>
        {availableChoices.map(({ letter, idx, canUse }) => (
          <button
            key={`${letter}-${idx}`}
            className={`flex items-center justify-center rounded bg-white border-2 border-[#4C53B4] text-[#4C53B4] font-bold cursor-pointer hover:bg-[#EEF1F5] transition ${!canUse || answerStatus === 'correct' ? 'opacity-50 cursor-not-allowed' : ''} ${isSmallScreen ? 'w-10 h-10 text-lg' : 'w-14 h-14 text-2xl'}`}
            onClick={() => canUse && answerStatus !== 'correct' && handleLetterChoiceClick(idx)}
            disabled={!canUse || answerStatus === 'correct'}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="flex justify-center mb-4">
        <button
          className={`rounded-xl font-bold text-white transition ${selectedIndexes.every(idx => idx !== undefined) ? 'bg-[#4C53B4] hover:bg-[#3a4095]' : 'bg-gray-300 cursor-not-allowed'} ${isSmallScreen ? 'px-6 py-2 text-sm' : 'px-8 py-3 text-xl'}`}
          onClick={checkAnswer}
          disabled={!selectedIndexes.every(idx => idx !== undefined) || answerStatus === 'correct'}
        >
          Check
        </button>
      </div>
      {safeQuestion.hint && (
        <div className="text-lg text-gray-700 text-center mb-2">
          <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
          {safeQuestion.hint.replace(/^Hint: /i, '')}
        </div>
      )}
    </div>
  );
};

export default BlankBusterQuestion;
