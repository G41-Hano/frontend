import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';
import '../../styles/animations.css';
import HippoIdle from '../../assets/HippoIdle.gif';
import HippoCurious from '../../assets/MascotHippoCurious.gif';
import HippoHappy from '../../assets/MascotHippoHappy.gif';
import HippoSad from '../../assets/MascotHippoSad.gif';
import HippoWaiting from '../../assets/MascotHippoWaiting.gif';
import DrillLeaderboard from './DrillLeaderboard';
import { Tooltip } from "react-tooltip";

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

  // Update answer state when currentAnswer changes
  useEffect(() => {
    if (currentAnswer !== undefined) {
      setAnswer(currentAnswer);
    }
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
        {isCorrect !== null && (
          <div className={`text-lg font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect ? 'Correct!' : 'Try again!'}
          </div>
        )}
      </div>
    </div>
  );
};

const StoryDisplay = ({ story }) => {
  const [isMascotVisible, setIsMascotVisible] = useState(false);
  const [isThoughtVisible, setIsThoughtVisible] = useState(false);
  const [thoughtMessage, setThoughtMessage] = useState("Let's learn together! 📚");

  useEffect(() => {
    // Animate mascot entrance
    setIsMascotVisible(true);
    // Show thought bubble after mascot appears
    setTimeout(() => setIsThoughtVisible(true), 1000);

    // Change thought message based on content
    if (story?.story_title) {
      const messages = [
        "Let's learn together! 📚",
        "This story looks interesting! 🤔",
        "I'm excited to learn with you! 🌟",
        "Ready to explore? 🚀",
        "Let's discover something new! 💫"
      ];
      setThoughtMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  }, [story]);

  if (!story?.story_title && !story?.story_context && !story?.story_image && !story?.story_video) {
    return null;
  }

  return (
    <div className="relative mb-8 p-6 bg-white rounded-3xl shadow-lg animate-fadeIn">
      {/* Mascot Character */}
      <div className={`absolute -left-16 -top-16 transition-all duration-1000 transform ${isMascotVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        <div className="relative">
          <img 
            src="/mascot.svg" 
            alt="Learning Mascot" 
            className="w-32 h-32 object-contain animate-float"
            onMouseEnter={(e) => e.target.classList.add('animate-wiggle')}
            onMouseLeave={(e) => e.target.classList.remove('animate-wiggle')}
          />
          {/* Thought Bubble */}
          <div className={`absolute -top-24 -right-24 transition-all duration-1000 transform ${isThoughtVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className="relative">
              <div className="bg-white rounded-2xl p-4 shadow-lg max-w-xs animate-bounce">
                <p className="text-lg font-medium text-gray-800">{thoughtMessage}</p>
              </div>
              <div style={{
                position: 'absolute',
                left: '-18px',
                top: '50%',
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="ml-24">
        {story.story_title && (
          <h3 className="text-2xl font-bold text-[#8e44ad] mb-4 animate-slideIn animate-delay-100">
            {story.story_title}
          </h3>
        )}
        
        {story.story_context && (
          <div className="prose prose-lg max-w-none mb-6 animate-slideIn animate-delay-200">
            <p className="text-gray-700 leading-relaxed">{story.story_context}</p>
          </div>
        )}

        {/* Media Display */}
        {(story.story_image || story.story_video) && (
          <div className="mt-6 rounded-xl overflow-hidden shadow-md animate-slideIn animate-delay-300">
            {story.story_image ? (
              <img
                src={story.story_image.startsWith('http') ? story.story_image : `http://127.0.0.1:8000${story.story_image}`}
                alt="Story illustration"
                className="w-full max-h-96 object-contain hover:scale-105 transition-transform duration-300"
              />
            ) : story.story_video ? (
              <video
                src={story.story_video.startsWith('http') ? story.story_video : `http://127.0.0.1:8000${story.story_video}`}
                className="w-full max-h-96"
                controls
              />
            ) : null}
          </div>
        )}

        {/* Sign Language Instructions */}
        {story.sign_language_instructions && (
          <div className="mt-6 p-4 bg-[#f8f9fa] rounded-xl border border-[#e9ecef] animate-slideIn animate-delay-400">
            <div className="flex items-center gap-2 text-[#8e44ad] mb-2">
              <i className="fa-solid fa-hands text-xl animate-bounce"></i>
              <h4 className="font-semibold">Sign Language Guide</h4>
            </div>
            <p className="text-gray-700">{story.sign_language_instructions}</p>
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
    if (!map[q.word]) map[q.word] = { word: q.word, definition: q.definition, image: q.image, signVideo: q.signVideo, questions: [] };
    map[q.word].questions.push(q);
  });
  return Object.values(map);
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
  // 1 for global intro
  // For each word: intro + definition + sign + transition = 4 steps per word
  // Plus all questions
  return 1 + (wordGroups.length * 4) + wordGroups.reduce((acc, group) => acc + group.questions.length, 0);
};

// Calculate current step number
const calculateCurrentStep = (introStep, currentWordIdx, currentQuestionIdx, wordGroups) => {
  if (introStep === 0) return 1; // Global intro
  
  const stepsPerWord = 4; // word intro + definition + sign + transition
  const completedWordSteps = currentWordIdx * stepsPerWord;
  
  if (introStep < 5) {
    // Still in word intro steps
    return 1 + completedWordSteps + introStep;
  } else {
    // In questions phase
    const previousWordsQuestions = wordGroups
      .slice(0, currentWordIdx)
      .reduce((acc, group) => acc + group.questions.length, 0);
    
    // 1 (global intro) + all completed word intros + current word intro + questions so far
    return 1 + (currentWordIdx + 1) * stepsPerWord + previousWordsQuestions + currentQuestionIdx + 1;
  }
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
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [drillLeaderboard, setDrillLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Timer logic
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Only run timer during question phase
    if (introStep === 5) {
      // Create a new interval and store its reference
      timerRef.current = setInterval(() => {
        const key = `${currentWordIdx}_${currentQuestionIdx}`;
        setTimeSpent(prev => {
          const currentTime = (prev[key] || 0) + 1;
          return { ...prev, [key]: currentTime };
        });
      }, 1000);
    }

    // Cleanup function to clear interval
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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
          mergedQuestions = (drillData.questions || []).map((q, idx) => ({
            ...q,
            word: words[idx]?.word || `Word ${idx + 1}`,
            definition: words[idx]?.definition || '',
            image: words[idx]?.image_url || null,
            signVideo: words[idx]?.video_url || null,
          }));
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
  
  // Fetch leaderboard when summary screen is shown (must be before any conditional returns)
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
  const progress = (currentStep / totalSteps) * 100;

  // Current word/question
  const currentWord = wordGroups[currentWordIdx];
  const currentQuestions = currentWord.questions;
  const currentQuestion = currentQuestions[currentQuestionIdx];

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
    if (answerStatus === 'wrong') mascot = HippoSad;
  
  const handleAnswer = async (answer) => {
      let isCorrect = false;
      
      // Check answer based on question type
      if (currentQuestion.type === 'M') {
        isCorrect = parseInt(answer) === parseInt(currentQuestion.answer);
      } else if (currentQuestion.type === 'F') {
        isCorrect = parseInt(answer) === parseInt(currentQuestion.answer);
      } else if (currentQuestion.type === 'P') {
        isCorrect = (answer || '').toLowerCase().trim() === (currentQuestion.answer || '').toLowerCase().trim();
      } else if (currentQuestion.type === 'D') {
        isCorrect = currentQuestion.dropZones.every((zone, idx) => answer[idx] === zone.correctItemIndex);
      } else if (currentQuestion.type === 'G') {
        isCorrect = Array.isArray(answer) && answer.length === (currentQuestion.memoryCards?.length || 0);
      }

      setCurrentAnswer(answer);
      
      if (isCorrect) {
        setAnswerStatus('correct');
        const key = `${currentWordIdx}_${currentQuestionIdx}`;
        const wrong = (attempts[key] || 0);
        const time = timeSpent[key] || 0;
        // Points: 100 - 20 per wrong attempt - 1 point per 5 seconds, minimum 30
        const earned = Math.max(30, 100 - wrong * 20 - Math.floor(time / 5));
        setPoints(prev => ({ ...prev, [key]: earned }));

        // Submit answer to backend
        try {
          const response = await api.post(`/api/drills/${id}/questions/${currentQuestion.id}/submit/`, {
            answer: answer,
            time_taken: time,
            wrong_attempts: wrong
          });

          if (response.data.success) {
            console.log('Answer submitted successfully:', response.data);
          }
    } catch (error) {
          console.error('Failed to submit answer:', error);
        }
      } else {
        setAnswerStatus('wrong');
        if (currentQuestion.type === 'M') {
          setWrongAnswers(prev => prev.includes(answer) ? prev : [...prev, answer]);
        }
        const key = `${currentWordIdx}_${currentQuestionIdx}`;
        setAttempts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        // Don't clear wrong status - it will stay until correct answer is found
      }
    };
    const handleNext = () => {
      setCurrentAnswer(null);
      setWrongAnswers([]);
      if (currentQuestionIdx < currentQuestions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
        setAnswerStatus(null);
      } else if (currentWordIdx < wordGroups.length - 1) {
        setCurrentWordIdx(currentWordIdx + 1);
        setCurrentQuestionIdx(0);
        setIntroStep(1);
        setAnswerStatus(null);
      } else {
        setIntroStep(6);
    }
  };
  
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
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer)}
                    currentAnswer={currentAnswer}
                        answerStatus={answerStatus}
                        wrongAnswers={wrongAnswers}
                  />
                );
              case 'F':
                return (
                  <FillInBlankQuestion 
                    question={currentQuestion} 
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer)}
                    currentAnswer={currentAnswer}
                  />
                );
              case 'D':
                return (
                  <DragDropQuestion 
                    question={currentQuestion} 
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer)}
                        currentAnswers={{}}
                  />
                );
              case 'G':
                return (
                  <MemoryGameQuestion
                    question={currentQuestion}
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer)}
                    currentAnswer={currentAnswer}
                  />
                );
              case 'P':
                return (
                  <PictureWordQuestion
                    question={currentQuestion}
                        onAnswer={answer => answerStatus !== 'correct' && handleAnswer(answer)}
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