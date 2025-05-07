import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const DrillCard = ({ title, icon, color, hoverColor }) => (
  <div 
    className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 border-2 border-gray-100 overflow-hidden"
  >
    {/* Animated background shapes */}
    <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${color} opacity-10 transition-transform duration-500 group-hover:scale-150`} />
    <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full ${color} opacity-10 transition-transform duration-500 group-hover:scale-150 delay-100`} />
    
    <div className={`relative w-16 h-16 rounded-2xl ${color} group-hover:${hoverColor} transform transition-all duration-500 mb-4 p-4 group-hover:rotate-6`}>
      <i className={`fa-solid ${icon} text-white text-2xl transition-transform duration-500 group-hover:scale-110`}></i>
    </div>
    <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#4C53B4] transition-colors duration-300">{title}</h3>
    <p className="text-gray-600 mt-2 group-hover:text-gray-700 transition-colors duration-300">Practice {title.toLowerCase()} signs</p>
    
    {/* Fun hover indicator */}
    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
      <i className="fa-solid fa-arrow-right text-[#4C53B4]"></i>
    </div>
  </div>
);

const StudentClassroom = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('drills');
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);

  // Fetch classroom and students data
  useEffect(() => {
    const fetchClassroomData = async () => {
      try {
        const [classroomResponse, studentsResponse] = await Promise.all([
          api.get(`/api/classrooms/${id}/`),
          api.get(`/api/classrooms/${id}/students/`)
        ]);
        setClassroom(classroomResponse.data);
        const studentData = Array.isArray(studentsResponse.data) ? studentsResponse.data : 
                        Array.isArray(studentsResponse.data?.students) ? studentsResponse.data.students : [];
        setStudents(studentData);
        setError(null);
      } catch (err) {
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url
        });
        setError(err.response?.data?.error || 'Failed to fetch classroom');
        setClassroom(null);
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

  const drillCards = [
    { 
      title: 'Animals', 
      icon: 'fa-paw', 
      color: 'bg-[#FE93AA]',
      hoverColor: 'bg-[#FF97BE]'
    },
    { 
      title: 'Weather', 
      icon: 'fa-cloud-sun', 
      color: 'bg-[#E79051]',
      hoverColor: 'bg-[#F7A061]'
    },
    { 
      title: 'Objects', 
      icon: 'fa-cube', 
      color: 'bg-[#A6CB00]',
      hoverColor: 'bg-[#B6DB10]'
    }
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drillCards.map(card => (
                  <DrillCard key={card.title} {...card} />
                ))}
              </div>
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