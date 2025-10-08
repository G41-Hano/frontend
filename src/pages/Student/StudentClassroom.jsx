import { useState, useEffect, useRef } from 'react';
import BadgeEarnedModal from '../../components/BadgeEarnedModal';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { useClassroomPreferences } from '../../contexts/ClassroomPreferencesContext';
import drillBg from '../../assets/drill_bg.png';
import { DrillSkeleton, ClassroomSkeleton } from '../../components/loading';
import Skeleton from '../../components/Skeleton';

// Helper function to format dates consistently
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  // Parse the date string and format it consistently
  const date = new Date(dateString);
  
  // Use a more consistent formatting approach
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleString('en-US', options);
};

// Helper functions for drill availability
const getDrillAvailabilityStatus = (drill) => {
  const now = new Date();
  const openDate = drill.open_date ? new Date(drill.open_date) : null;
  const deadline = drill.deadline ? new Date(drill.deadline) : null;
  
  if (openDate && now < openDate) {
    return {
      status: 'not_open',
      message: `Opens at ${formatDateTime(drill.open_date)}`,
      canAccess: false
    };
  }
  
  if (deadline && now > deadline) {
    return {
      status: 'expired',
      message: `Expired on ${formatDateTime(drill.deadline)}`,
      canAccess: false
    };
  }
  
  return {
    status: 'available',
    message: 'Available now',
    canAccess: true
  };
};

// Student List Modal Component
const StudentListModal = ({ isOpen, onClose, students }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 relative animate-scaleIn">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Enrolled Students</h2>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No students enrolled yet</p>
          ) : (
            students.map((student) => (
              <div 
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#4C53B4] flex items-center justify-center text-white font-medium">
                  {student.name?.[0]?.toUpperCase() || student.username[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-gray-800 font-medium">
                    {student.name}
                  </h3>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StudentClassroom = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('drills');
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDrillId, setOpenDrillId] = useState(null);
  const { getClassroomColor } = useClassroomPreferences();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [drillResults, setDrillResults] = useState({});
  const [studentDrillResults, setStudentDrillResults] = useState({});
  const [openMenuDrillId, setOpenMenuDrillId] = useState(null);
  const menuRef = useRef();

  // Sort drills: older drills first, newer drills last
  const getSortedDrills = (drillsToSort) => {
    return [...drillsToSort].sort((a, b) => {
      // Sort by ID (older first, newer last)
      return a.id - b.id;
    });
  };

  // Toggle drill panel open/close
  const toggleDrillPanel = (drillId) => {
    setOpenDrillId(openDrillId === drillId ? null : drillId);
  };

  // Fetch drill results for a specific drill
   const fetchDrillResults = async (drillId) => {
    try {
      const response = await api.get(`/api/drills/${drillId}/results/`);
      
      const drillResultsForStudent = response.data; // Should contain only the current student's results

      if (drillResultsForStudent.length > 0) {
        // Find the best attempt (highest score)
        const bestAttempt = drillResultsForStudent.reduce((best, current) => {
          return (best.points || 0) > (current.points || 0) ? best : current;
        }, drillResultsForStudent[0]); // Initialize with the first result

        // Calculate total points for the best attempt by summing points_awarded from question_results
        const totalPointsForBestAttempt = (bestAttempt.question_results || []).reduce((sum, qr) => sum + (qr.points_awarded || 0), 0);
        setDrillResults(prev => ({ ...prev, [drillId]: totalPointsForBestAttempt }));

      } else {
        // No results for this drill for the current student
        setDrillResults(prev => ({ ...prev, [drillId]: 0 }));
      }

    } catch (error) {
      console.error('Error fetching drill results for drill', drillId, ':', error.response?.data || error.message);
      setDrillResults(prev => ({ ...prev, [drillId]: 0 }));
    }
  };

  // Fetch current student's results for a specific drill (student-specific endpoint)
  const fetchDrillResultsForStudent = async (drillId) => {
    try {
      const response = await api.get(`/api/drills/${drillId}/results/student/`);

      // Normalize possible response shapes into an array of attempts
      const raw = response.data;
      const attempts = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.results)
          ? raw.results
          : raw
            ? [raw]
            : [];

      if (attempts.length > 0) {
        const getAttemptTotal = (attempt) => (attempt.question_results || [])
          .reduce((sum, qr) => sum + (qr.points_awarded || 0), 0);

        // Find the latest attempt (highest run_number)
        const latestAttempt = attempts.reduce((latest, current) => {
          return (current.run_number || 0) > (latest.run_number || 0) ? current : latest;
        }, attempts[0]);

        const totalPointsForLatestAttempt = getAttemptTotal(latestAttempt);
        setStudentDrillResults(prev => ({ ...prev, [drillId]: totalPointsForLatestAttempt }));
      } else {
        // No attempts for this drill for the current student
        setStudentDrillResults(prev => ({ ...prev, [drillId]: 0 }));
      }

    } catch (error) {
      console.error('Error fetching student drill results for drill', drillId, ':', error.response?.data || error.message);
      setStudentDrillResults(prev => ({ ...prev, [drillId]: 0 }));
    }
  };

  // Fetch classroom and students data
  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        setLoading(true);
        const [classroomResponse, studentsResponse] = await Promise.all([
          api.get(`/api/classrooms/${id}/`),
          api.get(`/api/classrooms/${id}/students/`)
        ]);
        setClassroom(classroomResponse.data);
        const studentData = Array.isArray(studentsResponse.data) ? studentsResponse.data : 
                        Array.isArray(studentsResponse.data?.students) ? studentsResponse.data.students : [];
        setStudents(studentData);
        
        // Fetch available drills for this classroom
        const drillsResponse = await api.get('/api/drills/', {
          params: { classroom: id }
        });
        
        // Filter only published drills
        const publishedDrills = drillsResponse.data.filter(drill => drill.status === 'published');
        setDrills(publishedDrills);

        // Fetch results for each drill
        for (const drill of publishedDrills) {
          await fetchDrillResults(drill.id);
          await fetchDrillResultsForStudent(drill.id);
        }
        
        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(err.response?.data?.error || 'Failed to fetch classroom');
        setClassroom(null);
        setLoading(false);
      }
    };

    fetchClassroomData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'leaderboard' && classroom?.id) {
      setLoadingLeaderboard(true);
      api.get(`/api/classrooms/${classroom.id}/points/`)
        .then(res => {
          // Filter out students with 0 points (no participation)
          const filteredLeaderboard = res.data.leaderboard
            .filter(student => student.total_points > 0)
            .map(student => ({
              id: student.student_id,
              first_name: student.student_name.split(' ')[0], // crude split, adjust if needed
              avatar: student.avatar || null, // if available from backend
              points: student.total_points
            }));
          setLeaderboard(filteredLeaderboard);
        })
        .catch(() => setLeaderboard([]))
        .finally(() => setLoadingLeaderboard(false));
    }
  }, [activeTab, classroom]);

  // Get color when rendering
  const classroomColor = classroom?.id ? getClassroomColor(classroom.id, id) : '#7D83D7';

  const handleMenuClick = (drillId) => {
    setOpenMenuDrillId(openMenuDrillId === drillId ? null : drillId);
  };

  const handleShowLeaderboard = (drillId) => {
    navigate(`/s/drill/${drillId}/leaderboard`);
    setOpenMenuDrillId(null);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuDrillId(null);
      }
    };
    if (openMenuDrillId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuDrillId]);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <p className="text-red-600 flex items-center gap-2">
            <i className="fa-solid fa-face-frown"></i>
            {error}
          </p>
          <button 
            onClick={() => navigate('/s/classes')}
            className="mt-4 text-sm text-red-600 hover:text-red-800 flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  if (!classroom) return (
    <div className="min-h-screen bg-[#EEF1F5] p-4">
      <div className="max-w-[95%] mx-auto">
        <ClassroomSkeleton />
        <div className="mt-6 bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6"><Skeleton className="h-8 w-1/4" /></h2>
          <div className="space-y-4">
            <DrillSkeleton />
            <DrillSkeleton />
            <DrillSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
  const tabs = [
    { id: 'drills', label: 'Drills', icon: 'fa-dumbbell' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'fa-trophy' }
  ];

  return (
    <>
      {/* Badge Earned Modal always frontmost */}
      <BadgeEarnedModal onViewBadges={() => navigate('/s/badges')} />
      <div className="min-h-screen bg-[#EEF1F5]">
      {/* Header */}
      <div className="bg-white shadow-lg mt-6 rounded-2xl mx-10 pb-6" style={{ borderColor: classroomColor }}>
        <div className="max-w-[95%] mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-6 text-gray-600 hover:text-[#4C53B4] transition-colors group"
          >
            <i className="fa-solid fa-arrow-left transform group-hover:-translate-x-1 transition-transform"></i>
            Back to Classes
          </button>

          <div className="px-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4C53B4] to-[#6f75d6] flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-graduation-cap text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {classroom.name}
                  </h2>
                  {classroom.description && (
                    <p className="text-gray-600 mb-4 max-w-2xl">
                      {classroom.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-university text-[#4C53B4] group-hover:scale-110 transition-transform"></i>
                      <span className="text-gray-500 flex items-center gap-2 hover:text-[#4C53B4] transition-colors group">
                        Teacher: {classroom.teacher_name}
                      </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsStudentListOpen(true)}
                      className="text-gray-500 flex items-center gap-2 hover:text-[#4C53B4] transition-colors group"
                    >
                      <i className="fa-solid fa-users text-[#4C53B4] group-hover:scale-110 transition-transform"></i>
                      <span className="group-hover:underline">
                        {students.length} {students.length === 1 ? 'Student' : 'Students'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[95%] mx-auto mt-6">
        {/* Tabs */}
        <div className="bg-[#EEF1F5] rounded-3xl border-2 border-gray-100">
          <nav className="flex justify-center space-x-8 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-8 rounded-xl inline-flex items-center gap-2 font-medium text-sm 
                  transition-all duration-300 transform hover:scale-105
                  ${activeTab === tab.id 
                    ? 'bg-[#4C53B4] text-white shadow-lg' 
                    : 'text-gray-500 hover:bg-gray-50'}
                `}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'drills' && (
              <>
                {loading ? (
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <DrillSkeleton key={index} />
                    ))}
                  </div>
                ) : drills.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 text-center py-10">
                    <div className="w-16 h-16 mx-auto bg-[#EEF1F5] rounded-full flex items-center justify-center mb-4">
                      <i className="fa-solid fa-book text-[#4C53B4] text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Drills Available</h3>
                    <p className="text-gray-500 mt-2">Your teacher hasn't published any drills yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {getSortedDrills(drills).map((drill, idx) => (
                      <div key={drill.id} className={`relative rounded-2xl overflow-visible shadow border border-[#F7D9A0] bg-[#FFE6C7] hover:shadow-lg transition-all duration-300`}>
                        <div 
                          className="flex items-center justify-between px-6 py-4 cursor-pointer group"
                          onClick={() => toggleDrillPanel(drill.id)}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`fa-solid ${openDrillId === drill.id ? 'fa-caret-down' : 'fa-caret-right'} text-lg text-gray-700 transition-transform duration-300`}></i>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-semibold leading-tight mb-0.5">Drill {idx+1}</span>
                              <span className="font-bold text-2xl text-black leading-tight group-hover:text-[#4C53B4] transition-colors">{drill.title}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Total Points</div>
                              <div className="text-lg font-bold text-[#4C53B4]">{studentDrillResults[drill.id] || 0} pts</div>
                            </div>
                            {/* Kebab menu button */}
                            <div className="relative" ref={openMenuDrillId === drill.id ? menuRef : null} onClick={e => e.stopPropagation()}>
                              <button
                                className="ml-2 p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                                onClick={e => { e.stopPropagation(); handleMenuClick(drill.id); }}
                                aria-label="Open menu"
                              >
                                <i className="fa-solid fa-ellipsis-vertical text-xl text-gray-600"></i>
                              </button>
                              {openMenuDrillId === drill.id && (
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fadeIn">
                                  <button
                                    className="w-full text-left px-4 py-3 hover:bg-[#F7D9A0] text-[#4C53B4] font-semibold rounded-xl transition-colors"
                                    onClick={() => handleShowLeaderboard(drill.id)}
                                  >
                                    <i className="fa-solid fa-trophy mr-2"></i> Show Leaderboard
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {openDrillId === drill.id && (() => {
                          const availability = getDrillAvailabilityStatus(drill);
                          return (
                            <div className="bg-[#F7F9FC] px-8 py-6 border-t border-[#F7D9A0] flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fadeIn">
                              <div className="flex-1 flex flex-col gap-2">
                              <div className="text-gray-500 text-sm">
                                  Description: <span className="font-medium text-gray-700">
                                  {drill.description}
                                  </span>
                                </div>
                                <div className="text-gray-500 text-sm">
                                  Open: <span className="font-medium text-gray-700">
                                    {formatDateTime(drill.open_date)}
                                  </span>
                                </div>
                                <div className="text-gray-500 text-sm">
                                  Due: <span className="font-medium text-gray-700">
                                    {formatDateTime(drill.deadline)}
                                  </span>
                                </div>
                                <div className={`text-sm font-medium ${
                                  availability.status === 'available' ? 'text-green-600' :
                                  availability.status === 'not_open' ? 'text-blue-600' :
                                  'text-red-600'
                                }`}>
                                  <i className={`fa-solid ${
                                    availability.status === 'available' ? 'fa-check-circle' :
                                    availability.status === 'not_open' ? 'fa-clock' :
                                    'fa-times-circle'
                                  } mr-1`}></i>
                                  {availability.message}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 md:items-center md:flex-row">
                                {availability.canAccess ? (
                                  <Link 
                                    to={`/s/take-drill/${drill.id}`}
                                    className="ml-2 px-6 py-2 rounded-xl bg-[#38CA77] text-white font-bold shadow hover:bg-[#2DA05F] transition-all duration-300 flex items-center gap-2 hover:scale-105"
                                  >
                                    <i className="fa-solid fa-play"></i> Start Drill
                                  </Link>
                                ) : (
                                  <button 
                                    disabled
                                    className="ml-2 px-6 py-2 rounded-xl bg-gray-400 text-white font-bold shadow cursor-not-allowed flex items-center gap-2 opacity-60"
                                  >
                                    <i className={`fa-solid ${
                                      availability.status === 'not_open' ? 'fa-clock' : 'fa-lock'
                                    }`}></i>
                                    {availability.status === 'not_open' ? 'Not Yet Available' : 'Closed'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === 'leaderboard' && (
              <div
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 animate-slideIn relative overflow-hidden"
                style={{
                  backgroundImage: `url(${drillBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: 500,
                }}
              >
                <div className="absolute inset-0 bg-blue-100/60 pointer-events-none rounded-2xl" />
                <div className="relative z-10">
                  <h3 className="text-3xl font-extrabold text-[#e09b1a] text-center mb-8 tracking-wide flex items-center justify-center gap-2">
                    <span>- LEADERBOARD -</span>
                  </h3>
                  {loadingLeaderboard ? (
                    <div className="text-center text-gray-500 py-12">Loading...</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">No students have participated in drills yet.</div>
                  ) : (
                    <>
                      {/* Top 3 Podium: 2nd (left), 1st (center), 3rd (right) */}
                      <div className="flex justify-center items-end gap-8 mb-10">
                        {[1, 0, 2].map((idx, pos) => {
                          const student = leaderboard[idx];
                          // Use a unique key for each child, even for empty slots
                          let key;
                          if (student && student.id !== undefined && student.id !== null) {
                            key = `podium-${student.id}`;
                          } else if (student) {
                            key = `podium-fallback-${pos}`;
                          } else {
                            key = `podium-empty-${pos}`;
                          }
                          if (!student) return <div key={key} className="w-32" />;
                          // Podium order: left=2nd, center=1st, right=3rd
                          const rank = pos === 0 ? 2 : pos === 1 ? 1 : 3;
                          const borderColors = [
                            'border-purple-400', // 2nd place (left)
                            'border-yellow-400', // 1st place (center)
                            'border-orange-400'  // 3rd place (right)
                          ];
                          const size = pos === 1 ? 'w-32 h-32' : 'w-24 h-24';
                          const ring = pos === 1 ? 'ring-4 ring-yellow-300' : '';
                          return (
                            <div key={key} className="flex flex-col items-center">
                              {/* Rank and Crown above image */}
                              <div className="flex flex-col items-center mb-2">
                                <span className={`font-extrabold text-2xl ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-purple-400' : 'text-orange-400'}`}>{rank}</span>
                                {rank === 1 && (
                                  <span className="-mt-2 text-yellow-400 text-4xl drop-shadow-lg">👑</span>
                                )}
                              </div>
                              <div className={`relative ${size} rounded-full overflow-hidden border-4 ${borderColors[pos]} bg-white flex items-center justify-center ${ring}`}>
                                {student.avatar ? (
                                  <img src={student.avatar} alt={student.first_name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[#4C53B4] font-bold text-3xl">{student.first_name?.[0]?.toUpperCase() || '?'}</span>
                                )}
                              </div>
                              <div className={`mt-4 text-center ${pos === 1 ? 'font-extrabold text-xl' : 'font-bold text-lg'} text-gray-800`}>
                                {student.first_name}
                              </div>
                              <div className="text-center text-gray-600 font-bold">{student.points}</div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Table for the rest */}
                      <div className="max-w-lg mx-auto bg-white/80 rounded-xl shadow p-4">
                        <div className="flex font-bold text-[#e09b1a] text-lg mb-2">
                          <div className="flex-1">NAME</div>
                          <div className="w-24 text-right">POINTS</div>
                        </div>
                        {leaderboard.slice(3).map((student, idx) => {
                          let key;
                          if (student && student.id !== undefined && student.id !== null) {
                            key = `table-${student.id}`;
                          } else {
                            key = `table-fallback-${idx}`;
                          }
                          return (
                            <div key={key} className="flex items-center border-t border-gray-200 py-2">
                              <div className="flex-1 font-semibold text-gray-700">{student.first_name}</div>
                              <div className="w-24 text-right font-bold text-gray-700">{student.points}</div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student List Modal */}
      <StudentListModal
        isOpen={isStudentListOpen}
        onClose={() => setIsStudentListOpen(false)}
        students={students}
      />
      </div>
    </>
  );
};

export default StudentClassroom;
