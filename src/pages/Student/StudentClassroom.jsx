import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';

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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
    </div>
  );

  const tabs = [
    { id: 'drills', label: 'Drills', icon: 'fa-dumbbell' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'fa-trophy' }
  ];

  return (
    <div className="min-h-screen bg-[#EEF1F5]">
      {/* Header */}
      <div className="bg-white shadow-lg mt-6 rounded-2xl mx-10 pb-6">
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
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
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
                        </div>
                        
                        {openDrillId === drill.id && (
                          <div className="bg-[#F7F9FC] px-8 py-6 border-t border-[#F7D9A0] flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fadeIn">
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="text-gray-500 text-sm">Due: <span className="font-medium text-gray-700">{drill.deadline ? new Date(drill.deadline).toLocaleString() : 'N/A'}</span></div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-500 font-medium">Progress</span>
                                  <span className="text-xs text-gray-600 font-bold">0%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 md:items-center md:flex-row">
                              <Link 
                                to={`/s/take-drill/${drill.id}`}
                                className="ml-2 px-6 py-2 rounded-xl bg-[#38CA77] text-white font-bold shadow hover:bg-[#2DA05F] transition-all duration-300 flex items-center gap-2 hover:scale-105"
                              >
                                <i className="fa-solid fa-play"></i> Start Drill
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {activeTab === 'leaderboard' && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 animate-slideIn">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-[#EEF1F5] rounded-full flex items-center justify-center mb-4">
                    <i className="fa-solid fa-trophy text-[#4C53B4] text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Leaderboard</h3>
                  <p className="text-gray-500 mt-2">Coming soon...</p>
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
  );
};

export default StudentClassroom;