import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';
import EnrollStudentsModal from './EnrollStudentsModal';
import ConfirmationModal from './ConfirmationModal';
import UpdateClassroom from './UpdateClassroom';
import DeleteClassroom from './DeleteClassroom';
import TransferStudentModal from './TransferStudentModal';

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

const DashboardNavItem = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left px-3 py-2.5 rounded-xl mb-2 last:mb-0
      flex items-center gap-2 transition-all duration-300 text-sm
      transform hover:scale-105 relative overflow-hidden
      ${isActive
        ? 'bg-[#4C53B4] text-white shadow-lg'
        : 'text-gray-600 hover:bg-gray-50'}
    `}
  >
    <i className={`fa-solid ${icon}`}></i>
    {label}
    {isActive && (
      <div className="absolute inset-0 bg-white opacity-10">
        <div className="absolute inset-0"></div>
      </div>
    )}
  </button>
);

const TeacherClassroom = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('drills');
  const [activeDashboardSection, setActiveDashboardSection] = useState('manage-students');
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [studentError, setStudentError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [studentToTransfer, setStudentToTransfer] = useState(null);

  // Combined fetch for classroom and students data
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
      setStudents([]);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchClassroomData();
  }, [id]);

  // Only fetch students when enrolling new ones
  const fetchEnrolledStudents = async () => {
    try {
      const response = await api.get(`/api/classrooms/${id}/students/`);
      const studentData = Array.isArray(response.data) ? response.data : 
                       Array.isArray(response.data?.students) ? response.data.students : [];
      setStudents(studentData);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      setStudents([]);
    }
  };

  const handleRemoveClick = (student) => {
    setStudentToRemove(student);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!studentToRemove) return;

    try {
      await api.delete(`/api/classrooms/${id}/students/`, {
        data: { student_ids: [studentToRemove.id] }
      });
      
      setStudents(prev => prev.filter(s => s.id !== studentToRemove.id));
      setIsConfirmModalOpen(false);
      setStudentToRemove(null);
    } catch (error) {
      console.error('Error removing student:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setStudentError(error.response?.data?.error || 'Failed to remove student. Please try again.');
    }
  };

  const handleTransferClick = (student) => {
    setStudentToTransfer(student);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = () => {
    fetchEnrolledStudents();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedStudents = (students) => {
    if (!sortConfig.key) return students;

    return [...students].sort((a, b) => {
      if (sortConfig.key === 'id') {
        return sortConfig.direction === 'asc' ? a.id - b.id : b.id - a.id;
      } else if (sortConfig.key === 'name') {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return sortConfig.direction === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      return 0;
    });
  };

  const handleEnrollSuccess = () => {
    fetchEnrolledStudents();
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
          <p className="text-red-600 flex items-center gap-2">
            <i className="fa-solid fa-face-frown"></i>
            {error}
          </p>
          <button 
            onClick={() => navigate('/t/classes')}
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
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge' }
  ];

  const dashboardNavItems = [
    { id: 'manage-students', label: 'Manage Students', icon: 'fa-users' },
    { id: 'teacher-dashboard', label: 'Teacher Dashboard', icon: 'fa-chalkboard-teacher' }
  ];

  const filteredStudents = Array.isArray(students) 
    ? getSortedStudents(students.filter(student => 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    : [];

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
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-[#EEF1F5] px-4 py-2 rounded-xl flex items-center gap-2">
                      <i className="fa-solid fa-key text-[#4C53B4]"></i>
                      <span className="text-sm font-medium">
                        Class Code: <span className="font-mono text-[#4C53B4]">{classroom.class_code}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500 flex items-center gap-2">
                        <i className="fa-solid fa-users text-[#4C53B4]"></i>
                        {students.length} {students.length === 1 ? 'Student' : 'Students'}
                      </span>
                      <span className="text-gray-500 flex items-center gap-2">
                        <i className="fa-solid fa-calendar text-[#4C53B4]"></i>
                        Created {new Date(classroom.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <button 
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="flex-1 lg:flex-initial px-6 py-3 text-base font-medium text-[#4C53B4] bg-[#EEF1F5] rounded-xl hover:bg-[#4C53B4] hover:text-white transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <i className="fa-solid fa-pen"></i>
                  Edit
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex-1 lg:flex-initial px-6 py-3 text-base font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center gap-2 justify-center"
                >
                  <i className="fa-solid fa-trash"></i>
                  Delete
                </button>
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
            {activeTab === 'dashboard' && (
              <div className="flex gap-6 animate-fadeIn">
                {/* Dashboard Navigation */}
                <div className="w-56 bg-white rounded-2xl shadow-lg border-2 border-gray-100 h-fit transform hover:scale-[1.02] transition-all duration-300">
                  <nav className="p-4 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#4C53B4]/5 rounded-full"></div>
                    <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-[#FFDF9F]/10 rounded-full"></div>
                    
                    {dashboardNavItems.map(item => (
                      <DashboardNavItem
                        key={item.id}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeDashboardSection === item.id}
                        onClick={() => setActiveDashboardSection(item.id)}
                      />
                    ))}
                  </nav>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 transform transition-all duration-500">
                  {activeDashboardSection === 'manage-students' && (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 animate-slideIn relative overflow-hidden">
                      {/* Decorative shapes */}
                      <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#4C53B4]/5 rounded-full"></div>
                      <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#FFDF9F]/10 rounded-full"></div>

                      {/* Search and Enroll Section */}
                      <div className="p-6 border-b border-gray-200 relative">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search students..."
                              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                            />
                            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                          </div>
                          <button 
                            onClick={() => setIsEnrollModalOpen(true)}
                            className="px-4 py-2 bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095] transition-all duration-300 flex items-center gap-2"
                          >
                            <i className="fa-solid fa-user-plus"></i>
                            Enroll Students
                          </button>
                        </div>
                      </div>

                      {/* Students Table */}
                      <div className="p-6 relative">
                        {studentError ? (
                          <div className="text-center py-8">
                            <p className="text-red-500">{studentError}</p>
                          </div>
                        ) : !Array.isArray(students) || students.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto bg-[#FFDF9F]/20 rounded-full flex items-center justify-center mb-4">
                              <i className="fa-solid fa-users text-[#4C53B4] text-2xl"></i>
                            </div>
                            <p className="text-gray-500">No students in this classroom yet.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('id')}
                                  >
                                    <div className="flex items-center gap-1">
                                      ID No.
                                      <div className="flex flex-col">
                                        <i className={`fa-solid fa-caret-up text-xs ${sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'text-[#4C53B4]' : 'text-gray-300'}`}></i>
                                        <i className={`fa-solid fa-caret-down text-xs ${sortConfig.key === 'id' && sortConfig.direction === 'desc' ? 'text-[#4C53B4]' : 'text-gray-300'}`}></i>
                                      </div>
                                    </div>
                                  </th>
                                  <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
                                    onClick={() => handleSort('name')}
                                  >
                                    <div className="flex items-center gap-1">
                                      Name
                                      <div className="flex flex-col">
                                        <i className={`fa-solid fa-caret-up text-xs ${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'text-[#4C53B4]' : 'text-gray-300'}`}></i>
                                        <i className={`fa-solid fa-caret-down text-xs ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'text-[#4C53B4]' : 'text-gray-300'}`}></i>
                                      </div>
                                    </div>
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.map((student, index) => (
                                  <tr 
                                    key={student.id} 
                                    className="hover:bg-gray-50 transition-colors"
                                    style={{
                                      animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                                    }}
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-[#4C53B4] flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                                          {student.first_name?.[0] || student.username[0]}
                                        </div>
                                        <div className="ml-3">
                                          <div className="text-sm font-medium text-gray-900">
                                            {student.first_name} {student.last_name}
                                          </div>
                                          <div className="text-sm text-gray-500">@{student.username}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 animate-pulse">
                                        Active
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                      <button
                                        onClick={() => handleRemoveClick(student)}
                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105"
                                      >
                                        Remove
                                      </button>
                                      <button
                                        onClick={() => handleTransferClick(student)}
                                        className="text-[#4C53B4] hover:text-[#3a4095] bg-[#EEF1F5] hover:bg-[#E6E9FF] px-3 py-1 rounded-lg transition-all duration-300 transform hover:scale-105"
                                      >
                                        Transfer
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeDashboardSection === 'teacher-dashboard' && (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 animate-slideIn">
                      <h3 className="text-lg font-medium text-gray-900">Teacher Dashboard</h3>
                      <p className="text-gray-500 mt-2">Coming soon...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enroll Students Modal */}
      <EnrollStudentsModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        classroomId={id}
        onEnrollSuccess={handleEnrollSuccess}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setStudentToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Remove Student"
        message={`Are you sure you want to remove ${studentToRemove?.name} from the classroom?`}
      />

      {/* Update Classroom Modal */}
      <UpdateClassroom
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        classroom={classroom}
        onSuccess={(updatedClassroom) => {
          setClassroom(updatedClassroom);
          setIsUpdateModalOpen(false);
        }}
      />

      {/* Delete Classroom Modal */}
      <DeleteClassroom
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classroom={classroom}
        onSuccess={() => {
          navigate('/t/classes');
        }}
      />

      {/* Add TransferStudentModal */}
      <TransferStudentModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setStudentToTransfer(null);
        }}
        classroomId={id}
        studentToTransfer={studentToTransfer}
        onTransferSuccess={handleTransferSuccess}
      />
    </div>
  );
};

export default TeacherClassroom;
