import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import HippoHappy from '../../assets/HippoIdle.gif';
import MascotHippo from '../../assets/MascotHippoWaiting.gif';
import api from '../../api';
import { DashboardSkeleton } from '../../components/loading';

const StudentHome = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);

  // New state for actual data
  const [drillStats, setDrillStats] = useState(null);
  const [studentPoints, setStudentPoints] = useState(null);
  const [recentDrills, setRecentDrills] = useState([]);
  const [vocabularyMastery, setVocabularyMastery] = useState([]);
  const [recentlyLearnedWords, setRecentlyLearnedWords] = useState([]);
  const [commonlyMissedWords, setCommonlyMissedWords] = useState({ mastered: [], missed: [], totalWordsAnalyzed: 0 });
  const [unansweredDrills, setUnansweredDrills] = useState({}); // Track unanswered drills per classroom
  const [classroomsWithUnansweredDrills, setClassroomsWithUnansweredDrills] = useState([]); // Track classrooms with unanswered drills
  const [accuracyChartData, setAccuracyChartData] = useState(null);

  // Function to check for unanswered drills in each classroom
  const checkUnansweredDrills = async () => {
    try {
      // Get all classrooms first
      const classroomsResponse = await api.get('/api/classrooms/');
      const classrooms = classroomsResponse.data || [];
      
      const unansweredData = {};
      const classroomsWithUnanswered = [];
      
      for (const classroom of classrooms) {
        try {
          // Get all drills for this classroom
          const drillsResponse = await api.get(`/api/drills/?classroom=${classroom.id}`);
          const drills = drillsResponse.data || [];
          
          // Filter for published drills that are currently open
          const now = new Date();
          const openDrills = drills.filter(drill => 
            drill.status === 'published' &&
            new Date(drill.open_date) <= now &&
            new Date(drill.deadline) >= now
          );
          
          // Check which drills the student hasn't answered and collect deadline info
          const unansweredDrillInfo = await Promise.all(
            openDrills.map(async (drill) => {
              try {
                // Check if student has any results for this drill
                const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
                const results = resultsResponse.data || [];
                
                // If no results, it's unanswered - return drill info
                if (results.length === 0) {
                  return {
                    isUnanswered: true,
                    deadline: new Date(drill.deadline),
                    drillTitle: drill.title
                  };
                }
                return { isUnanswered: false };
              } catch (error) {
                // If error fetching results, assume it's unanswered
                return {
                  isUnanswered: true,
                  deadline: new Date(drill.deadline),
                  drillTitle: drill.title
                };
              }
            })
          );
          
          const unansweredDrills = unansweredDrillInfo.filter(info => info.isUnanswered);
          const count = unansweredDrills.length;
          unansweredData[classroom.id] = count;
          
          // If this classroom has unanswered drills, add it to the list with deadline info
          if (count > 0) {
            // Find the earliest deadline among unanswered drills
            const earliestDeadline = Math.min(...unansweredDrills.map(drill => drill.deadline.getTime()));
            
            classroomsWithUnanswered.push({
              ...classroom,
              earliestDeadline: new Date(earliestDeadline),
              unansweredDrillCount: count
            });
          }
        } catch (error) {
          console.error(`Error checking drills for classroom ${classroom.id}:`, error);
          unansweredData[classroom.id] = 0;
        }
      }
      
      // Sort classrooms by earliest deadline (most urgent first)
      classroomsWithUnanswered.sort((a, b) => a.earliestDeadline - b.earliestDeadline);
      
      setUnansweredDrills(unansweredData);
      setClassroomsWithUnansweredDrills(classroomsWithUnanswered);
    } catch (error) {
      console.error('Error checking unanswered drills:', error);
    }
  };

  // Check for unanswered drills when component loads
  useEffect(() => {
    if (user?.id) {
      checkUnansweredDrills();
    }
  }, [user?.id]);

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await api.get('/api/badges/');
        setBadges(response.data);
      } catch (error) {
        console.error('Error fetching badges:', error);
      }
    };
    if (user?.id) {
      fetchBadges();
    }
  }, [user?.id]);

  // Fetch drill statistics
  useEffect(() => {
    const fetchDrillStats = async () => {
      try {
        const response = await api.get('/api/badges/drill-statistics/');
        setDrillStats(response.data);
      } catch (error) {
        console.error('Error fetching drill statistics:', error);
      }
    };
    if (user?.id) {
      fetchDrillStats();
    }
  }, [user?.id]);

  // Fetch student points data
  useEffect(() => {
    const fetchStudentPoints = async () => {
      try {
        const response = await api.get('/api/badges/all-student-points/');
        setStudentPoints(response.data);
      } catch (error) {
        console.error('Error fetching student points:', error);
      }
    };
    if (user?.id) {
      fetchStudentPoints();
    }
  }, [user?.id]);

  // Fetch recent drills and their actual points - ONLY ANSWERED DRILLS
  useEffect(() => {
    const fetchRecentDrills = async () => {
      try {
        const response = await api.get('/api/drills/');
        const drills = response.data;
        
        // Fetch drill results for each drill to get actual points
        const recentDrillsData = await Promise.all(
          drills.map(async (drill) => {
            try {
              // Fetch drill results for this specific drill
              const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
              const drillResults = resultsResponse.data;
              
              // ONLY include drills that have been answered (have results)
              if (!drillResults || drillResults.length === 0) {
                return null; // Skip unanswered drills
              }
              
              // Calculate total points from latest attempt for this drill
              let totalPoints = 0;
              // Find the latest attempt (highest run_number)
              const latestAttempt = drillResults.reduce((latest, current) => {
                return (current.run_number || 0) > (latest.run_number || 0) ? current : latest;
              }, drillResults[0]);
              
              // Calculate points from the latest attempt
              if (latestAttempt.question_results) {
                totalPoints = latestAttempt.question_results.reduce((sum, qr) => sum + (qr.points_awarded || 0), 0);
              }
              
              return {
                id: drill.id,
                name: drill.title,
                points: totalPoints,
                questions: drill.questions || [], // Include questions to extract words
                hasAnswered: true // Mark as answered
              };
            } catch (error) {
              console.error(`Error fetching results for drill ${drill.id}:`, error);
              return null; // Skip drills with errors
            }
          })
        );

        // Filter out null values (unanswered drills) and get the 5 most recent answered drills
        const answeredDrills = recentDrillsData.filter(drill => drill !== null).slice(0, 5);
        setRecentDrills(answeredDrills);
      } catch (error) {
        console.error('Error fetching recent drills:', error);
      }
    };
    
    if (user?.id) {
      fetchRecentDrills();
    }
  }, [user?.id]);

  // Calculate vocabulary mastery from drill statistics
  useEffect(() => {
    if (drillStats && drillStats.classroom_statistics) {
      // This is a simplified calculation - in a real implementation,
      // you'd want to analyze individual question results to get word-level mastery
      const masteryData = drillStats.classroom_statistics.map(classroom => ({
        word: classroom.classroom_name,
        level: Math.round(classroom.accuracy || 0)
      }));
      setVocabularyMastery(masteryData.slice(0, 4)); // Show top 4
    }
  }, [drillStats]);

  // Extract recently learned words from drill questions
  useEffect(() => {
    if (recentDrills.length > 0) {
      const allWords = [];
      
      // Extract words from all drill questions
      recentDrills.forEach(drill => {
        if (drill.questions && Array.isArray(drill.questions)) {
          drill.questions.forEach(question => {
            // Extract word from different question types
            if (question.word && question.word.trim()) {
              allWords.push(question.word.trim());
            }
            
            // For Picture Word questions, extract words from pictureWord array
            if (question.type === 'P' && question.pictureWord && Array.isArray(question.pictureWord)) {
              question.pictureWord.forEach(picture => {
                if (picture.word && picture.word.trim()) {
                  allWords.push(picture.word.trim());
                }
              });
            }
            
            // For Memory Game questions, extract words from memoryCards array
            if (question.type === 'G' && question.memoryCards && Array.isArray(question.memoryCards)) {
              question.memoryCards.forEach(card => {
                if (card.word && card.word.trim()) {
                  allWords.push(card.word.trim());
                }
              });
            }
          });
        }
      });
      
      // Remove duplicates and get unique words
      const uniqueWords = [...new Set(allWords)];
      
      // Take the first 5 unique words
      setRecentlyLearnedWords(uniqueWords.slice(0, 5));
    }
  }, [recentDrills]);

  // Calculate word mastery from actual drill results
  useEffect(() => {
    const calculateWordMastery = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const wordStats = new Map(); // word -> { attemptCount: number }
        let wordsFound = 0;

        // Analyze each drill's results - use ALL answered drills, not just recent ones
        const drillsToAnalyze = recentDrills.length > 0 ? recentDrills : [];
        
        if (drillsToAnalyze.length === 0) {
          setCommonlyMissedWords({ mastered: [], missed: [], totalWordsAnalyzed: 0 });
          return;
        }

        // Analyze each drill's results
        for (const drill of drillsToAnalyze) {
          try {
            // Get drill results for this specific drill
            const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
            const drillResults = resultsResponse.data || [];
            
            // Track which words appear in which attempts
            const wordsByAttempt = new Map(); // word -> Set of attempt numbers
            
            drillResults.forEach(result => {
              if (result.question_results && Array.isArray(result.question_results)) {
                result.question_results.forEach((qr) => {
                  let word = null;
                  
                  // Extract word from question result
                  if (qr.question && qr.question.word) {
                    word = qr.question.word.trim();
                  } else if (qr.question && qr.question.pictureWord && Array.isArray(qr.question.pictureWord)) {
                    const firstPicture = qr.question.pictureWord[0];
                    if (firstPicture && firstPicture.word) {
                      word = firstPicture.word.trim();
                    }
                  } else if (qr.question && qr.question.memoryCards && Array.isArray(qr.question.memoryCards)) {
                    const firstCard = qr.question.memoryCards[0];
                    if (firstCard && firstCard.word) {
                      word = firstCard.word.trim();
                    }
                  }

                  if (word) {
                    wordsFound++;
                    if (!wordsByAttempt.has(word)) {
                      wordsByAttempt.set(word, new Set());
                    }
                    // Track which attempt this word was answered in
                    wordsByAttempt.get(word).add(result.run_number || 1);
                  }
                });
              }
            });
            
            // Convert to word stats (number of attempts to master each word)
            wordsByAttempt.forEach((attempts, word) => {
              if (!wordStats.has(word)) {
                wordStats.set(word, { attempts: attempts.size, drills: [] });
              }
              const stats = wordStats.get(word);
              stats.drills.push(drill.id);
            });
          } catch (error) {
            console.error(`Error analyzing drill ${drill.id} for word mastery:`, error);
          }
        }

        // If no words found from question results, try extracting from drill questions directly
        if (wordsFound === 0) {
          for (const drill of recentDrills) {
            if (drill.questions && Array.isArray(drill.questions)) {
              drill.questions.forEach(question => {
                let word = null;
                
                if (question.word && question.word.trim()) {
                  word = question.word.trim();
                } else if (question.type === 'P' && question.pictureWord && Array.isArray(question.pictureWord)) {
                  const firstPicture = question.pictureWord[0];
                  if (firstPicture && firstPicture.word) {
                    word = firstPicture.word.trim();
                  }
                } else if (question.type === 'G' && question.memoryCards && Array.isArray(question.memoryCards)) {
                  const firstCard = question.memoryCards[0];
                  if (firstCard && firstCard.word) {
                    word = firstCard.word.trim();
                  }
                }
                
                if (word) {
                  if (!wordStats.has(word)) {
                    wordStats.set(word, { attempts: 1, drills: [drill.id] });
                  }
                }
              });
            }
          }
        }

        // Convert to arrays and calculate mastery based on attempt count
        const wordMasteryData = Array.from(wordStats.entries()).map(([word, stats]) => {
          // Mastery: fewer attempts = better mastery
          // 1 attempt = 100%, 2 attempts = 80%, 3+ attempts = 60%
          let masteryPercentage = 100;
          if (stats.attempts === 2) masteryPercentage = 80;
          else if (stats.attempts >= 3) masteryPercentage = 60;
          
          return {
            word,
            masteryPercentage,
            totalAttempts: stats.attempts,
            correctAttempts: 1 // Always 1 since they eventually got it right
          };
        });

        // Sort by mastery percentage (descending)
        const sortedByMastery = wordMasteryData.sort((a, b) => b.masteryPercentage - a.masteryPercentage);
        
        // Get top 5 mastered words (100% mastery - answered on first try)
        const masteredWords = sortedByMastery
          .filter(word => word.masteryPercentage === 100)
          .slice(0, 5);
        
        // Get words needing practice (answered in 2+ attempts)
        const missedWords = sortedByMastery
          .filter(word => word.masteryPercentage < 100)
          .slice(0, 5);

        // Combine for display
        const combinedData = {
          mastered: masteredWords,
          missed: missedWords,
          totalWordsAnalyzed: wordMasteryData.length
        };

        setCommonlyMissedWords(combinedData);
      } catch (error) {
        console.error('Error calculating word mastery:', error);
        setCommonlyMissedWords({ mastered: [], missed: [], totalWordsAnalyzed: 0 });
      }
    };

    calculateWordMastery();
  }, [user?.id, recentDrills]);

  // Calculate accuracy rates by attempt
  useEffect(() => {
    const calculateAccuracyByAttempt = async () => {
      try {
        if (!user?.id || recentDrills.length === 0) {
          setAccuracyChartData(null);
          return;
        }

        // Get all drill results for the user
        const allResults = [];
        for (const drill of recentDrills) {
          try {
            const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
            const drillResults = resultsResponse.data || [];
            allResults.push(...drillResults);
          } catch (error) {
            console.error(`Error fetching results for drill ${drill.id}:`, error);
          }
        }

        // Group results by attempt number (run_number)
        const attemptGroups = {};
        allResults.forEach(result => {
          const attemptNum = result.run_number;
          if (!attemptGroups[attemptNum]) {
            attemptGroups[attemptNum] = [];
          }
          attemptGroups[attemptNum].push(result);
        });

        // Calculate accuracy rate for each attempt (limit to first 10 attempts)
        const accuracyData = [];
        const sortedAttempts = Object.keys(attemptGroups).sort((a, b) => parseInt(a) - parseInt(b));
        const limitedAttempts = sortedAttempts.slice(0, 5); // Only show first 10 attempts
        
        limitedAttempts.forEach(attemptNum => {
          const results = attemptGroups[attemptNum];
          let totalQuestions = 0;
          let correctQuestions = 0;

          let totalPointsPossible = 0;
          let totalPointsEarned = 0;

          results.forEach(result => {
            if (result.question_results) {
              result.question_results.forEach(qr => {
                // Each question has a maximum of 100 points (base points)
                const maxPointsForQuestion = 100;
                totalPointsPossible += maxPointsForQuestion;
                totalPointsEarned += qr.points_awarded || 0;
              });
            }
          });

          // Calculate accuracy as percentage of points earned vs total possible
          const accuracyRate = totalPointsPossible > 0 ? (totalPointsEarned / totalPointsPossible) * 100 : 0;
          
          accuracyData.push({
            attempt: parseInt(attemptNum),
            accuracyRate: Math.round(accuracyRate),
            totalPointsPossible,
            totalPointsEarned
          });
        });

        setAccuracyChartData(accuracyData);
      } catch (error) {
        console.error('Error calculating accuracy by attempt:', error);
        setAccuracyChartData(null);
      }
    };

    calculateAccuracyByAttempt();
  }, [user?.id, recentDrills]);

  // Calculate completed drills and percentage
  const completedDrills = drillStats?.total_completed_drills || 0;
  // Calculate total drills: completed + pending (from unansweredDrills count)
  const totalPendingDrills = Object.values(unansweredDrills).reduce((sum, count) => sum + count, 0);
  const totalDrills = completedDrills + totalPendingDrills || 1;
  const completedPercentage = Math.min((completedDrills / Math.max(totalDrills, 1)) * 100, 100); // Cap at 100%

  // Handle "Do it Now" button click
  const handleDoItNow = () => {
    if (classroomsWithUnansweredDrills.length > 0) {
      // Redirect to the first classroom with unanswered drills
      const classroom = classroomsWithUnansweredDrills[0];
      navigate(`/s/classes/${classroom.id}/`);
    } else {
      // Fallback to general classes page
      navigate('/s/classes');
    }
  };

  // Update loading state when all data is loaded
  useEffect(() => {
    if (badges.length > 0 || drillStats || studentPoints) {
      setLoading(false);
    }
  }, [badges, drillStats, studentPoints]);


  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#EEF1F5] min-h-[calc(100vh-64px)] font-baloo">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 lg:gap-8">
          {/* Greeting Card */}
          <div className="bg-[#FFDF9F] rounded-3xl p-3 sm:p-3 lg:p-4 shadow-lg flex flex-col sm:flex-row items-center relative overflow-hidden gap-2 sm:gap-3">
             {/* Abstract shape from image */}
             <div className="absolute -right-20 -top-10 w-48 h-48 bg-white/20 rounded-full"></div>
             <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="flex-shrink-0 sm:mb-4 sm:ml-8 sm:mr-8 overflow-hidden">
              {/* Placeholder for Hippo Image */}
              <img src={MascotHippo} alt="Hippo" className="w-32 sm:w-44 h-32 sm:h-44 object-cover object-center scale-150 mb-6" />
            </div>
            <div className="text-center sm:text-left relative">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl text-[#4C53B4] mb-2 font-baloo font-bold">
                Hi, {user?.first_name || 'Student'}!
              </h1>
              <p className="text-base sm:text-xl text-gray-700 font-baloo font-semibold">Let's learn something new today</p>
            </div>
          </div>

          {/* New Drill Notification */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md">
            {classroomsWithUnansweredDrills.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-semibold text-gray-700">
                    You have {classroomsWithUnansweredDrills.length} classroom{classroomsWithUnansweredDrills.length > 1 ? 's' : ''} with pending drills!
                  </p>
                  <div className="mt-2 space-y-1">
                    {classroomsWithUnansweredDrills.map((classroom, index) => {
                      const deadlineDate = classroom.earliestDeadline;
                      const isUrgent = deadlineDate.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000; // Less than 24 hours
                      const deadlineText = deadlineDate.toLocaleDateString() + ' ' + deadlineDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      
                      return (
                        <div key={classroom.id} className={`text-sm ${index === 0 ? 'font-medium' : ''}`}>
                          <span className={`${index === 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                            {index === 0 && <i className="fa-solid fa-bullseye text-orange-600 mr-1"></i>}{classroom.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({classroom.unansweredDrillCount} drill{classroom.unansweredDrillCount > 1 ? 's' : ''})
                          </span>
                          <span className={`ml-2 text-xs ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            Due: {deadlineText}
                            {isUrgent && <i className="fa-solid fa-triangle-exclamation text-red-600 ml-1"></i>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button 
                  onClick={handleDoItNow} 
                  className="bg-[#D6F25A] text-[#4C53B4] font-bold px-6 py-2 rounded-full hover:bg-lime-400 transition w-full sm:w-auto"
                >
                  Do it Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-base sm:text-lg font-semibold text-gray-700">Great job! You're all caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No pending drills at the moment</p>
                </div>
                <button 
                  onClick={() => navigate('/s/classes')} 
                  className="bg-[#4C53B4] text-white font-bold px-6 py-2 rounded-full hover:bg-[#3a4095] transition w-full sm:w-auto"
                >
                  View Classes
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Completed Drills */}
            <div className="bg-gradient-to-br from-[#EE7B6D] to-[#E85D4D] rounded-3xl p-4 sm:p-6 shadow-lg text-white flex flex-col justify-between relative overflow-hidden min-h-[280px]">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <h3 className="text-2xl sm:text-xl font-bold mb-4">Completed Drills</h3>
                {loading ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-6xl sm:text-7xl font-extrabold">{completedDrills}</div>
                    </div>
                    <div className="space-y-2 mt-auto">
                      <div className="w-full bg-white/30 rounded-full h-2">
                        <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${completedPercentage}%` }}></div>
                      </div>
                      <p className="text-sm text-white/80">{Math.round(completedPercentage)}% Complete</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Drill Accuracy Rate Chart */}
            <div className="bg-gradient-to-br from-[#87CEEB] to-[#5DADE2] rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Drill Accuracy Rate</h3>
                <span className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-full">
                  First 5 attempts
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-800"></div>
                </div>
              ) : !accuracyChartData || accuracyChartData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2"><i className="fa-solid fa-chart-bar text-gray-600"></i></div>
                  <p className="text-gray-600">No drill attempts yet</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Chart Container */}
                  <div className="relative h-48 bg-white/30 rounded-lg p-4">
                    {/* Chart Area */}
                    <div className="relative h-40">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600">
                        <span>100%</span>
                        <span>75%</span>
                        <span>50%</span>
                        <span>25%</span>
                        <span>0%</span>
                      </div>
                      
                      {/* Chart Content */}
                      <div className="ml-8 h-full relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0">
                          {[0, 25, 50, 75, 100].map((value, index) => (
                            <div
                              key={index}
                              className="absolute w-full border-t border-white/20"
                              style={{ top: `${100 - value}%` }}
                            ></div>
                          ))}
                        </div>
                        
                        {/* Simple Bar Chart */}
                        <div className="relative h-40 flex items-end justify-between px-4 gap-2">
                          {accuracyChartData.map((data, index) => {
                            const colors = ['#3B82F6', '#F97316', '#EAB308', '#22C55E', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#6B7280']; // Extended color palette
                            const color = colors[index % colors.length];
                            
                            return (
                              <div key={data.attempt} className="flex flex-col items-center flex-1 min-w-0 h-full">
                                {/* Chart Area Container */}
                                <div className="flex flex-col justify-end h-full w-12 relative">
                                  {/* Bar - height calculated as percentage of container */}
                                  <div
                                    className="w-full rounded-t shadow-sm border border-white/20 relative"
                                    style={{
                                      height: `${data.accuracyRate}%`,
                                      backgroundColor: color,
                                      minHeight: '4px'
                                    }}
                                  >
                                    {/* Percentage label positioned at top of bar */}
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-800 whitespace-nowrap">
                                      {data.accuracyRate}%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {accuracyChartData.map((data, index) => {
                      const colors = ['#3B82F6', '#F97316', '#EAB308', '#22C55E', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#6B7280'];
                      const color = colors[index % colors.length];
                      return (
                        <div key={data.attempt} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {data.attempt}{data.attempt === 1 ? 'st' : data.attempt === 2 ? 'nd' : data.attempt === 3 ? 'rd' : 'th'} Attempt
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recently Learned Words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Recently Learned Words */}
            <div className="bg-[#C3FD65] rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recently Learned Words</h3>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-800"></div>
                </div>
              ) : recentlyLearnedWords.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recently learned words</p>
                </div>
              ) : (
              <ul className="space-y-2 text-gray-700">
                {recentlyLearnedWords.map((word, index) => (
                  <li key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">{word}</li>
                ))}
              </ul>
              )}
            </div>

            {/* Word Mastery Analysis */}
            <div className="bg-[#FFDF9F] rounded-2xl p-6 shadow-md -mt-6 md:-mt- mt-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#4C53B4]">Word Mastery Analysis</h3>
                {commonlyMissedWords && commonlyMissedWords.totalWordsAnalyzed > 0 && (
                  <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                    {commonlyMissedWords.totalWordsAnalyzed} words analyzed
                  </span>
                )}
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#4C53B4]"></div>
                </div>
              ) : !commonlyMissedWords || commonlyMissedWords.totalWordsAnalyzed === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2"><i className="fa-solid fa-book text-gray-600"></i></div>
                  <p className="text-gray-600 mb-2">No word analysis data available</p>
                  <p className="text-sm text-gray-500">Complete some drills to see your word mastery progress</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Mastered Words Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-[#C3FD65] rounded-full"></div>
                      <h4 className="font-semibold text-[#4C53B4]">Mastered Words (80%+ accuracy)</h4>
                    </div>
                    {!commonlyMissedWords.mastered || commonlyMissedWords.mastered.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No words mastered yet (need 80%+ accuracy with 2+ attempts)</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {commonlyMissedWords.mastered.map((word, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{word.word}</span>
                              <div className="flex items-center gap-2">
                                 {/*<span className="text-sm text-gray-600">{word.correctAttempts}/{word.totalAttempts}</span> */}
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-[#C3FD65] h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${word.masteryPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-[#4C53B4]">{word.masteryPercentage}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missed Words Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-[#EE7B6D] rounded-full"></div>
                      <h4 className="font-semibold text-[#EE7B6D]">Words Needing Practice (&lt;80% accuracy)</h4>
                    </div>
                    {!commonlyMissedWords.missed || commonlyMissedWords.missed.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Great job! All analyzed words are mastered</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {commonlyMissedWords.missed.map((word, index) => (
                          <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-800">{word.word}</span>
                              <div className="flex items-center gap-2">
                               {/* <span className="text-sm text-gray-600">{word.correctAttempts}/{word.totalAttempts}</span>*/}
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-[#EE7B6D] h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${word.masteryPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-semibold text-[#EE7B6D]">{word.masteryPercentage}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 lg:gap-8">
          {/* Recent Badges Section */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#e09b1a]">Recent Badges</h3>
              <button 
                onClick={() => navigate('/s/badges')}
                className="text-sm text-gray-500 hover:underline"
              >
                See More
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4C53B4]"></div>
              </div>
            ) : badges.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No badges earned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {badges.slice(0, 4).map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-20 h-20 object-contain mb-2 drop-shadow-md"
                    />
                    <p className="text-xs font-semibold text-gray-700">{badge.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Drills Section */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#8A2799]">Recent Drills</h3>
              <button 
                onClick={() => navigate('/s/classes')}
                className="text-sm text-gray-500 hover:underline"
              >
                See More
              </button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4C53B4]"></div>
              </div>
            ) : recentDrills.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent drills</p>
            </div>
            ) : (
            <ul className="space-y-3">
               {recentDrills.map(drill => (
                  <li key={drill.id} className="flex items-center justify-between p-3 bg-[#EEF1F5] rounded-lg">
                     <span className="text-gray-700 text-sm font-medium">{drill.name}</span>
                       <span className="text-[#8A2799] font-bold text-sm">{drill.points} pts</span>
                  </li>
               ))}
            </ul>
            )}
          </div>
        </div>
      </div>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-[#8A2799] rounded-2xl shadow-2xl flex flex-col items-center relative"
            style={{
              width: '700px',
              maxWidth: '98vw',
              border: '6px solid #781B86',
              borderRadius: '32px',
              padding: '2.5rem 2.5rem 2rem 2.5rem',
            }}
          >
            <h2
              className="mb-0 text-center"
              style={{
                fontSize: '3.2rem',
                color: '#C3FD65',
                WebkitTextStroke: '2px #557423',
                textStroke: '2px #557423',
                fontWeight: 1000,
                letterSpacing: '1px',
                textShadow: '0 2px 8px #55742344',
              }}
            >
              Badge Earned!
            </h2>
            <p className="text-white text-center text-lg mt-0">Congratulations on earning this badge!</p>
            <div className="relative flex items-center justify-center mb-4" style={{ minHeight: '220px', minWidth: '220px' }}>
              <img
                src={selectedBadge.image}
                alt={selectedBadge.name}
                className="w-48 h-48 object-contain drop-shadow-lg relative z-10"
              />
            </div>
            <h3 className="text-3xl font-extrabold text-yellow-300 mb-2 text-center" style={{ fontSize: '2.5rem' }}>{selectedBadge.name}</h3>
            <p className="text-white text-center text-base mb-6" style={{ fontSize: '1rem' }}>{selectedBadge.description}</p>
            <button
              className="bg-[#FBE18F] text-[#7B3FA0] font-bold px-8 py-2 rounded-full shadow hover:bg-yellow-300 transition text-lg"
              onClick={() => setSelectedBadge(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;