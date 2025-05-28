import { useState, useEffect, useCallback, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';
import '../../styles/animations.css';
import HippoIdle from '../../assets/HippoIdle.gif';
import HippoCurious from '../../assets/MascotHippoCurious.gif';
import HippoHappy from '../../assets/MascotHippoHappy.gif';
import HippoSad from '../../assets/MascotHippoSad.gif';
import HippoWaiting from '../../assets/MascotHippoWaiting.gif';
import { DndContext, useSensors, useSensor, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core';
import { PointerSensor } from '@dnd-kit/core';
import { Tooltip } from "react-tooltip";

// Custom Draggable component
const Draggable = ({ id, disabled, children }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled
  });
  
  return children({ attributes, listeners, setNodeRef, isDragging });
};

// Custom Droppable component
const Droppable = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id
  });
  
  return children({ isOver, setNodeRef });
};

const MultipleChoiceQuestion = ({ question, onAnswer, currentAnswer, answerStatus, wrongAnswers }) => {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto">
        {question.choices.map((choice, index) => {
          const isSelected = currentAnswer === index;
          const isWrong = wrongAnswers.includes(index);
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

const FillInBlankQuestion = ({ question, onAnswer, currentAnswer }) => {
  // For fill in the blank, split the text by underscore
  const parts = question.text.split('_');
  
  return (
    <div className="animate-fadeIn">
      <div className="text-xl mb-6 text-center">
        {parts[0]}
        <span className="inline-block min-w-[120px] border-b-2 border-[#8e44ad] mx-1 text-center font-bold text-[#8e44ad]">
          {currentAnswer !== null && question.choices[currentAnswer] ? question.choices[currentAnswer].text : '_____'}
        </span>
        {parts[1]}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            className={`p-3 rounded-lg text-center transition-all ${
              currentAnswer === index 
                ? 'bg-[#8e44ad] text-white shadow-lg scale-105 border-2 border-[#9b59b6]' 
                : 'bg-white border-2 border-gray-200 hover:border-[#9b59b6] hover:shadow-md'
            }`}
            onClick={() => onAnswer(index)}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const DragDropQuestion = ({ question, onAnswer, currentAnswers = {} }) => {
  const dragItems = question.dragItems || [];
  const dropZones = question.dropZones || [];
  
  // Function to handle when an item is dropped in a zone
  const handleDrop = (dragIndex, zoneIndex) => {
    const newAnswers = {...currentAnswers};
    newAnswers[zoneIndex] = dragIndex;
    onAnswer(newAnswers);
  };
  
  // Reset a specific mapping
  const resetMapping = (zoneIndex) => {
    const newAnswers = {...currentAnswers};
    delete newAnswers[zoneIndex];
    onAnswer(newAnswers);
  };
  
  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Drag Items */}
        <div className="md:w-1/2">
          <h3 className="text-lg font-semibold mb-3 text-[#8e44ad]">Drag Items</h3>
          <div className="space-y-2">
            {dragItems.map((item, index) => {
              // Check if this item is already used in an answer
              const isUsed = Object.values(currentAnswers).includes(index);
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg bg-white border-2 ${
                    isUsed ? 'opacity-50 border-gray-200' : 'border-[#9b59b6] cursor-grab'
                  }`}
                  draggable={!isUsed}
                  onDragStart={(e) => {
                    if (!isUsed) {
                      e.dataTransfer.setData('dragIndex', index);
                    }
                  }}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Drop Zones */}
        <div className="md:w-1/2">
          <h3 className="text-lg font-semibold mb-3 text-[#8e44ad]">Drop Zones</h3>
          <div className="space-y-3">
            {dropZones.map((zone, zoneIndex) => {
              const mappedItemIndex = currentAnswers[zoneIndex];
              const mappedItem = mappedItemIndex !== undefined ? dragItems[mappedItemIndex] : null;
              
              return (
                <div
                  key={zoneIndex}
                  className="flex flex-col gap-2"
                >
                  <div className="p-3 rounded-lg bg-[#f1f2f6] border-2 border-gray-300">
                    {zone.text}
                  </div>
                  
                  <div
                    className={`h-12 p-2 rounded-lg border-2 border-dashed ${
                      mappedItem ? 'bg-white border-[#9b59b6]' : 'bg-gray-50 border-gray-300'
                    } flex items-center justify-between`}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
                      handleDrop(dragIndex, zoneIndex);
                    }}
                  >
                    {mappedItem ? (
                      <>
                        <span>{mappedItem.text}</span>
                        <button 
                          onClick={() => resetMapping(zoneIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm">Drop item here...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memory Game Question Component
const MemoryGameQuestion = ({ question, onAnswer }) => {
  const [flipped, setFlipped] = useState([]); // array of card ids currently flipped
  const [matched, setMatched] = useState([]); // array of card ids that are matched
  const [lock, setLock] = useState(false); // prevent flipping more than 2 at a time

  // Shuffle cards on first render
  const [shuffledCards] = useState(() => {
    const cards = [...(question.memoryCards || [])];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  });

  useEffect(() => {
    if (matched.length === shuffledCards.length && shuffledCards.length > 0) {
      // All pairs matched, call onAnswer with the matched pairs
      onAnswer(matched);
    }
    // eslint-disable-next-line
  }, [matched]);

  const handleFlip = (cardId) => {
    if (lock || flipped.includes(cardId) || matched.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setLock(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = shuffledCards.find(c => c.id === firstId);
      const secondCard = shuffledCards.find(c => c.id === secondId);
      if (firstCard && secondCard && firstCard.pairId === secondCard.id) {
        // It's a match!
        setTimeout(() => {
          setMatched(prev => [...prev, firstId, secondId]);
          setFlipped([]);
          setLock(false);
        }, 700);
      } else {
        // Not a match
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 1000);
      }
    }
  };

  const renderCardContent = (card) => {
    if (card.media) {
      let src = null;
      let type = '';
      
      // Handle different media formats
      if (card.media instanceof File) {
        src = URL.createObjectURL(card.media);
        type = card.media.type;
      } else if (typeof card.media === 'string') {
        src = card.media.startsWith('http') ? card.media : `http://127.0.0.1:8000${card.media}`;
        // Try to determine type from file extension
        const ext = card.media.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          type = 'image/*';
        } 
      } else if (card.media.url) {
        src = card.media.url.startsWith('http') ? card.media.url : `http://127.0.0.1:8000${card.media.url}`;
        type = card.media.type || '';
      }

      if (type.startsWith('image/')) {
        return <img src={src} alt="card" className="w-full h-24 object-contain rounded" />;
      } 
    }
    if (card.content) {
      return <span className="text-lg font-semibold">{card.content}</span>;
    }
    return <span className="text-gray-400">No content</span>;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
        {shuffledCards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              className={`relative w-40 h-40 sm:w-44 sm:h-44 rounded-xl shadow-lg border-2 transition-all duration-300 flex items-center justify-center bg-white ${isFlipped ? 'ring-4 ring-[#8e44ad] scale-105' : 'hover:scale-105'}`}
              onClick={() => handleFlip(card.id)}
              disabled={isFlipped || lock}
              style={{ perspective: 1000 }}
            >
              <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isFlipped ? '' : 'rotate-y-180'}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {isFlipped ? (
                  renderCardContent(card)
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#8e44ad] bg-[#f1f2f6] rounded-xl">
                    <i className="fa-regular fa-circle-question"></i>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 text-center text-lg text-[#8e44ad] font-semibold">
        {matched.length === shuffledCards.length && shuffledCards.length > 0
          ? 'All pairs matched!'
          : flipped.length === 2
            ? 'Checking...'
            : 'Flip two cards to find a match.'}
      </div>
    </div>
  );
};

const PictureWordQuestion = ({ question, onAnswer, currentAnswer }) => {
  const [answer, setAnswer] = useState(currentAnswer || '');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Update answer state when currentAnswer prop changes
  useEffect(() => {
    setAnswer(currentAnswer || '');
  }, [currentAnswer]);

  const handleSubmit = () => {
    // Debug logs
    console.log('Question object:', question);
    console.log('User answer:', answer);
    
    // Get the correct answer from the question object
    const correctAnswer = question.answer?.toLowerCase().trim() || '';
    const userAnswer = answer.toLowerCase().trim();
    
    console.log('Correct answer:', correctAnswer);
    console.log('User answer (processed):', userAnswer);
    console.log('Are they equal?', correctAnswer === userAnswer);
    
    const isAnswerCorrect = userAnswer === correctAnswer;
    setIsCorrect(isAnswerCorrect);
    onAnswer(answer); // Pass the answer instead of the boolean
  };

  return (
    <div className="space-y-6">
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
          onChange={(e) => {
            const newValue = e.target.value;
            setAnswer(newValue);
            onAnswer(newValue);
          }}
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
        {isCorrect !== null && (
          <div className={`text-lg font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? 'Correct!' : 'Try again!'}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper: Group questions by word
const groupQuestionsByWord = (questions) => {
  const map = {};
  questions.forEach(q => {
    const wordKey = q.word_id || q.word; // Use word_id if available, otherwise use word as key
    if (!map[wordKey]) {
      map[wordKey] = {
        word: q.word,
        definition: q.definition,
        image: q.image,
        signVideo: q.signVideo,
        questions: []
      };
    }
    map[wordKey].questions.push(q);
  });
  
  // Convert map to array and maintain word order
  const sortedGroups = Object.entries(map)
    .sort(([keyA], [keyB]) => {
      // Get first question from each group to determine order
      const firstQuestionA = map[keyA].questions[0];
      const firstQuestionB = map[keyB].questions[0];
      return questions.indexOf(firstQuestionA) - questions.indexOf(firstQuestionB);
    })
    .map(([, group]) => {
      // Shuffle questions within each word group
      const shuffledQuestions = [...group.questions];
      for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
      }
      return { ...group, questions: shuffledQuestions };
    });
  
  return sortedGroups;
};

// Helper: Progress bar
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-6">
    <div className="bg-[#f39c12] h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
  </div>
);

// Helper: Intro bubble
const IntroBubble = ({ mascot, text, image, video }) => (
  <div className="w-full max-w-5xl mx-auto flex items-center justify-center animate-fadeIn" style={{ minHeight: 500, position: 'relative' }}>
    <div className="flex flex-col items-center justify-center mr-5">
      <img src={mascot} alt="Hippo Mascot" className="w-[34rem] h-[32rem] mb-5 mt-10" />
    </div>
    <div className="flex-1 flex flex-col items-start justify-center relative">
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '2rem',
          padding: '2rem 2.5rem',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#222',
          marginBottom: '2rem',
          maxWidth: '700px',
          minWidth: '320px',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          zIndex: 2,
          marginTop: !(image || video) ? '-20rem' : undefined,
          transition: 'margin-top 0.3s'
        }}
      >
        <span>{text}</span>
        {/* Arrow points left */}
        <div style={{
          position: 'absolute',
          left: '-16px',
          top: '70%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '18px solid transparent',
          borderBottom: '18px solid transparent',
          borderRight: '18px solid #fff',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))',
          zIndex: 1
        }}></div>
      </div>
      {(image || video) && (
        <div
          className="flex items-center justify-center bg-white rounded-2xl shadow-lg mt-2 mb-2"
          style={{
            minHeight: '18rem',
            minWidth: '18rem',
            maxWidth: '28rem',
            maxHeight: '22rem',
            width: '100%',
            alignSelf: 'center',
            padding: image && video ? '1rem 1rem 0.25rem 1rem' : '1rem'
          }}
        >
          {image && (
            <img
              src={image.startsWith('http') ? image : `http://127.0.0.1:8000${image}`}
              alt="Word"
              className="object-contain rounded-xl max-h-72 max-w-full mx-auto"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {video && (
            <video
              src={video.startsWith('http') ? video : `http://127.0.0.1:8000${video}`}
              controls
              className="rounded-xl max-h-72 max-w-full mx-auto"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </div>
      )}
    </div>
  </div>
);

const transitions = [
  "Now let's test your knowledge!",
  "Ready for a challenge?",
  "Let's see what you remember!",
  "Time to play a game!",
];

// Calculate total steps for the entire drill
const calculateTotalSteps = (wordGroups) => {
  let total = 1; // Global intro
  for (let i = 0; i < wordGroups.length; i++) {
    total += 4; // 4 steps per word (intro, definition, sign, transition)
    total += wordGroups[i].questions.length; // Add questions for this word
  }
  return total;
};

// Calculate current step number
const calculateCurrentStep = (introStep, currentWordIdx, currentQuestionIdx, wordGroups) => {
  // If we're on the congratulations page, return total steps
  if (introStep === 6) {
    return calculateTotalSteps(wordGroups);
  }
  
  if (introStep === 0) return 1; // Global intro
  
  let step = 1; // Start after global intro
  
  // Add completed words
  for (let i = 0; i < currentWordIdx; i++) {
    step += 4; // 4 intro steps per completed word
    step += wordGroups[i].questions.length; // Questions in completed words
  }
  
  // Add current word progress
  if (introStep < 5) {
    step += introStep - 1; // Subtract 1 because we want progress to show before the step is complete
  } else {
    step += 4; // All intro steps for current word are done
    step += currentQuestionIdx; // Only count completed questions
  }
  
  return step;
};

// Points calculation helper
const calculatePoints = (attempts, timeSpent) => {
  // Base points: 100
  // -20 points per wrong attempt
  // -1 point per 5 seconds spent
  const wrongAttempts = attempts || 0;
  const timePenalty = Math.floor((timeSpent || 0) / 5);
  const points = Math.max(30, 100 - (wrongAttempts * 20) - timePenalty);
  return points;
};

// --- Blank Buster (FillInBlankQuestion) ---
const BlankBusterQuestion = ({ question, onAnswer, currentAnswer, answerStatus }) => {
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

  const getMaxCount = useCallback((idx) =>
    letterChoices.filter(l => l === letterChoices[idx]).length,
    [letterChoices]
  );

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

  // Choices: only fill first empty blank
  const handleLetterChoiceClick = (choiceIdx) => {
    if (answerStatus === 'correct') return;
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
    onAnswer(selectedIndexes, correct); // Pass correctness up
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
        <div key={idx} className="w-14 h-14 flex items-center justify-center rounded bg-[#4C53B4] text-white font-bold text-2xl mx-2">{char}</div>
      );
    } else {
      const thisBlankIdx = blankCounter;
      const selectedIdx = selectedIndexes[thisBlankIdx];
      const box = (
        <div
          key={idx}
          className={`w-14 h-14 flex items-center justify-center rounded bg-[#EEF1F5] text-[#4C53B4] font-bold text-2xl mx-2 border-2 relative cursor-pointer 
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

  // Only show unused choices
  const availableChoices = [];
  letterChoices.forEach((letter, idx) => {
    const totalCount = letterChoices.filter(l => l === letter).length;
    const usedCount = selectedIndexes
      .filter(selIdx => selIdx !== undefined && letterChoices[selIdx] === letter)
      .length;
    let alreadyPushed = availableChoices.filter(c => c.letter === letter).length;
    if (usedCount + alreadyPushed < totalCount) {
      availableChoices.push({ letter, idx });
    }
  });

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-center gap-2 mb-8">{display}</div>
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        {availableChoices.map(({ letter, idx }) => (
          <button
            key={idx}
            className={`w-14 h-14 px-6 py-4 flex items-center justify-center rounded bg-white border-2 border-[#4C53B4] text-[#4C53B4] font-bold text-2xl cursor-pointer hover:bg-[#EEF1F5] transition ${getLetterCount(idx) >= getMaxCount(idx) || answerStatus === 'correct' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => getLetterCount(idx) < getMaxCount(idx) && answerStatus !== 'correct' && handleLetterChoiceClick(idx)}
            disabled={getLetterCount(idx) >= getMaxCount(idx) || answerStatus === 'correct'}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="flex justify-center mb-4">
        <button
          className={`px-8 py-3 rounded-xl text-xl font-bold text-white ${selectedIndexes.every(idx => idx !== undefined) ? 'bg-[#4C53B4] hover:bg-[#3a4095]' : 'bg-gray-300 cursor-not-allowed'}`}
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
      {checked && isCorrect === false && (
        <div className="text-center text-2xl font-bold mt-2 text-red-600">
          Try again!
        </div>
      )}
      {checked && isCorrect === true && (
        <div className="text-center text-2xl font-bold mt-2 text-green-600">
          Correct!
        </div>
      )}
    </div>
  );
};

// --- Sentence Builder (DragDropQuestion) ---
const SentenceBuilderQuestion = ({ question, onAnswer, currentAnswer }) => {
  const sentence = question.sentence || '';
  const blanksCount = (sentence.match(/_/g) || []).length;
  const [blankAnswers, setBlankAnswers] = useState(() =>
    Array.isArray(currentAnswer) && currentAnswer.length === blanksCount
      ? currentAnswer
      : Array(blanksCount).fill(null)
  );
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setBlankAnswers(
      Array.isArray(currentAnswer) && currentAnswer.length === blanksCount
        ? currentAnswer
        : Array(blanksCount).fill(null)
    );
  }, [question]);

  // Combine correct and incorrect choices, shuffle on mount
  const [choices] = useState(() => {
    const all = [...(question.dragItems || []), ...(question.incorrectChoices || [])];
    return all.sort(() => Math.random() - 0.5);
  });

  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Build the sentence display
  let blankIdx = 0;
  const parts = sentence.split('_');
  const display = [];
  for (let i = 0; i < parts.length; i++) {
    display.push(<span key={`part-${i}`} className="text-2xl">{parts[i]}</span>);
    if (i < parts.length - 1) {
      const answerIdx = blankAnswers[blankIdx];
      const currentBlankIdx = blankIdx;
      display.push(
        <Droppable key={`blank-${blankIdx}`} id={`blank-${blankIdx}`}>
          {({ isOver, setNodeRef }) => (
            <div
              ref={setNodeRef}
              onClick={() => {
                if (answerIdx !== null && !isCorrect) {
                  const newAnswers = [...blankAnswers];
                  newAnswers[currentBlankIdx] = null;
                  setBlankAnswers(newAnswers);
                  onAnswer(newAnswers, false);
                  setShowTryAgain(false);
                  setIsIncorrect(false);
                }
              }}
              className={`inline-flex items-center justify-center min-w-[150px] h-12 mx-2 align-middle cursor-pointer relative text-xl
                ${answerIdx !== null 
                  ? 'bg-white border-2' 
                  : 'bg-[#EEF1F5] border-2 border-dashed border-[#4C53B4]/30'} 
                ${isIncorrect && answerIdx !== null ? 'border-red-500 animate-shake' : ''}
                ${isCorrect && answerIdx !== null ? 'border-green-500' : ''}
                ${isOver ? 'border-[#4C53B4] bg-[#EEF1F5] scale-105' : ''}
                rounded-lg transition-all duration-200`}
            >
              {answerIdx !== null ? choices[answerIdx]?.text : ''}
            </div>
          )}
        </Droppable>
      );
      blankIdx++;
    }
  }

  // Check if all blanks are filled
  const isComplete = blankAnswers.every(idx => idx !== null);

  // Auto-check answer when all blanks are filled
  useEffect(() => {
    if (isComplete && !isCorrect) {
      // Get correct answers from dragItems array
      const correctAnswers = question.dragItems.map(item => item.text.toLowerCase().trim());
      const currentAnswers = blankAnswers.map(idx => choices[idx]?.text.toLowerCase().trim());
      
      const isAllCorrect = currentAnswers.every((answer, index) => answer === correctAnswers[index]);
      
      if (isAllCorrect) {
        setIsCorrect(true);
        setIsIncorrect(false);
        setShowTryAgain(false);
        onAnswer(blankAnswers, true);
      } else {
        setIsIncorrect(true);
        setShowTryAgain(true);
        onAnswer(blankAnswers, false);
        // Clear answers 
        setTimeout(() => {
          setBlankAnswers(Array(blanksCount).fill(null));
          setIsIncorrect(false);
          setShowTryAgain(false);
        }, 2000); //2 seconds
      }
    } else if (!isComplete) {
      // If sentence is not complete, don't show any error state
      onAnswer(blankAnswers, false);
    }
  }, [isComplete, blankAnswers]);

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    // Reset error states when starting a new drag
    setIsIncorrect(false);
    setShowTryAgain(false);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over || isCorrect) return;

    const draggedItemIndex = parseInt(active.id.split('-')[1]);
    const targetBlankIndex = parseInt(over.id.split('-')[1]);

    // Update answers
    const newAnswers = [...blankAnswers];
    newAnswers[targetBlankIndex] = draggedItemIndex;
    setBlankAnswers(newAnswers);
    onAnswer(newAnswers, false);
  };

  // Choices not yet used
  const used = new Set(blankAnswers.filter(idx => idx !== null));

  // Render draggable item
  const renderDraggableItem = (choice, idx, isDragging = false) => (
    <div
      className={`px-6 py-3 rounded-lg text-lg font-medium bg-white border-2 border-[#4C53B4] text-[#4C53B4] 
        ${used.has(idx) ? 'opacity-50' : 'cursor-grab hover:bg-[#EEF1F5] transition'}
        ${isDragging ? 'opacity-90 scale-110 shadow-2xl' : ''}
        transition-all duration-200`}
    >
      {choice.text}
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="animate-fadeIn">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 text-2xl">
          {display}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {choices.map((choice, idx) => (
            <Draggable key={`choice-${idx}`} id={`choice-${idx}`} disabled={used.has(idx)}>
              {({ attributes, listeners, setNodeRef, isDragging }) => (
                <div
                  ref={setNodeRef}
                  {...attributes}
                  {...listeners}
                  className={`${isDragging ? 'opacity-30' : ''}`}
                >
                  {renderDraggableItem(choice, idx)}
                </div>
              )}
            </Draggable>
          ))}
        </div>
        <DragOverlay>
          {activeId !== null && renderDraggableItem(choices[parseInt(activeId.split('-')[1])], parseInt(activeId.split('-')[1]), true)}
        </DragOverlay>
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-500 text-center">
            <i className="fa-solid fa-info-circle mr-1"></i>
            Drag words to fill blanks. Click a filled blank to remove its answer.
          </div>
          {showTryAgain && (
            <div className="text-2xl font-bold text-red-500 animate-fadeIn">
              Try again!
            </div>
          )}
          {isCorrect && (
            <div className="text-3xl font-bold text-emerald-500 animate-fadeIn">
              Correct!
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};

// Simple modal for user details
const UserModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-xl min-w-[320px] relative animate-scaleIn">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#e09b1a]">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#4C53B4] font-bold text-3xl flex items-center justify-center h-full">{user.name?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>
          <div className="text-2xl font-bold text-[#4C53B4]">{user.name}</div>
          <div className="text-lg text-gray-700">Points: <span className="font-bold text-[#e09b1a]">{user.points}</span></div>
        </div>
      </div>
    </div>
  );
};

const TakeDrill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [introStep, setIntroStep] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [attempts, setAttempts] = useState({});
  const [timeSpent, setTimeSpent] = useState({});
  const [points, setPoints] = useState({});
  const [answerStatus, setAnswerStatus] = useState(null);
  const [wordGroups, setWordGroups] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [drillLeaderboard, setDrillLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Initialize or reset currentAnswer based on question type
  const initializeAnswer = (question) => {
    if (!question) return '';
    
    switch (question.type) {
      case 'M':
        return -1;
      case 'F':
        return Array(question.pattern.split('_').length - 1).fill(undefined);
      case 'D':
        return Array(question.dragItems?.length || 0).fill(null);
      case 'G':
        return [];
      case 'P':
      default:
        return '';
    }
  };

  // Reset answer when question changes
  useEffect(() => {
    if (wordGroups.length > 0 && introStep === 5) {
      const currentQuestion = wordGroups[currentWordIdx]?.questions[currentQuestionIdx];
      if (currentQuestion) {
        setCurrentAnswer(initializeAnswer(currentQuestion));
      }
    }
  }, [currentWordIdx, currentQuestionIdx, introStep, wordGroups]);

  // Timer logic - Update to track time more accurately
  useEffect(() => {
    let intervalId;
    if (introStep === 5) {
      intervalId = setInterval(() => {
        const key = `${currentWordIdx}_${currentQuestionIdx}`;
        setTimeSpent(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [introStep, currentWordIdx, currentQuestionIdx]);

  // Fetch drill and wordlist
  useEffect(() => {
    const fetchDrillAndWordlist = async () => {
      try {
        const drillRes = await api.get(`/api/drills/${id}/`);
        const drillData = drillRes.data;
        let mergedQuestions = [];

        if (drillData.custom_wordlist) {
          const wordlistRes = await api.get(`/api/wordlist/${drillData.custom_wordlist}/`);
          const words = wordlistRes.data.words || [];
          
          // Create a map of questions by word
          const questionsByWord = {};
          const questions = drillData.questions || [];
          
          // Calculate how many questions each word should have
          const totalQuestions = questions.length;
          const totalWords = words.length;
          const baseQuestionsPerWord = Math.floor(totalQuestions / totalWords);
          const extraQuestions = totalQuestions % totalWords;
          
          // Initialize question counters for each word
          const wordQuestionCounts = words.map((_, index) => 
            baseQuestionsPerWord + (index < extraQuestions ? 1 : 0)
          );
          
          // Distribute questions to words
          let currentQuestionIndex = 0;
          words.forEach((word, wordIndex) => {
            const questionsForThisWord = wordQuestionCounts[wordIndex];
            const wordQuestions = questions.slice(
              currentQuestionIndex,
              currentQuestionIndex + questionsForThisWord
            );
            
            questionsByWord[word.id] = wordQuestions.map(q => ({
            ...q,
              word: word.word,
              definition: word.definition,
              image: word.image_url,
              signVideo: word.video_url,
              word_id: word.id
            }));
            
            currentQuestionIndex += questionsForThisWord;
          });
          
          // Then merge into final array maintaining word grouping
          mergedQuestions = [];
          words.forEach(word => {
            const wordQuestions = questionsByWord[word.id] || [];
            mergedQuestions.push(...wordQuestions);
          });
        } else {
          mergedQuestions = drillData.questions || [];
        }

        setDrill({ ...drillData, questions: mergedQuestions });
        const groups = groupQuestionsByWord(mergedQuestions);
        setWordGroups(groups);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load drill:', error);
        setError('Failed to load drill. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDrillAndWordlist();
  }, [id]);
  
  // Show full screen layout immediately with loading state
  if (loading || !drill || wordGroups.length === 0) {
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
        <div className="w-full flex items-center px-8 pt-6 mb-2 gap-6">
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            onClick={() => navigate(-1)}
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
          </button>
          
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="bg-[#f39c12] h-full rounded-full animate-pulse" style={{ width: '5%' }} />
            </div>
          </div>
          
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: 0
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center h-[calc(100vh-180px)]">
          <div className="flex items-center gap-4">
            <img src={HippoWaiting} alt="Loading..." className="w-32 h-32" />
            <div className="text-xl font-semibold text-[#8e44ad]">Loading your drill...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
            <img src={HippoSad} alt="Error" className="w-32 h-32 mx-auto mb-4" />
            <div className="text-xl font-semibold text-red-500 mb-4">{error}</div>
            <button
              className="px-6 py-2 bg-[#8e44ad] text-white rounded-lg hover:bg-[#6f3381]"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate progress once
  const totalSteps = wordGroups.length > 0 ? calculateTotalSteps(wordGroups) : 1;
  const currentStep = wordGroups.length > 0 
    ? calculateCurrentStep(introStep, currentWordIdx, currentQuestionIdx, wordGroups) 
    : 1;
  const progress = Math.min(((currentStep) / totalSteps) * 100, introStep === 6 ? 100 : 99);

  // Current word/question
  const currentWord = wordGroups[currentWordIdx];
  const currentQuestions = currentWord.questions;
  const currentQuestion = currentQuestions[currentQuestionIdx];

  // Add leaderboard fetch when summary screen is shown
  useEffect(() => {
    if (introStep === 6) {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      api.get(`/api/drills/${id}/results/`)
        .then(res => {
          // Only show students who have attempted the drill
          const results = res.data || [];
          const leaderboardMap = new Map();
          results.forEach(result => {
            const studentId = result.student.id;
            const currentBest = leaderboardMap.get(studentId);
            if (!currentBest || result.points > currentBest.points) {
              leaderboardMap.set(studentId, result);
            }
          });
          const leaderboardArr = Array.from(leaderboardMap.values())
            .map(result => ({
              id: result.student.id,
              name: result.student.name,
              avatar: result.student.avatar,
              points: result.points
            }))
            .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
          setDrillLeaderboard(leaderboardArr);
        })
        .catch(() => setLeaderboardError('Failed to load leaderboard'))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [introStep, id]);

  // Update handleAnswer to save points to backend
  const handleAnswer = async (answer, isCorrect) => {
    setCurrentAnswer(answer);
    const key = `${currentWordIdx}_${currentQuestionIdx}`;
    
    // For Sentence Builder (type D)
    if (currentQuestion.type === 'D') {
      if (isCorrect) {
        setAnswerStatus('correct');
        const points = calculatePoints(attempts[key], timeSpent[key]);
        setPoints(prev => ({ ...prev, [key]: points }));
        
        // Submit answer to backend
        try {
          await api.post(`/api/drills/${id}/questions/${currentQuestion.id}/submit/`, {
            answer: answer,
            time_taken: timeSpent[key],
            wrong_attempts: attempts[key] || 0,
            points: points
          });
        } catch (error) {
          console.error('Failed to submit answer:', error);
        }
      } else if (answer.some(a => a !== null)) {
        setAnswerStatus('wrong');
        setAttempts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      } else {
        setAnswerStatus(null);
      }
      return;
    }
    
    // Handle other question types
    let correct = false;
    
    if (currentQuestion.type === 'M') {
      correct = parseInt(answer) === parseInt(currentQuestion.answer);
    } else if (currentQuestion.type === 'F') {
      if (Array.isArray(answer)) {
        const userAnswer = currentQuestion.pattern.split(' ').map((char, idx) => {
          if (char === '_') {
            const selectedIdx = answer[idx - currentQuestion.pattern.split(' ').slice(0, idx).filter(c => c === '_').length];
            return selectedIdx !== undefined ? currentQuestion.letterChoices[selectedIdx] : '';
          }
          return char;
        }).join('').replace(/ /g, '');
        correct = userAnswer.toUpperCase() === (currentQuestion.answer || '').toUpperCase();
      }
    } else if (currentQuestion.type === 'P') {
      correct = (answer || '').toLowerCase().trim() === (currentQuestion.answer || '').toLowerCase().trim();
    } else if (currentQuestion.type === 'G') {
      correct = Array.isArray(answer) && answer.length === (currentQuestion.memoryCards?.length || 0);
    }
    
    if (correct || isCorrect) {
      setAnswerStatus('correct');
      const earnedPoints = calculatePoints(attempts[key], timeSpent[key]);
      setPoints(prev => ({ ...prev, [key]: earnedPoints }));

      // Submit answer to backend
      try {
        await api.post(`/api/drills/${id}/questions/${currentQuestion.id}/submit/`, {
          answer: answer,
          time_taken: timeSpent[key],
          wrong_attempts: attempts[key] || 0,
          points: earnedPoints
        });
      } catch (error) {
        console.error('Failed to submit answer:', error);
      }
    } else {
      setAnswerStatus('wrong');
      if (currentQuestion.type === 'M') {
        setWrongAnswers(prev => prev.includes(answer) ? prev : [...prev, answer]);
      }
      setAttempts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    }
  };

  const handleNext = () => {
    if (introStep < 5) {
      // Still in word intro steps
      setIntroStep(introStep + 1);
    } else {
      // In questions phase
      if (currentQuestionIdx < currentWord.questions.length - 1) {
        // More questions for current word
        const nextQuestion = currentWord.questions[currentQuestionIdx + 1];
        setCurrentAnswer(initializeAnswer(nextQuestion));
        setCurrentQuestionIdx(currentQuestionIdx + 1);
        setAnswerStatus(null);
      } else if (currentWordIdx < wordGroups.length - 1) {
        // Move to next word
        const nextWord = wordGroups[currentWordIdx + 1];
        setCurrentWordIdx(currentWordIdx + 1);
        setCurrentQuestionIdx(0);
        setIntroStep(1); // Reset to word intro
        setAnswerStatus(null);
        if (nextWord?.questions[0]) {
          setCurrentAnswer(initializeAnswer(nextWord.questions[0]));
        }
      } else {
        // End of drill
        setIntroStep(6);
      }
    }
    setWrongAnswers([]);
  };

  // --- FLOW ---
  if (introStep === 0) {
    // Global intro
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
          </button>
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>
        <IntroBubble
          mascot={HippoIdle}
          text={`Hi I'm Hano, and today we'll learn about ${drill.wordlist_name || drill.title}. Are you ready to learn? Click Next to start!`}
        />
            <button
          className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg z-50"
          onClick={() => setIntroStep(1)}
        >
          Next
        </button>
      </div>
    );
  }
  if (introStep === 1) {
    // Word intro
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
              onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
            >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
            </button>
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
          </div>
        </div>
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>
        <IntroBubble
          mascot={HippoIdle}
          text={`This is a ${currentWord.word}`}
          image={currentWord.image}
        />
            <button
          className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg z-50"
          onClick={() => setIntroStep(2)}
        >
          Next
        </button>
      </div>
    );
  }
  if (introStep === 2) {
    // Definition
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
              onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
            >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
            </button>
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>
        <IntroBubble
          mascot={HippoIdle}
          text={currentWord.definition}
          image={currentWord.image}
        />
        <button
          className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg z-50"
          onClick={() => setIntroStep(3)}
        >
          Next
        </button>
      </div>
    );
  }
  if (introStep === 3) {
    // Sign language
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
          </button>
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>
        <IntroBubble
          mascot={HippoIdle}
          text={`This is the sign language for ${currentWord.word}. Can you sign it with me? Play the video to see how!`}
          video={currentWord.signVideo}
        />
            <button
          className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg z-50"
          onClick={() => setIntroStep(4)}
        >
          Next
        </button>
      </div>
    );
  }
  if (introStep === 4) {
    // Transition
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
              onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
            >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
            </button>
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>
        <IntroBubble
          mascot={HippoIdle}
          text={transitions[Math.floor(Math.random() * transitions.length)]}
        />
        <button
          className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg z-50"
          onClick={() => setIntroStep(5)}
        >
          Next
        </button>
      </div>
    );
  }
  if (introStep === 5) {
    let mascot = HippoCurious;
    if (answerStatus === 'correct') mascot = HippoHappy;
    // Only show sad mascot if answer is wrong AND it's a complete answer
    if (answerStatus === 'wrong' && 
        ((currentQuestion.type === 'D' && currentAnswer?.every(a => a !== null)) ||
         currentQuestion.type !== 'D')) mascot = HippoSad;
  
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
        {/* Header - Reduced bottom margin */}
        <div className="w-full flex items-center px-8 pt-6 mb-2 gap-6">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
          </button>
          
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#f39c12] h-full rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[120px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>

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
          {(() => {
            switch (currentQuestion.type) {
              case 'M':
                return (
                  <MultipleChoiceQuestion 
                    question={currentQuestion} 
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer, false)}
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
                          handleAnswer(answer, correct);
                        }}
                    currentAnswer={currentAnswer}
                    answerStatus={answerStatus}
                  />
                );
              case 'D':
                return (
                  <SentenceBuilderQuestion 
                    question={currentQuestion} 
                    onAnswer={(answer, isCorrect) => answerStatus !== 'correct' && handleAnswer(answer, isCorrect)}
                    currentAnswer={currentAnswer}
                  />
                );
              case 'G':
                return (
                  <MemoryGameQuestion
                    question={currentQuestion}
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer, false)}
                    currentAnswer={currentAnswer}
                  />
                );
              case 'P':
                return (
                  <PictureWordQuestion
                    question={currentQuestion}
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer, false)}
                    currentAnswer={currentAnswer}
                  />
                );
              default:
                    return <div>Unsupported question type</div>;
            }
          })()}
        </div>
      </div>
        </div>
        
        {/* Next button */}
        {answerStatus === 'correct' && (
              <button
            className="fixed bottom-12 right-12 px-8 py-3 bg-[#f39c12] text-white rounded-xl text-lg font-bold hover:bg-[#e67e22] shadow-lg transition-all hover:scale-105"
            onClick={handleNext}
              >
            Next
              </button>
        )}
                        </div>
                      );
                    }
  if (introStep === 6) {
    // Summary
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        {/* Header always on top */}
        <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6 z-30 relative">
          {/* Back button */}
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            onClick={() => navigate(-1)}
            aria-label="Exit drill"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
          </button>
          {/* Progress bar */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
              <div className="bg-[#f39c12] h-4 rounded-full transition-all" style={{ width: `100%` }}></div>
            </div>
          </div>
          {/* Points */}
          <div className="text-lg font-bold text-[#4C53B4] min-w-[90px] text-right">
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
          </div>
        </div>
        {/* Congratulations section centered, but with lower z-index so header is clickable */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <div className="flex flex-col items-center justify-center w-full max-w-xl bg-transparent rounded-2xl p-10 animate-fadeIn pointer-events-auto">
            <img src={HippoHappy} alt="Hippo" className="w-48 h-48 mb-4 mx-auto" />
            <h2 className="text-4xl font-bold text-[#8e44ad] mb-4 text-center">Congratulations!</h2>
            <div className="text-2xl mb-2 text-center">You've completed the drill!</div>
            <div className="text-xl mb-6 text-center">Total Points: <span className="font-bold text-[#f39c12]">{Object.values(points).reduce((a, b) => a + (b || 0), 0)}</span></div>
            <div className="flex gap-6 mt-8 justify-center">
              <button
                className="px-12 py-5 bg-[#4C53B4] text-white rounded-2xl text-2xl font-bold hover:bg-[#3a4095] shadow-lg"
                onClick={() => {
                  setIntroStep(0);
                  setCurrentWordIdx(0);
                  setCurrentQuestionIdx(0);
                  setAttempts({});
                  setTimeSpent({});
                  setPoints({});
                  setAnswerStatus(null);
                }}
              >
                Retake Drill
              </button>
            </div>
          </div>
        </div>
        {/* Leaderboard panel with interactive features, fixed to bottom-right */}
        <div className="fixed bottom-8 right-8 w-[370px] min-h-[400px] bg-white/90 rounded-2xl shadow-2xl border-2 border-gray-100 p-6 flex flex-col items-center animate-fadeIn z-20">
          <h3 className="text-2xl font-extrabold text-[#e09b1a] text-center mb-4 tracking-wide flex items-center justify-center gap-2">
            <span>Leaderboard</span>
          </h3>
          {loadingLeaderboard ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : leaderboardError ? (
            <div className="text-center text-red-500 py-12">{leaderboardError}</div>
          ) : drillLeaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-12">No students have attempted this drill yet.</div>
          ) : (
            <div className="w-full">
              {/* Top 3 Podium */}
              <div className="flex justify-center items-end gap-4 mb-6">
                {[1, 0, 2].map((idx, pos) => {
                  const student = drillLeaderboard[idx];
                  if (!student) return <div key={pos} className="w-20" />;
                  const rank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
                  const borderColors = [
                    'border-purple-400',
                    'border-yellow-400',
                    'border-orange-400'
                  ];
                  const size = pos === 1 ? 'w-20 h-20' : 'w-14 h-14';
                  const ring = pos === 1 ? 'ring-4 ring-yellow-300' : '';
                  return (
                    <div
                      key={student.id}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105 group`}
                      onClick={() => setSelectedUser(student)}
                      data-tip data-for={`podium-tip-${student.id}`}
                    >
                      <div className="flex flex-col items-center mb-1">
                        <span className={`font-extrabold text-lg ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-purple-400' : 'text-orange-400'}`}>{rank}</span>
                        {rank === 1 && (
                          <span className="-mt-1 text-yellow-400 text-2xl drop-shadow-lg">👑</span>
                        )}
                      </div>
                      <div className={`relative ${size} rounded-full overflow-hidden border-4 ${borderColors[pos]} bg-white flex items-center justify-center ${ring} group-hover:ring-4 group-hover:ring-[#e09b1a]`}>
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#4C53B4] font-bold text-lg">{student.name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </div>
                      <div className={`mt-2 text-center ${pos === 1 ? 'font-extrabold text-base' : 'font-bold text-sm'} text-gray-800 group-hover:text-[#e09b1a]`}>
                        {student.name}
                      </div>
                      <div className="text-center text-gray-600 font-bold text-sm">{student.points}</div>
                      <Tooltip id={`podium-tip-${student.id}`} effect="solid" place="top">
                        <span>{student.name}<br/>Points: {student.points}</span>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
              {/* Table for the rest */}
              <div className="w-full bg-white/80 rounded-xl shadow p-2">
                <div className="flex font-bold text-[#e09b1a] text-base mb-1">
                  <div className="flex-1">NAME</div>
                  <div className="w-16 text-right">PTS</div>
                </div>
                {drillLeaderboard.slice(3).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center border-t border-gray-200 py-1 cursor-pointer transition-all duration-150 hover:bg-[#fffbe6] hover:scale-[1.01]"
                    onClick={() => setSelectedUser(student)}
                    data-tip data-for={`row-tip-${student.id}`}
                  >
                    <div className="flex-1 font-semibold text-gray-700 text-sm hover:text-[#e09b1a]">{student.name}</div>
                    <div className="w-16 text-right font-bold text-gray-700 text-sm">{student.points}</div>
                    <Tooltip id={`row-tip-${student.id}`} effect="solid" place="top">
                      <span>{student.name}<br/>Points: {student.points}</span>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* User details modal */}
          <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
      </div>
    );
  }
  return null;
};

export default TakeDrill; 