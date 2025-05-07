import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Mock data for the dashboard
const MOCK_DATA = {
  classroom: {
    name: "Class A",
    id: "A123",
    code: "XYZ123"
  },
  classStats: {
    overallScore: 68,
    gradeAverage: 71,
    workAssigned: 36,
    workAverage: 38,
    categories: [
      { name: 'Animals', score: 82 },
      { name: 'Weather', score: 71 },
      { name: 'Objects', score: 79 },
    ]
  },
  studentDistribution: {
    excelling: {
      count: 5,
      percentage: 20,
      gradeAvg: 92
    },
    onTrack: {
      count: 10,
      percentage: 40,
      gradeAvg: 80
    },
    needingHelp: {
      count: 5,
      percentage: 20,
      gradeAvg: 65
    }
  },
  students: [
    { 
      id: 1, 
      name: "Sabine Klein", 
      avatarColor: "#FFB6C1",
      drillsCompleted: 23,
      totalPoints: 450,
      excellingIn: ["Animals", "Weather"],
      strugglingIn: ["Objects"],
      needingAttention: 3,
      mastered: 12
    },
    { 
      id: 2, 
      name: "Dante Pederzana", 
      avatarColor: "#ADD8E6", 
      drillsCompleted: 53,
      totalPoints: 890,
      excellingIn: ["Objects"],
      strugglingIn: ["Animals", "Weather"],
      needingAttention: 5,
      mastered: 8
    },
    { 
      id: 3, 
      name: "Susan Chan", 
      avatarColor: "#D8BFD8", 
      drillsCompleted: 82,
      totalPoints: 1240,
      excellingIn: ["Weather", "Objects"],
      strugglingIn: [],
      needingAttention: 1,
      mastered: 15
    },
    { 
      id: 4, 
      name: "Alex Johnson", 
      avatarColor: "#90EE90", 
      drillsCompleted: 75,
      totalPoints: 980,
      excellingIn: ["Animals"],
      strugglingIn: ["Weather"],
      needingAttention: 2,
      mastered: 10
    }
  ]
};

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
  // Ensure even small numbers (1-5) have distinct visual differences
  // Scale starts from 5 and goes up progressively (min 5, max 16)
  const baseSize = 5;
  const maxSize = 16; 
  
  let size;
  if (count <= 5) {
    // Linear scale for small numbers
    size = baseSize + count;
  } else {
    // Logarithmic scale for larger numbers
    size = baseSize + 5 + Math.min(6, Math.floor(Math.log(count) * 2));
  }
  
  // Clamp size to max
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
const StudentAvatar = ({ name, color }) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  // Generate a pastel color based on name if no color provided
  const bgColor = color || `hsl(${name.charCodeAt(0) * 5}, 70%, 80%)`;
  
  return (
    <div 
      className="flex items-center justify-center rounded-full text-white font-medium"
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
  // dynamic width: base + per-item increment
  const getWidth = (c) => {
    const minW = 80; // px
    const step = 20; // px per item
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

// Main Dashboard Component
const TeacherDashboard = () => {
  const { id: classroomId } = useParams();
  const [data] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
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
            <h3 className="text-gray-500 text-sm mb-6">Overall Class </h3>
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
            <h3 className="text-gray-500 text-sm mb-6">Drill Assigned</h3>
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
              Grade average: {data.classStats.workAverage}%
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
                      Drills Completed
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
                            <StudentAvatar name={student.name} color={student.avatarColor} />
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
