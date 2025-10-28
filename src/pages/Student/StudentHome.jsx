import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import HippoHappy from '../../assets/HippoIdle.gif';
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

  // Fetch recent drills and their actual points
  useEffect(() => {
    const fetchRecentDrills = async () => {
      try {
        const response = await api.get('/api/drills/');
        // Get the 5 most recent drills
        const drills = response.data.slice(0, 5);
        
        // Fetch drill results for each drill to get actual points
        const recentDrillsData = await Promise.all(
          drills.map(async (drill) => {
            try {
              // Fetch drill results for this specific drill
              const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
              const drillResults = resultsResponse.data;
              
              // Calculate total points from latest attempt for this drill
              let totalPoints = 0;
              if (drillResults && drillResults.length > 0) {
                // Find the latest attempt (highest run_number)
                const latestAttempt = drillResults.reduce((latest, current) => {
                  return (current.run_number || 0) > (latest.run_number || 0) ? current : latest;
                }, drillResults[0]);
                
                // Calculate points from the latest attempt
                if (latestAttempt.question_results) {
                  totalPoints = latestAttempt.question_results.reduce((sum, qr) => sum + (qr.points_awarded || 0), 0);
                }
              }
              
              return {
                id: drill.id,
                name: drill.title,
                points: totalPoints,
                questions: drill.questions || [] // Include questions to extract words
              };
            } catch (error) {
              console.error(`Error fetching results for drill ${drill.id}:`, error);
              return {
                id: drill.id,
                name: drill.title,
                points: 0,
                questions: drill.questions || []
              };
            }
          })
        );

        setRecentDrills(recentDrillsData);
      } catch (error) {
        console.error('Error fetching recent drills:', error);
      }
    };
    
    if (user?.id) {
      fetchRecentDrills();
    }
  }, [user?.id]); // Remove studentPoints dependency since we're fetching actual drill results

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
      if (!user?.id || recentDrills.length === 0) {
        return;
      }

      try {
        const wordStats = new Map(); // word -> { correct: 0, total: 0, attempts: [] }
        let totalQuestionsProcessed = 0;
        let wordsFound = 0;

        // Analyze each drill's results
        for (const drill of recentDrills) {
          try {
            
            // Get drill results for this specific drill
            const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
            const drillResults = resultsResponse.data || [];
            
            // Process each attempt
            drillResults.forEach(result => {
              if (result.question_results && Array.isArray(result.question_results)) {
                totalQuestionsProcessed += result.question_results.length;
                
                result.question_results.forEach((qr, qrIndex) => {
                  // Extract word from question result
                  let word = null;
                                    
                  // Try to get word from different sources
                  if (qr.question && qr.question.word) {
                    word = qr.question.word.trim();
                  } else if (qr.question && qr.question.pictureWord && Array.isArray(qr.question.pictureWord)) {
                    // For picture word questions, use the first word
                    const firstPicture = qr.question.pictureWord[0];
                    if (firstPicture && firstPicture.word) {
                      word = firstPicture.word.trim();
                    }
                  } else if (qr.question && qr.question.memoryCards && Array.isArray(qr.question.memoryCards)) {
                    // For memory game questions, use the first word
                    const firstCard = qr.question.memoryCards[0];
                    if (firstCard && firstCard.word) {
                      word = firstCard.word.trim();
                    }
                  }

                  if (word) {
                    wordsFound++;
                    if (!wordStats.has(word)) {
                      wordStats.set(word, { correct: 0, total: 0, attempts: [] });
                    }
                    
                    const stats = wordStats.get(word);
                    stats.total++;
                    stats.attempts.push({
                      correct: qr.is_correct || false,
                      points: qr.points_awarded || 0,
                      drillId: drill.id,
                      drillName: drill.name
                    });
                    
                    if (qr.is_correct) {
                      stats.correct++;
                    }
                    
                  }
                });
              }
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
                
                // Extract word from different question types
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
                    wordStats.set(word, { correct: 0, total: 0, attempts: [] });
                  }
                  
                  const stats = wordStats.get(word);
                  stats.total++;
                  stats.attempts.push({
                    correct: true, // Assume correct since drill was completed
                    points: 10, // Default points
                    drillId: drill.id,
                    drillName: drill.name
                  });
                  stats.correct++;
                }
              });
            }
          }
        }

        // Convert to arrays and calculate mastery percentages
        const wordMasteryData = Array.from(wordStats.entries()).map(([word, stats]) => {
          const masteryPercentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
          const totalAttempts = stats.total;
          const correctAttempts = stats.correct;
          
          return {
            word,
            masteryPercentage: Math.round(masteryPercentage),
            totalAttempts,
            correctAttempts,
            attempts: stats.attempts
          };
        });

        // Sort by mastery percentage (ascending for missed, descending for mastered)
        const sortedByMastery = wordMasteryData.sort((a, b) => b.masteryPercentage - a.masteryPercentage);
        
        // Get top 5 mastered words (highest mastery percentage)
        const masteredWords = sortedByMastery
          .filter(word => word.masteryPercentage >= 80 && word.totalAttempts >= 2) // At least 80% mastery and 2+ attempts
          .slice(0, 5);
        
        // Get top 5 missed words (lowest mastery percentage)
        const missedWords = sortedByMastery
          .filter(word => word.masteryPercentage < 80 && word.totalAttempts >= 2) // Less than 80% mastery and 2+ attempts
          .slice(-5)
          .reverse(); // Show most problematic first

        // Combine for display
        const combinedData = {
          mastered: masteredWords,
          missed: missedWords,
          totalWordsAnalyzed: wordMasteryData.length
        };

        setCommonlyMissedWords(combinedData);
      } catch (error) {
        console.error('Error calculating word mastery:', error);
        // Fallback to empty data
        setCommonlyMissedWords({ mastered: [], missed: [], totalWordsAnalyzed: 0 });
      }
    };

    // Add error boundary for the async function
    calculateWordMastery().catch(error => {
      console.error('Unhandled error in calculateWordMastery:', error);
      setCommonlyMissedWords({ mastered: [], missed: [], totalWordsAnalyzed: 0 });
    });
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
  const totalDrills = recentDrills.length || 1; // Use recent drills as proxy for total
  const completedPercentage = (completedDrills / Math.max(totalDrills, 1)) * 100;

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
    <div className="p-8 bg-[#EEF1F5] min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Greeting Card */}
          <div className="bg-[#FFDF9F] rounded-3xl p-8 shadow-lg flex items-center relative overflow-hidden">
             {/* Abstract shape from image */}
             <div className="absolute -right-20 -top-10 w-48 h-48 bg-white/20 rounded-full"></div>
             <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="flex-shrink-0 mr-8">
              {/* Placeholder for Hippo Image */}
              <img src={HippoHappy} alt="Hippo" className="w-40 h-40 object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#4C53B4] mb-2">
                Hi, {user?.first_name || 'Student'}!
              </h1>
              <p className="text-lg text-gray-700">Let's learn something new today</p>
            </div>
          </div>

          {/* New Drill Notification */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            {classroomsWithUnansweredDrills.length > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-700">
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
                            {index === 0 && '🎯 '}{classroom.name}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({classroom.unansweredDrillCount} drill{classroom.unansweredDrillCount > 1 ? 's' : ''})
                          </span>
                          <span className={`ml-2 text-xs ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            Due: {deadlineText}
                            {isUrgent && ' ⚠️'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button 
                  onClick={handleDoItNow} 
                  className="bg-[#D6F25A] text-[#4C53B4] font-bold px-6 py-2 rounded-full hover:bg-lime-400 transition ml-4"
                >
                  Do it Now
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-700">Great job! You're all caught up!</p>
                  <p className="text-sm text-gray-500 mt-1">No pending drills at the moment</p>
                </div>
                <button 
                  onClick={() => navigate('/s/classes')} 
                  className="bg-[#4C53B4] text-white font-bold px-6 py-2 rounded-full hover:bg-[#3a4095] transition"
                >
                  View Classes
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completed Drills */}
            <div className="bg-[#EE7B6D] rounded-2xl p-6 shadow-md text-white flex flex-col justify-between">
              <h3 className="text-xl font-bold mb-2">Completed Drills</h3>
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
              <div className="text-5xl font-extrabold mb-4">{completedDrills}</div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div className="bg-white h-3 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
              </div>
                </>
              )}
            </div>

            {/* Drill Accuracy Rate Chart */}
            <div className="bg-[#87CEEB] rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Drill Accuracy Rate</h3>
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
                  <div className="text-4xl mb-2">📊</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recently Learned Words */}
            <div className="bg-[#C3FD65] rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Recently Learned Words</h3>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-800"></div>
                </div>
              ) : recentlyLearnedWords.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">No recently learned words</p>
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
            <div className="bg-[#FFDF9F] rounded-2xl p-6 shadow-md -mt-6 md:-mt-0">
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
                  <div className="text-4xl mb-2">📚</div>
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
                                <span className="text-sm text-gray-600">{word.correctAttempts}/{word.totalAttempts}</span>
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
                                <span className="text-sm text-gray-600">{word.correctAttempts}/{word.totalAttempts}</span>
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
        <div className="w-80 flex-shrink-0 flex flex-col gap-8">
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
            className="bg-[#8A2799] rounded-2xl shadow-2xl flex flex-col items-center relative animate-fadeIn"
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