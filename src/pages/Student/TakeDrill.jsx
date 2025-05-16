import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';

const MultipleChoiceQuestion = ({ question, onAnswer, currentAnswer }) => {
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
              onClick={() => onAnswer(index)}
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

const TakeDrill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTeacherPreview, setIsTeacherPreview] = useState(false);
  
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
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
  };
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // For teacher preview, just go back
      if (isTeacherPreview) {
        navigate(-1);
        return;
      }
      
      // TODO: Submit answers to API
      // This will depend on your backend API design
      
      // For now, let's just show some feedback
      alert('Drill completed successfully!');
      
      // Navigate back to classroom
      navigate(-1);
    } catch (error) {
      console.error('Error submitting drill answers:', error);
      alert(`Failed to submit answers: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };
  
  const isQuestionAnswered = (questionIndex) => {
    // If teacher is previewing a draft drill, consider all questions as answered
    if (isTeacherPreview) {
      return true;
    }
    return answers[questionIndex] !== undefined;
  };
  
  const currentAnswer = answers[currentQuestionIndex];
  
  const renderQuestion = () => {
    if (!currentQuestion) return null;
    
    switch (currentQuestion.type) {
      case 'M':
        return (
          <MultipleChoiceQuestion 
            question={currentQuestion} 
            onAnswer={handleAnswer} 
            currentAnswer={currentAnswer}
          />
        );
      case 'F':
        return (
          <FillInBlankQuestion 
            question={currentQuestion} 
            onAnswer={handleAnswer} 
            currentAnswer={currentAnswer}
          />
        );
      case 'D':
        return (
          <DragDropQuestion 
            question={currentQuestion} 
            onAnswer={handleAnswer} 
            currentAnswers={currentAnswer}
          />
        );
      default:
        return <div>Unsupported question type: {currentQuestion.type}</div>;
    }
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
    </div>
  );
};

export default TakeDrill; 