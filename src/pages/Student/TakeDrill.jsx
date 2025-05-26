import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';
import '../../styles/animations.css';
import BadgeEarnedModal from '../../components/BadgeEarnedModal';
import { useUser } from '../../contexts/UserContext';
import { StudentDrillSuccessModal } from '../../components/SuccessModal.jsx';

const MultipleChoiceQuestion = ({ question, onAnswer, currentAnswer, handleSubmitAnswer, question: currentQuestion }) => {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
        {question.choices.map((choice, index) => {
          const isSelected = currentAnswer === index;
          
          // Handle media (image/video)
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
              className={`p-6 rounded-2xl text-center transition-all transform hover:scale-105 ${
                isSelected 
                  ? 'bg-[#8e44ad] text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-800 shadow-md hover:shadow-lg'
              }`}
              onClick={() => handleSubmitAnswer(currentQuestion.id, index)}
            >
              <div className="flex items-center justify-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mr-4 ${
                  isSelected ? 'bg-white text-[#8e44ad]' : 'bg-[#f1f2f6] text-[#8e44ad]'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1 text-left">
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

const FillInBlankQuestion = ({ question, onAnswer, currentAnswer, handleSubmitAnswer }) => {
  // For fill in the blank, split the text by underscore
  const parts = question.text.split('_');
  
  return (
    <div className="animate-fadeIn">
      <div className="text-xl mb-6 text-center">
        {parts[0]}
        <span className="inline-block min-w-[120px] border-b-2 border-[#8e44ad] mx-1 text-center font-bold text-[#8e44ad]">
          {currentAnswer !== null && question.choices && question.choices[currentAnswer] ? question.choices[currentAnswer].text : '_____'}
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
            onClick={() => handleSubmitAnswer(question.id, index)}
          >
            {choice.text}
          </button>
        ))}
      </div>
    </div>
  );
};

const DragDropQuestion = ({ question, onAnswer, currentAnswers = {}, handleSubmitAnswer }) => {
  const dragItems = question.dragItems || [];
  const dropZones = question.dropZones || [];
  
  // Function to handle when an item is dropped in a zone
  const handleDrop = (dragIndex, zoneIndex) => {
    const newAnswers = {...currentAnswers};
    newAnswers[zoneIndex] = dragIndex;
    // Call handleSubmitAnswer with the updated mapping
    handleSubmitAnswer(question.id, newAnswers);
    // Update local state immediately for responsiveness (optional, backend response will confirm)
    onAnswer(newAnswers);
  };
  
  // Reset a specific mapping
  const resetMapping = (zoneIndex) => {
    const newAnswers = {...currentAnswers};
    delete newAnswers[zoneIndex];
     // Call handleSubmitAnswer with the updated mapping
    handleSubmitAnswer(question.id, newAnswers);
    // Update local state immediately for responsiveness (optional)
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
const MemoryGameQuestion = ({ question, onAnswer, handleSubmitAnswer }) => {
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
          setMatched(prev => {
            const newMatched = [...prev, firstId, secondId];
            // If all pairs are matched, submit the result
            if (newMatched.length === shuffledCards.length) {
                 // Pass the list of matched pairs as answerData
                 const matchedPairs = [];
                 // Assuming `matched` state contains all matched card IDs
                 // We need to reconstruct the pairs to send to the backend
                 const tempMatched = [...newMatched]; // Use a copy to avoid modifying state during iteration
                 while(tempMatched.length > 0) {
                     const card1Id = tempMatched.shift();
                     const card1 = shuffledCards.find(c => c.id === card1Id);
                     if(card1 && card1.pairId) {
                         const card2IdIndex = tempMatched.findIndex(id => id === card1.pairId);
                         if(card2IdIndex !== -1) {
                              const card2Id = tempMatched.splice(card2IdIndex, 1)[0];
                               matchedPairs.push([card1Id, card2Id]);
                         }
                     }
                 }
                 console.log("Submitting Memory Game matched pairs:", matchedPairs);
                 handleSubmitAnswer(question.id, matchedPairs);
            }
            return newMatched;
          });
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

const PictureWordQuestion = ({ question, onAnswer, currentAnswer, handleSubmitAnswer }) => {
  const [answer, setAnswer] = useState(currentAnswer || '');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Update answer state when currentAnswer changes (from backend submission result)
  useEffect(() => {
    // Check if currentAnswer is different from the current local state before updating
    if (currentAnswer !== undefined && currentAnswer !== answer) {
      setAnswer(currentAnswer);
    }
     // When currentAnswer changes due to backend response, update isCorrect display
    // Need access to the is_correct status from the backend result.
    // Assuming the parent component passes the full question result object via currentAnswer prop
    // or we fetch it here based on currentAnswer being available.

    // **Refinement:** The parent component (TakeDrill) should pass the full question result object
    // down to render the correct/incorrect status.
    // For now, let's assume currentAnswer being defined means it was submitted.
    // We need to get the is_correct status from the submittedQuestionResults state in the parent.

  }, [currentAnswer]); // Depend on currentAnswer prop

  const handleSubmit = () => {
    // Debug logs
    console.log('Question object:', question);
    console.log('User answer:', answer);
  
    // Submit the text answer to the backend
    handleSubmitAnswer(question.id, answer);

    // The correctness feedback will come from the backend response
    // The useEffect hooked to currentAnswer will handle updating the display based on the backend result.

     // Clear local isCorrect state immediately or wait for backend confirmation?
     // Let's wait for backend confirmation to avoid flickering.
     // setIsCorrect(null);
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
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-white transform rotate-45"></div>
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

const TakeDrill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(); // Get user from context
  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submittedQuestionResults, setSubmittedQuestionResults] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTeacherPreview, setIsTeacherPreview] = useState(false);
  const questionStartTimeRef = useRef(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [initialBadgeCount, setInitialBadgeCount] = useState(0); // Store initial badge count
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [studentScore, setStudentScore] = useState(null);
  const [maxScore, setMaxScore] = useState(null);
  
  // Fetch initial badge count on mount
  useEffect(() => {
    if (user?.id) {
      api.get('/api/badges/student-badges/', { params: { student_id: user.id } })
        .then(res => setInitialBadgeCount(res.data.length))
        .catch(err => console.error('Error fetching initial badge count:', err));
    }
  }, [user]);

  // Fetch the drill data
  useEffect(() => {
    const fetchDrill = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/drills/${id}/`);
        setDrill(response.data);
        
        // Check if this is a teacher preview (draft drill accessed from teacher routes)
        const isDraft = response.data.status === 'draft';
        const isTeacherRoute = window.location.pathname.startsWith('/t/');
        setIsTeacherPreview(isDraft && isTeacherRoute);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch drill');
        setLoading(false);
      }
    };
    
    fetchDrill();
  }, [id]);
  
  // Start timer when question index changes (and not in teacher preview mode)
  useEffect(() => {
      if (drill && drill.questions && !isTeacherPreview) {
          questionStartTimeRef.current = Date.now();
      }
      // Cleanup function to potentially stop timer if component unmounts or drill changes
      return () => {
          questionStartTimeRef.current = null;
      };
  }, [currentQuestionIndex, drill, isTeacherPreview]);
  
  if (loading) {
    return (
      <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f39c12]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover' }}>
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <i className="fa-solid fa-exclamation text-red-500 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-4 py-2 bg-[#f39c12] text-white rounded-lg hover:bg-[#e67e22] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!drill) {
    return (
      <div className="min-h-screen fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover' }}>
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <i className="fa-solid fa-question text-yellow-500 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Drill Not Found</h2>
            <p className="text-gray-600">The drill you're looking for doesn't exist or you don't have permission to access it.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-4 py-2 bg-[#f39c12] text-white rounded-lg hover:bg-[#e67e22] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const questions = drill.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || null;
  
  const handleNextQuestion = async () => {
      // Ensure an answer is submitted before moving to the next question
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) return;

      // If in teacher preview or already submitted, just move next
      if (isTeacherPreview || submittedQuestionResults[currentQuestionIndex]) {
           if (currentQuestionIndex < questions.length - 1) {
               setCurrentQuestionIndex(currentQuestionIndex + 1);
           }
           return;
      }

      // Otherwise, submit the answer for the current question first
      // The individual question components need to call handleAnswer with the answer data
      // We need to ensure handleAnswer is called *before* handleNextQuestion is triggered by the UI.
      // This requires modifying the individual question components or the logic that calls handleNextQuestion.
      // For now, this is a placeholder check. The actual submission will happen when the answer is provided in the UI.

       // **Refinement:** Instead of relying on handleNextQuestion to trigger submit,
       // the individual question components should call a submit handler function directly
       // when the user completes their answer (e.g., clicks a submit button, selects a choice).
       // The submit handler will then update state and potentially move to the next question.

       console.warn("Submit logic needs to be triggered by individual question components.");
       // Proceeding for now, but actual submission will be missing.
       if (currentQuestionIndex < questions.length - 1) {
           setCurrentQuestionIndex(currentQuestionIndex + 1);
       }

  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // New function to handle submitting an answer to the backend
  const handleSubmitAnswer = async (questionId, answerData) => {
       if (isTeacherPreview || isSubmitting) return; // Don't submit in preview or if already submitting

       setIsSubmitting(true);
       setError(null); // Clear previous errors

       const startTime = questionStartTimeRef.current;
       const endTime = Date.now();
       const timeTaken = startTime ? (endTime - startTime) / 1000 : null; // Time in seconds

       try {
           const response = await api.post(
               `/api/drills/${id}/questions/${questionId}/submit/`,
               { answer: answerData, time_taken: timeTaken }
           );

           console.log('Answer submission response:', response.data);

           // Store the returned QuestionResult object
           setSubmittedQuestionResults(prev => ({
               ...prev,
               [currentQuestionIndex]: response.data // Assuming backend returns the QuestionResult or similar data
           }));

           setIsSubmitting(false);

           // Automatically move to the next question after successful submission (except for the last question)
           if (currentQuestionIndex < questions.length - 1) {
               // Add a small delay before moving to the next question
               setTimeout(() => {
                   setCurrentQuestionIndex(currentQuestionIndex + 1);
               }, 500); // 500ms delay
           }

       } catch (err) {
           console.error('Error submitting answer:', err.response?.data || err.message);
           setError(err.response?.data?.error || 'Failed to submit answer.');
           setIsSubmitting(false);
       }
  };

  // Modify handleAnswer to just update local state temporarily if needed, or remove it
  // The primary submission will now go through handleSubmitAnswer
  const handleAnswer = (answer) => {
      // This function might no longer be needed or could be used for temporary local state update
      // before the official submission via handleSubmitAnswer.
      console.log("handleAnswer called with:", answer);
      // You might still use this to update the UI immediately after a user action,
      // but the actual saving to the backend happens in handleSubmitAnswer.
  };

  // Modify the main handleSubmit (for finishing the drill) to check if all questions are answered
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    // Check if all questions have a submitted result
    const allAnswered = questions.every((_, index) => submittedQuestionResults[index]);
    console.log('allAnswered:', allAnswered, 'submittedQuestionResults:', submittedQuestionResults);

    if (!allAnswered) {
      alert("Please answer all questions before finishing the drill.");
      return;
    }

    if (isTeacherPreview || isSubmitting) return; // Don't proceed in preview or if already submitting

    setIsSubmitting(true);

    try {
      // After drill completion, check for new badge
      const badgesRes = await api.get('/api/badges/student-badges/', { params: { student_id: user.id } });
      const newBadgeCount = badgesRes.data.length;
      let latestBadge = null;
      if (newBadgeCount > initialBadgeCount) {
        latestBadge = badgesRes.data[badgesRes.data.length - 1];
      }
      // Fetch drill results for the student
      const resultsRes = await api.get(`/api/drills/${id}/results/`);
      console.log('resultsRes.data:', resultsRes.data);
      resultsRes.data.forEach((r, i) => console.log(`Result[${i}]`, r));
      console.log('user.id:', user.id);
      const myResult = Array.isArray(resultsRes.data)
        ? resultsRes.data.find(r =>
            r.student?.id === user.id ||
            r.student_id === user.id ||
            r.id === user.id ||
            r.user === user.id ||
            r.user_id === user.id ||
            r.username === user.username
          )
        : resultsRes.data;
      console.log('myResult:', myResult);
      setStudentScore(myResult?.points || 0);
      setMaxScore(myResult?.max_points || myResult?.total_points || 0);
      // Store badge for later
      setEarnedBadge(latestBadge);
      console.log('Setting showSuccessModal to true');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error completing drill:', error);
      alert(`Failed to complete drill: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Go to My Classes (shows badge modal if earned)
  const handleGoToClasses = () => {
    setShowSuccessModal(false);
    if (earnedBadge) {
      setShowBadgeModal(true);
    } else {
      navigate('/s/classes');
    }
  };

  // Handler for Go to Leaderboard
  const handleGoToLeaderboard = () => {
    console.log('handleGoToLeaderboard called, id:', id);
    setShowSuccessModal(false);
    navigate(`/s/drill/${id}/leaderboard`);
  };

  // Update isQuestionAnswered logic to check against submittedQuestionResults
  const isQuestionAnswered = (questionIndex) => {
    // If teacher is previewing a draft drill, consider all questions as answered
    if (isTeacherPreview) {
      return true;
    }
    return submittedQuestionResults[questionIndex] !== undefined;
  };

  // The currentAnswer state is now derived from submittedQuestionResults
  const currentQuestionResult = submittedQuestionResults[currentQuestionIndex];
  const currentAnswer = currentQuestionResult ? currentQuestionResult.submitted_answer : undefined;
  
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    

    return (
      <div className="w-full max-w-4xl mx-auto">
        {/* Story Display */}
        <StoryDisplay story={currentQuestion} />
        
        {/* Question Content */}
        <div className="mt-8">
          {(() => {
            switch (currentQuestion.type) {
              case 'M':
                return (
                  <MultipleChoiceQuestion 
                    question={currentQuestion} 
                    onAnswer={handleAnswer} 
                    currentAnswer={currentAnswer}
                    handleSubmitAnswer={handleSubmitAnswer}
                  />
                );
              case 'F':
                return (
                  <FillInBlankQuestion 
                    question={currentQuestion} 
                    onAnswer={handleAnswer} 
                    currentAnswer={currentAnswer}
                    handleSubmitAnswer={handleSubmitAnswer}
                  />
                );
              case 'D':
                return (
                  <DragDropQuestion 
                    question={currentQuestion} 
                    onAnswer={handleAnswer} 
                    currentAnswers={currentAnswer}
                    handleSubmitAnswer={handleSubmitAnswer}
                  />
                );
              case 'G':
                return (
                  <MemoryGameQuestion
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    handleSubmitAnswer={handleSubmitAnswer}
                  />
                );
              case 'P':
                return (
                  <PictureWordQuestion
                    question={currentQuestion}
                    onAnswer={handleAnswer}
                    currentAnswer={currentAnswer}
                    handleSubmitAnswer={handleSubmitAnswer}
                  />
                );
              default:
                return <div>Unsupported question type: {currentQuestion.type}</div>;
            }
          })()}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div className="py-8 px-4 h-full flex flex-col max-w-6xl mx-auto">
        {/* Back button at top left */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-white p-4 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            aria-label="Go back to classroom"
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
          </button>
        </div>
        
        {/* Question Text at Top - No Container */}
        <div className="mt-4 mb-8">
          {currentQuestion && (
            <h2 className="text-4xl font-bold text-[#e67e22] text-center drop-shadow-lg">
              {currentQuestion.type === 'F' ? 'Fill in the blank' : currentQuestion.text}
            </h2>
          )}
        </div>
        
        {/* Question Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Question Content (without the text) */}
          <div className="w-full">
            {renderQuestion()}
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="mt-auto">
          {/* Navigation Buttons with inline question indicators - Fixed Layout */}
          <div className="flex items-center">
            {/* Fixed width container for Previous button */}
            {currentQuestionIndex > 0 ? (
              <button
                onClick={handlePreviousQuestion}
                className="px-6 py-3 rounded-xl font-bold bg-white text-[#8e44ad] hover:bg-gray-100 shadow-md"
              >
                Previous
              </button>
            ) : (
              <div className="w-[120px]">{/* Empty spacer div when no Previous button */}</div>
            )}
            
            {/* Question indicators - always centered */}
            <div className="flex-1 flex justify-center">
              <div className="flex gap-2 justify-center">
                {(() => {
                  // Logic to determine which indicators to show (max 10)
                  const totalQuestions = questions.length;
                  
                  // If 10 or fewer questions, show all
                  if (totalQuestions <= 10) {
                    return questions.map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          idx === currentQuestionIndex 
                            ? 'bg-[#f39c12] text-white border-2 border-[#f39c12]' 
                            : isQuestionAnswered(idx) 
                              ? 'bg-white text-[#f39c12] border-2 border-[#f39c12]' 
                              : 'bg-white text-gray-500 border-2 border-white'
                        }`}
                        onClick={() => setCurrentQuestionIndex(idx)}
                      >
                        {idx + 1}
                      </button>
                    ));
                  }
                  
                  // For more than 10 questions, use a smarter display strategy
                  const indicators = [];
                  
                  // Always show the first indicator
                  if (currentQuestionIndex > 3) {
                    indicators.push(
                      <button
                        key={0}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${isQuestionAnswered(0) 
                            ? 'bg-white text-[#f39c12] border-2 border-[#f39c12]' 
                            : 'bg-white text-gray-500 border-2 border-white'}`}
                        onClick={() => setCurrentQuestionIndex(0)}
                      >
                        1
                      </button>
                    );
                    
                    // Add ellipsis if not showing question 1
                    if (currentQuestionIndex > 4) {
                      indicators.push(
                        <div key="ellipsis1" className="flex items-center px-1">
                          <span className="text-white font-bold">...</span>
                        </div>
                      );
                    }
                  }
                  
                  // Calculate range around current question
                  let startIdx = Math.max(0, currentQuestionIndex - 2);
                  let endIdx = Math.min(totalQuestions - 1, currentQuestionIndex + 2);
                  
                  // Adjust to show more questions ahead if we're near the start
                  if (currentQuestionIndex < 3) {
                    endIdx = Math.min(totalQuestions - 1, 4);
                  }
                  
                  // Adjust to show more questions behind if we're near the end
                  if (currentQuestionIndex > totalQuestions - 4) {
                    startIdx = Math.max(0, totalQuestions - 5);
                  }
                  
                  // Add the range of indicators
                  for (let i = startIdx; i <= endIdx; i++) {
                    indicators.push(
                      <button
                        key={i}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          i === currentQuestionIndex 
                            ? 'bg-[#f39c12] text-white border-2 border-[#f39c12]' 
                            : isQuestionAnswered(i) 
                              ? 'bg-white text-[#f39c12] border-2 border-[#f39c12]' 
                              : 'bg-white text-gray-500 border-2 border-white'
                        }`}
                        onClick={() => setCurrentQuestionIndex(i)}
                      >
                        {i + 1}
                      </button>
                    );
                  }
                  
                  // Add ellipsis and last question if needed
                  if (endIdx < totalQuestions - 2) {
                    indicators.push(
                      <div key="ellipsis2" className="flex items-center px-1">
                        <span className="text-white font-bold">...</span>
                      </div>
                    );
                  }
                  
                  // Always show the last indicator if we're not already showing it
                  if (endIdx < totalQuestions - 1) {
                    indicators.push(
                      <button
                        key={totalQuestions - 1}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                          ${isQuestionAnswered(totalQuestions - 1) 
                            ? 'bg-white text-[#f39c12] border-2 border-[#f39c12]' 
                            : 'bg-white text-gray-500 border-2 border-white'}`}
                        onClick={() => setCurrentQuestionIndex(totalQuestions - 1)}
                      >
                        {totalQuestions}
                      </button>
                    );
                  }
                  
                  return indicators;
                })()}
              </div>
            </div>
            
            {/* Fixed width container for Next/Submit button */}
            <div className="w-[120px] flex justify-end">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className={`px-6 py-3 rounded-xl font-bold shadow-md ${
                    !isQuestionAnswered(currentQuestionIndex) 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#f39c12] text-white hover:bg-[#e67e22]'
                  }`}
                  disabled={!isQuestionAnswered(currentQuestionIndex)}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-3 rounded-xl font-bold shadow-md ${
                    !isQuestionAnswered(currentQuestionIndex) || isSubmitting
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  disabled={!isQuestionAnswered(currentQuestionIndex) || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Submitting...
                    </>
                  ) : (
                    isTeacherPreview ? 'Close Preview' : 'Finish'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <StudentDrillSuccessModal
        open={showSuccessModal}
        score={studentScore}
        maxScore={maxScore}
        onGoToClasses={handleGoToClasses}
        onGoToLeaderboard={handleGoToLeaderboard}
        className="z-[9999]"
      />
      <BadgeEarnedModal
        open={showBadgeModal}
        badge={earnedBadge}
        onViewBadges={() => navigate('/s/badges')}
        onClose={() => {
          setShowBadgeModal(false);
          navigate('/s/classes');
        }}
      />
    </div>
  );
};

export default TakeDrill; 