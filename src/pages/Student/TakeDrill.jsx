import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import drillBg from '../../assets/drill_bg.png';
import '../../styles/animations.css';
import HippoWaiting from '../../assets/MascotHippoWaiting.gif';
import HippoSad from '../../assets/MascotHippoSad.gif';
import { DrillIntroSteps, QuestionRenderer, DrillSummary } from '../../components/drill/student';
import { 
  groupQuestionsByWord, 
  calculateTotalSteps, 
  calculateCurrentStep, 
  calculatePoints, 
  initializeAnswer 
} from '../../utils/drillHelpers';

const TakeDrill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drill, setDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateError, setDateError] = useState(null); 
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
  const [isTeacherPreview] = useState(() => {
    const path = window.location.pathname;
    return path.startsWith('/t/');
  });
  const [showTimer, setShowTimer] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.random());
  

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
          const questions = drillData.questions || [];
          
          // Create a map of questions by matching word content
          const questionsByWord = {};
          
          // First, group questions by their actual word content
          questions.forEach(question => {
            // Find the matching word from wordlist
            const matchingWord = words.find(word => 
              word.word.toLowerCase().trim() === (question.word || '').toLowerCase().trim()
            );
            
            if (matchingWord) {
              if (!questionsByWord[matchingWord.id]) {
                questionsByWord[matchingWord.id] = [];
              }
              
              questionsByWord[matchingWord.id].push({
                ...question,
                word: matchingWord.word,
                definition: matchingWord.definition,
                image: matchingWord.image_url,
                signVideo: matchingWord.video_url,
                word_id: matchingWord.id
              });
            } else {
              console.warn(`No matching word found for question with word: "${question.word}"`);
            }
          });
          
          // Build final array maintaining word order from wordlist
          mergedQuestions = [];
          words.forEach(word => {
            const wordQuestions = questionsByWord[word.id] || [];
            mergedQuestions.push(...wordQuestions);
          });
        } else {
          mergedQuestions = drillData.questions || [];
        }

        // Check if drill is available based on dates (only for students, not teacher preview)
        if (!isTeacherPreview) {
          const now = new Date();
          const openDate = drillData.open_date ? new Date(drillData.open_date) : null;
          const deadline = drillData.deadline ? new Date(drillData.deadline) : null;
          
          if (openDate && now < openDate) {
            const timeUntilOpen = Math.ceil((openDate - now) / (1000 * 60)); // minutes until open
            const hoursUntilOpen = Math.floor(timeUntilOpen / 60);
            const minutesUntilOpen = timeUntilOpen % 60;
            
            let timeMessage = '';
            if (hoursUntilOpen > 0) {
              timeMessage = `${hoursUntilOpen} hour${hoursUntilOpen !== 1 ? 's' : ''} and ${minutesUntilOpen} minute${minutesUntilOpen !== 1 ? 's' : ''}`;
            } else {
              timeMessage = `${minutesUntilOpen} minute${minutesUntilOpen !== 1 ? 's' : ''}`;
            }
            
            setDateError(`This drill will be available in ${timeMessage}. Please check back later!`);
            setLoading(false);
            return;
          }
          
          if (deadline && now > deadline) {
            const timeSinceExpired = Math.ceil((now - deadline) / (1000 * 60)); // minutes since expired
            const hoursSinceExpired = Math.floor(timeSinceExpired / 60);
            const minutesSinceExpired = timeSinceExpired % 60;
            
            let timeMessage = '';
            if (hoursSinceExpired > 0) {
              timeMessage = `${hoursSinceExpired} hour${hoursSinceExpired !== 1 ? 's' : ''} and ${minutesSinceExpired} minute${minutesSinceExpired !== 1 ? 's' : ''}`;
            } else {
              timeMessage = `${minutesSinceExpired} minute${minutesSinceExpired !== 1 ? 's' : ''}`;
            }
            
            setDateError(`This drill expired ${timeMessage} ago. Please contact your teacher if you believe this is an error.`);
            setLoading(false);
            return;
          }
        }

        setDrill({ ...drillData, questions: mergedQuestions });
        const groups = groupQuestionsByWord(mergedQuestions, shuffleSeed);
        setWordGroups(groups);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load drill:', error);
        setError('Failed to load drill. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDrillAndWordlist();
  }, [id, isTeacherPreview, shuffleSeed]);

  // Reset answer when question changes
  useEffect(() => {
    if (wordGroups.length > 0 && introStep === 5) {
      const currentQuestion = wordGroups[currentWordIdx]?.questions[currentQuestionIdx];
      if (currentQuestion) {
        setCurrentAnswer(initializeAnswer(currentQuestion));
      }
    }
  }, [currentWordIdx, currentQuestionIdx, introStep, wordGroups]);

  // Timer logic
  useEffect(() => {
    let intervalId;
    if (introStep === 5 && answerStatus !== 'correct') {
      // Show timer when question starts and student hasn't answered correctly yet
      setShowTimer(true);
      intervalId = setInterval(() => {
        const key = `${currentWordIdx}_${currentQuestionIdx}`;
        setTimeSpent(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }, 1000);
    } else {
      // Hide timer when not on question or when student answered correctly
      setShowTimer(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [introStep, currentWordIdx, currentQuestionIdx, answerStatus]);

  // Leaderboard fetch
  useEffect(() => {
    if (introStep === 6) {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      
      // Add a delay to ensure backend has processed the latest results
      setTimeout(() => {
        api.get(`/api/drills/${id}/results/`)
          .then(res => {
          const results = res.data || [];
          const leaderboardMap = new Map();
          results.forEach(result => {
            const studentId = result.student.id;
            const currentLatest = leaderboardMap.get(studentId);
            if (!currentLatest || result.run_number > currentLatest.run_number) {
              leaderboardMap.set(studentId, result);
            }
          });
          const leaderboardArr = Array.from(leaderboardMap.values())
            .map(result => {
              // Calculate points from question_results instead of using backend's result.points
              const calculatedPoints = (result.question_results || [])
                .reduce((sum, qr) => sum + (qr.points_awarded || 0), 0);
              
              return {
                id: result.student.id,
                name: result.student.name,
                avatar: result.student.avatar,
                points: calculatedPoints
              };
            })
            .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
          setDrillLeaderboard(leaderboardArr);
          })
          .catch(() => setLeaderboardError('Failed to load leaderboard'))
          .finally(() => setLoadingLeaderboard(false));
      }, 3000); // Wait 3 seconds for backend to process results
    }
  }, [introStep, id]);

  // Calculate progress once
  const totalSteps = wordGroups.length > 0 ? calculateTotalSteps(wordGroups) : 1;
  const currentStep = wordGroups.length > 0 
    ? calculateCurrentStep(introStep, currentWordIdx, currentQuestionIdx, wordGroups) 
    : 1;
  const progress = Math.min(((currentStep) / totalSteps) * 100, introStep === 6 ? 100 : 99);

  // Current word/question
  const currentWord = wordGroups[currentWordIdx];
  const currentQuestions = currentWord?.questions;
  const currentQuestion = currentQuestions?.[currentQuestionIdx];

  // Update handleAnswer to save points to backend
  const handleAnswer = async (answer, isCorrectOrAttempts) => {
    if (isTeacherPreview) {
      // For teacher preview, just set the answer without validation
      setCurrentAnswer(answer);
      return;
    }

    setCurrentAnswer(answer);
    const key = `${currentWordIdx}_${currentQuestionIdx}`;
    
    // Determine correctness for all question types
    let correct = false;
    let memoryGameAttempts = 0;
    
    if (currentQuestion.type === 'M') {
      correct = parseInt(answer) === parseInt(currentQuestion.answer);
    } else if (currentQuestion.type === 'F') {
      // For Blank Busters, use the isCorrect parameter passed from the component
      correct = isCorrectOrAttempts;
    } else if (currentQuestion.type === 'D') {
      // For Sentence Builder, use the isCorrect parameter passed from the component
      correct = isCorrectOrAttempts;
    } else if (currentQuestion.type === 'P') {
      correct = (answer || '').toLowerCase().trim() === (currentQuestion.answer || '').toLowerCase().trim();
    } else if (currentQuestion.type === 'G') {
      // For Memory Game, answer is always correct (all cards matched), 
      // and isCorrectOrAttempts contains the number of incorrect attempts
      correct = Array.isArray(answer) && answer.length === (currentQuestion.memoryCards?.length || 0);
      memoryGameAttempts = isCorrectOrAttempts || 0;
    }
    
    // Always submit to backend for all question types
    if (correct) {
      setAnswerStatus('correct');

      // Use memory game attempts if it's a memory game, otherwise use general attempts
      const attemptsToUse = currentQuestion.type === 'G' ? memoryGameAttempts : (attempts[key] || 0);
      const timeUsed = timeSpent[key] || 0;
      const earnedPoints = calculatePoints(attemptsToUse, timeUsed, true, currentQuestion.type);
      setPoints(prev => ({ ...prev, [key]: earnedPoints }));

      // Debug logging for memory games
      if (currentQuestion.type === 'G') {
        const timePenaltyThreshold = 10; // Memory games use 10-second threshold
        const timePenalty = Math.min(30, Math.floor(timeUsed / timePenaltyThreshold) * 0.5);
      }

      // Submit correct answer to backend
      try {
        const response = await api.post(`/api/drills/${id}/questions/${currentQuestion.id}/submit/`, {
          answer: answer,
          time_taken: timeSpent[key],
          wrong_attempts: attemptsToUse,
          points: earnedPoints,
          question_type: currentQuestion.type
        });
      } catch (error) {
        console.error(`❌ Failed to submit answer for question ID ${currentQuestion.id}:`, error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
    } else {
      setAnswerStatus('wrong');
      if (currentQuestion.type === 'M') {
        setWrongAnswers(prev => prev.includes(answer) ? prev : [...prev, answer]);
      }
      setAttempts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      
      // Submit incorrect answer to backend as well
      try {
        const response = await api.post(`/api/drills/${id}/questions/${currentQuestion.id}/submit/`, {
          answer: answer,
          time_taken: timeSpent[key],
          wrong_attempts: attempts[key] || 0,
          points: 0,
          question_type: currentQuestion.type
        });
      } catch (error) {
        console.error(`❌ Failed to submit incorrect answer for question ID ${currentQuestion.id}:`, error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
    }
  };

  const handleNext = () => {
    // Allow proceeding if it's teacher preview OR intro steps (0-4) OR if student has answered (introStep 5)
    if (isTeacherPreview || (introStep < 5) || (introStep === 5 && currentAnswer !== null)) {
      setCurrentAnswer(null);
      setAnswerStatus(null);
      setWrongAnswers([]);

      if (introStep < 5) {
        setIntroStep(introStep + 1);
      } else if (currentQuestionIdx < wordGroups[currentWordIdx]?.questions?.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else if (currentWordIdx < wordGroups.length - 1) {
        setCurrentWordIdx(currentWordIdx + 1);
        setCurrentQuestionIdx(0);
        setIntroStep(1);
      } else {
        setIntroStep(6); // Show congratulations/summary screen
        // Dispatch custom event to notify topbar to refresh points
        window.dispatchEvent(new CustomEvent('drillCompleted'));
      }
    }
  };

  const handleBack = () => navigate(-1);

  const handleRetake = () => {
    setIntroStep(0);
    setCurrentWordIdx(0);
    setCurrentQuestionIdx(0);
    setAttempts({});
    setTimeSpent({});
    setPoints({});
    setAnswerStatus(null);
    setCurrentAnswer(null);
    setWrongAnswers([]);
    // Generate new shuffle seed for different question order on retake
    // The useEffect will automatically re-run and re-shuffle when shuffleSeed changes
    setShuffleSeed(Math.random());
  };

  const handleUserSelect = (user) => setSelectedUser(user);
  const handleCloseUserModal = () => setSelectedUser(null);

  // Show full screen layout immediately with loading state
  if (loading || !drill || wordGroups.length === 0) {
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
        <div className="w-full flex items-center px-8 pt-6 mb-2 gap-6">
          <button
            className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
            onClick={handleBack}
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
            Points: {Object.values(points).reduce((a, b) => a + (b || 0), 0)}
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
              onClick={handleBack}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dateError) {
    const isNotOpen = dateError.includes('will be available');
    const isExpired = dateError.includes('expired');
    
    return (
      <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto bg-cover bg-fixed" style={{ backgroundImage: `url(${drillBg})` }}>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md text-center">
            <img 
              src={isNotOpen ? HippoWaiting : HippoSad} 
              alt={isNotOpen ? "Waiting" : "Expired"} 
              className="w-32 h-32 mx-auto mb-4" 
            />
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {isNotOpen ? 'Drill Not Yet Available' : 'Drill Has Expired'}
            </h2>
            <p className="text-gray-600 mb-6">{dateError}</p>
            
            {isNotOpen && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <i className="fa-solid fa-info-circle"></i>
                  <span className="text-sm font-medium">Tip: Check back later or contact your teacher</span>
                </div>
              </div>
            )}
            
            {isExpired && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center gap-2 text-red-700">
                  <i className="fa-solid fa-exclamation-triangle"></i>
                  <span className="text-sm font-medium">Contact your teacher if you need access</span>
                </div>
              </div>
            )}
            
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render different steps based on introStep
  if (introStep >= 0 && introStep <= 4) {
    return (
      <DrillIntroSteps
        drillBg={drillBg}
        introStep={introStep}
        drill={drill}
        currentWord={currentWord}
        progress={progress}
        points={points}
        onBack={handleBack}
        onNext={handleNext}
      />
    );
  }

  if (introStep === 5) {
    return (
      <QuestionRenderer
        drillBg={drillBg}
        currentQuestion={currentQuestion}
        progress={progress}
        points={points}
        answerStatus={answerStatus}
        currentAnswer={currentAnswer}
        wrongAnswers={wrongAnswers}
        isTeacherPreview={isTeacherPreview}
        showTimer={showTimer}
        timeSpent={timeSpent}
        currentWordIdx={currentWordIdx}
        currentQuestionIdx={currentQuestionIdx}
        onBack={handleBack}
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    );
  }

  if (introStep === 6) {
    return (
      <DrillSummary
        drillBg={drillBg}
        points={points}
        onBack={handleBack}
        onRetake={handleRetake}
        drillLeaderboard={drillLeaderboard}
        loadingLeaderboard={loadingLeaderboard}
        leaderboardError={leaderboardError}
        selectedUser={selectedUser}
        onUserSelect={handleUserSelect}
        onCloseUserModal={handleCloseUserModal}
      />
    );
  }

  return null;
};
export default TakeDrill;
