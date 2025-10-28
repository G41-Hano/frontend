import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

// --- HELPER COMPONENTS (UNCHANGED LOGIC) ---

// Score Badge Component with appropriate color based on score
const ScoreBadge = ({ score }) => {
  let bgColor = "bg-red-400";
  if (score >= 80) bgColor = "bg-green-400";
  else if (score >= 50) bgColor = "bg-yellow-400";
  
  return (
    <div className={`${bgColor} text-white rounded-xl py-1 px-3 font-semibold text-center min-w-[60px]`}>
      {score}%
    </div>
  );
};

// Progress Badge Component
const ProgressBadge = ({ count, bgColor }) => {
  const baseSize = 5;
  const maxSize = 16; 
  let size;
  if (count <= 5) {
    size = baseSize + count;
  } else {
    size = baseSize + 5 + Math.min(6, Math.floor(Math.log(count) * 2));
  }
  size = Math.min(size, maxSize);
  
  return (
    <div className={`${bgColor} text-white rounded-full flex items-center justify-center font-semibold`}
      style={{ 
        width: `${size * 4}px`, 
        height: `${size * 4}px`,
        fontSize: count > 99 ? '10px' : (count > 9 ? '12px' : '14px')
      }}>
      {count}
    </div>
  );
};

// Student Avatar Component
const StudentAvatar = ({ name, avatarUrl, color }) => {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }

  const bgColor = color || `hsl(${name.charCodeAt(0) * 5}, 70%, 80%)`;
  
  return (
    <div 
      className="flex items-center justify-center rounded-full text-white font-medium w-full h-full"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

// Progress Icon Component
const ProgressIcon = ({ percentage }) => (
  <div className="relative w-20 h-20 flex items-center justify-center">
    <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
    <div 
      className="absolute inset-0 rounded-full border-4 border-[#8ED75F]"
      style={{ 
        clipPath: `polygon(0 0, 100% 0, 100% ${percentage}%, 0 ${percentage}%)` 
      }}
    ></div>
    <i className="fa-solid fa-chart-line text-[#8ED75F] text-2xl"></i>
  </div>
);

// Student Distribution Card with dynamic sizing
const DistributionCard = ({ count, percentage, gradeAvg, bgColor }) => {
  const getWidth = (c) => {
    const minW = 80; 
    const step = 20; 
    return minW + c * step;
  };

  return (
    <div
      className={`${bgColor} rounded-2xl p-6 text-white flex flex-col items-center shadow-lg`}
      style={{ width: `${getWidth(count)}px`, minHeight: '180px' }}
    >
      <div className="text-4xl font-bold">{count}</div>
      <div className="flex flex-col items-center mt-2">
        <span className="text-xl font-semibold">{percentage}%</span>
        <span className="text-sm opacity-90">of class</span>
      </div>
      <div className="flex flex-col items-center mt-4">
        <span className="text-xl font-semibold">{gradeAvg}%</span>
        <span className="text-sm opacity-90">grade avg</span>
      </div>
    </div>
  );
};

const getProgressColor = (percentage) => {
  if (percentage <= 30) return {
    bg: 'bg-[#FF6B6B]',
    wrapper: 'bg-[#FFE8E8]'
  };
  if (percentage <= 70) return {
    bg: 'bg-[#FFB946]',
    wrapper: 'bg-[#FFF4E3]'
  };
  return {
    bg: 'bg-[#82D616]',
    wrapper: 'bg-[#F1FAE9]'
  };
};

const DrillProgress = ({ percentage }) => {
  const colors = getProgressColor(percentage);
  return (
    <div className="w-35">
      <div className={`h-10 bg-white rounded-lg relative overflow-hidden`}>
        <div 
          className={`h-full ${colors.bg} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium z-10">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

// --- CONSTANTS AND INITIAL STATE ---

// MAX_POINTS_PER_STUDENT is used only for the overall dashboard score normalization.
const MAX_POINTS_PER_STUDENT = 1500; 
const MAX_DRILL_SCORE_FOR_PROFICIENCY = 100; // FIX: Use 100 points as the maximum score for a single drill proficiency calculation

const INITIAL_DATA = {
  classroom: { name: "", id: "", code: "" },
  classStats: {
    overallScore: 0,
    gradeAverage: 0,
    workAssigned: 0,
    workAverage: 0,
    categories: []
  },
  studentDistribution: {
    excelling: { count: 0, percentage: 0, gradeAvg: 0 },
    onTrack: { count: 0, percentage: 0, gradeAvg: 0 },
    needingHelp: { count: 0, percentage: 0, gradeAvg: 0 }
  },
  students: []
};


// --- MAIN DASHBOARD COMPONENT ---

const TeacherDashboard = () => {
  const { id: classroomId } = useParams();
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!classroomId) {
      setError("Classroom ID is missing.");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch concurrent core data
      const [classroomResponse, studentsResponse, pointsResponse, drillsResponse] = await Promise.all([
        api.get(`/api/classrooms/${classroomId}/`),
        api.get(`/api/classrooms/${classroomId}/students/`),
        api.get(`/api/classrooms/${classroomId}/points/`),
        api.get(`/api/drills/?classroom=${classroomId}`)
      ]);
      
      const classData = classroomResponse.data;
      const studentsList = studentsResponse.data.students || []; 
      const pointsList = pointsResponse.data.leaderboard || []; 
      const drillsList = drillsResponse.data || [];
      
      const totalStudents = studentsList.length;
      const totalDrillsAssigned = drillsList.length;

      // 2. FIX: Fetch Missing Custom Word List Names
      
      const drillWordlistMap = new Map();
      const customWordlistIdsToFetch = new Set();

      drillsList.forEach(drill => {
          const customWordlistId = drill.custom_wordlist;
          const builtinWordlistName = drill.wordlist_name;

          if (builtinWordlistName) {
              drillWordlistMap.set(drill.id, builtinWordlistName);
          } 
          if (customWordlistId && !builtinWordlistName) { 
              customWordlistIdsToFetch.add(customWordlistId);
          }
      });

      const customWordlistPromises = Array.from(customWordlistIdsToFetch).map(id => 
          api.get(`/api/wordlist/${id}/`).catch(err => {
              console.warn(`Failed to fetch custom wordlist ${id}:`, err);
              return { data: { id, name: `Custom List ID: ${id}` } }; 
          })
      );

      const customWordlistResponses = await Promise.all(customWordlistPromises);
      const customWordlistNamesMap = new Map();
      customWordlistResponses.forEach(res => {
          if (res.data?.id && res.data?.name) {
              customWordlistNamesMap.set(res.data.id, res.data.name);
          }
      });
      
      drillsList.forEach(drill => {
          const customWordlistId = drill.custom_wordlist;
          
          if (customWordlistId && !drillWordlistMap.has(drill.id)) {
              const fetchedName = customWordlistNamesMap.get(customWordlistId);
              if (fetchedName) {
                  drillWordlistMap.set(drill.id, fetchedName);
              } else {
                  drillWordlistMap.set(drill.id, `Custom List ID: ${customWordlistId}`);
              }
          }
      });
      
      // 3. Proficiency Calculation: Get Best Score Per Drill Attempt

      const resultsPromises = drillsList.map(drill => {
          // FIX: Robust catch block to prevent 404s (e.g., failed drills) from crashing Promise.all
          return api.get(`/api/drills/${drill.id}/results/`).catch(err => {
              console.warn(`Failed to fetch results for drill ${drill.id}: ${err.message}`, err);
              return { data: [] }; 
          });
      });
      const resultsResponses = await Promise.all(resultsPromises);
      
      // Structure: { studentId_drillId: maxScore }
      const bestScorePerDrillAttempt = new Map();
      const completedDrillsMap = new Map();
      
      resultsResponses.forEach(response => {
          const results = response.data || [];
          results.forEach(drillResult => {
              if (!drillResult.drill || !drillResult.student) return;
              
              const drillId = drillResult.drill; 
              const studentId = drillResult.student.id; 
              const key = `${studentId}_${drillId}`;
              const score = drillResult.points || 0;
              
              // FIX: Only store the maximum score for this unique student-drill combo
              const currentMaxScore = bestScorePerDrillAttempt.get(key) || 0;

              if (score > currentMaxScore) {
                  bestScorePerDrillAttempt.set(key, score);
              }

              // Track completed drills
              if (!completedDrillsMap.has(studentId)) {
                  completedDrillsMap.set(studentId, new Set());
              }
              completedDrillsMap.get(studentId).add(drillId);
          });
      });
      
      // 4. Group Best Scores by Word List
      const studentProficiency = new Map();
      
      drillsList.forEach(drill => {
          const drillId = drill.id;
          const wordListName = drillWordlistMap.get(drillId);

          if (!wordListName) return;

          studentsList.forEach(student => {
              const studentId = student.id;
              const key = `${studentId}_${drillId}`;
              const bestScore = bestScorePerDrillAttempt.get(key) || 0;
              
              if (bestScore > 0) {
                  if (!studentProficiency.has(studentId)) {
                      studentProficiency.set(studentId, new Map());
                  }
                  
                  const studentStats = studentProficiency.get(studentId);
                  if (!studentStats.has(wordListName)) {
                      studentStats.set(wordListName, { totalScore: 0, drillCount: 0 });
                  }
                  
                  const wordlistStats = studentStats.get(wordListName);
                  
                  // Accumulate the best score for this Word List
                  wordlistStats.totalScore += bestScore;
                  wordlistStats.drillCount += 1;
              }
          });
      });

      // 5. Finalize Proficiency Scores and Derive Excelling/Struggling Lists
      const finalizedProficiency = new Map(); 
      studentProficiency.forEach((wordlistMap, studentId) => {
          const finalMap = new Map();
          wordlistMap.forEach((stats, wordListName) => {
              const drillCount = stats.drillCount; // Already aggregated
              if (drillCount > 0) {
                  // Proficiency Score = Average Score of BEST ATTEMPTS per Drill (Normalized)
                  const avgScorePerDrill = stats.totalScore / drillCount;
                  
                  // FIX: Use 100 as the normalization base for accurate percentage calculation
                  const normalizationBase = MAX_DRILL_SCORE_FOR_PROFICIENCY; 
                  const proficiencyScore = Math.min(100, Math.round((avgScorePerDrill / normalizationBase) * 100));

                  finalMap.set(wordListName, { proficiencyScore, drillCount });
              }
          });
          finalizedProficiency.set(studentId, finalMap);
      });
      
      // 6. Build final studentsData list
      
      const pointsMap = new Map(pointsList.map(item => [item.student_id, item]));

      const studentsData = studentsList.map((student) => {
          const studentId = student.id;
          const pointsMetrics = pointsMap.get(studentId) || {};
          const wordlistProficiency = finalizedProficiency.get(studentId) || new Map();
          
          const totalPoints = pointsMetrics.total_points || 0; 
          
          const totalCompletedDrills = completedDrillsMap.has(studentId) 
                ? completedDrillsMap.get(studentId).size 
                : 0;
          
          const drillsCompletedPercent = (totalDrillsAssigned > 0) 
              ? Math.min(100, Math.round((totalCompletedDrills / totalDrillsAssigned) * 100)) 
              : 0; 

          let excellingIn = [];
          let strugglingIn = [];
          let needingAttention = 0;
          let lowProficiencyCount = 0;

          // Populate Excelling/Struggling Lists with Word List Names
          wordlistProficiency.forEach((wl, name) => {
              if (wl.drillCount >= 1) { 
                  if (wl.proficiencyScore >= 80) { // Excelling threshold (80%)
                      excellingIn.push(name);
                  } else if (wl.proficiencyScore < 60) { // Struggling threshold (below 60%)
                      strugglingIn.push(name);
                      lowProficiencyCount++;
                  }
              }
          });
          
          const hasSpecificStrugglingTag = strugglingIn.length > 0;

          if (lowProficiencyCount > 0) {
              needingAttention = Math.max(needingAttention, lowProficiencyCount * 2);
          }

          const masteredCount = totalCompletedDrills;

          return {
            id: student.id,
            name: student.name,
            avatarUrl: student.avatar,
            drillsCompleted: drillsCompletedPercent, 
            totalPoints: totalPoints,
            excellingIn: excellingIn,
            strugglingIn: strugglingIn,
            needingAttention: needingAttention,
            mastered: masteredCount
          };
      });
      
      // 7. Calculate Aggregate Class Metrics (Overall Score, Averages)
      
      let totalClassPoints = studentsData.reduce((sum, s) => sum + s.totalPoints, 0);
      const totalMaxPoints = totalStudents * MAX_POINTS_PER_STUDENT; 
      
      const overallScore = (totalMaxPoints > 0) 
          ? Math.min(100, Math.round((totalClassPoints / totalMaxPoints) * 100)) 
          : 0;
      const gradeAverage = overallScore; 
      
      const workAverage = (totalStudents > 0)
          ? Math.round(studentsData.reduce((sum, s) => sum + s.drillsCompleted, 0) / totalStudents) 
          : 0;
      
      // Student Distribution Calculation
      const excelling = studentsData.filter(s => s.totalPoints >= 1000);
      const onTrack = studentsData.filter(s => s.totalPoints >= 500 && s.totalPoints < 1000);
      const needingHelp = studentsData.filter(s => s.totalPoints < 500);

      const distribute = (list) => {
          const count = list.length;
          const percentage = (totalStudents > 0) ? Math.round((count / totalStudents) * 100) : 0;
          const gradeAvg = (count > 0) 
              ? Math.round(list.reduce((sum, s) => sum + Math.min(100, (s.totalPoints / MAX_POINTS_PER_STUDENT) * 100), 0) / count)
              : 0;
          return { count, percentage, gradeAvg };
      };

      const processedData = {
        classroom: {
          name: classData.name,
          id: classData.id,
          code: classData.class_code
        },
        classStats: {
          overallScore: overallScore,
          gradeAverage: gradeAverage,
          workAssigned: totalDrillsAssigned, 
          workAverage: workAverage, 
          categories: [] 
        },
        studentDistribution: {
          excelling: distribute(excelling),
          onTrack: distribute(onTrack),
          needingHelp: distribute(needingHelp)
        },
        students: studentsData
      };
      
      setData(processedData);
      
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e.response?.data || e.message);
      setError(`Failed to load dashboard data. Please check your network connection and API endpoints. Error: ${e.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- RENDERING ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
        <p className="ml-4 text-gray-600">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600 p-6">
        <p className="text-xl font-semibold">⚠️ Data Fetch Error</p>
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }
  
  if (!data || !data.students || data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <p className="text-xl font-semibold">No data available for this classroom.</p>
        <p className="text-sm">Ensure students are enrolled and have completed drills.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F9FC] min-h-screen">
      <div className="max-w-[95%] mx-auto py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Overall Class Score */}
          <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-3">
            <h3 className="text-gray-500 text-sm mb-6">Overall Class Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-gray-800">{data.classStats.overallScore}%</div>
              <div className="flex-shrink-0">
                <ProgressIcon percentage={data.classStats.overallScore} />
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Grade average: {data.classStats.gradeAverage}%
            </div>
          </div>

          {/* Drill Assigned */}
          <div className="bg-white rounded-3xl p-6 shadow-sm lg:col-span-3">
            <h3 className="text-gray-500 text-sm mb-6">Drills Assigned</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-gray-800">{data.classStats.workAssigned}</div>
              <div className="flex-shrink-0">
                <div className="w-20 h-20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#e5f9d7]"></div>
                  </div>
                  <div className="absolute top-0 right-0">
                    <div className="w-10 h-10 rounded-full bg-[#9ede5f]"></div>
                  </div>
                  <div className="absolute bottom-1 left-1">
                    <div className="w-8 h-8 rounded-full bg-[#f8e07a]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Avg. Completion: {data.classStats.workAverage}%
            </div>
          </div>

          {/* Student Distribution Cards */}
          <div className="lg:col-span-6">
            <div className="flex gap-0 justify-center">
              <DistributionCard 
                count={data.studentDistribution.excelling.count} 
                percentage={data.studentDistribution.excelling.percentage} 
                gradeAvg={data.studentDistribution.excelling.gradeAvg}
                bgColor="bg-[#82D616]"
              />
              <DistributionCard 
                count={data.studentDistribution.onTrack.count} 
                percentage={data.studentDistribution.onTrack.percentage} 
                gradeAvg={data.studentDistribution.onTrack.gradeAvg}
                bgColor="bg-[#FFB946]"
              />
              <DistributionCard 
                count={data.studentDistribution.needingHelp.count} 
                percentage={data.studentDistribution.needingHelp.percentage} 
                gradeAvg={data.studentDistribution.needingHelp.gradeAvg}
                bgColor="bg-[#FF6B6B]"
              />
            </div>
          </div>
        </div>

        {/* Students Proficiency Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Students Proficiency</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-transparent">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Drill Completion
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Excelling In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Struggling In</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Needing Attention</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mastered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {data.students.map(student => {
                  const { wrapper } = getProgressColor(student.drillsCompleted);
                  return (
                    <tr key={student.id} className={`${wrapper}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-3">
                            <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} />
                          </div>
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DrillProgress percentage={student.drillsCompleted} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{student.totalPoints}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {student.excellingIn.map((subject, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {student.strugglingIn.map((subject, i) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ProgressBadge count={student.needingAttention} bgColor="bg-red-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ProgressBadge count={student.mastered} bgColor="bg-green-400" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;