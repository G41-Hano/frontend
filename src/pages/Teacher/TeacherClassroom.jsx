import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api';
import CreateDrill from './CreateDrill';
import EditDrill from './EditDrill';
import ViewDrillResults from './ViewDrillResults';
import EnrollStudentsModal from './EnrollStudentsModal';
import ConfirmationModal from './ConfirmationModal';
import UpdateClassroom from './UpdateClassroom';
import DeleteClassroom from './DeleteClassroom';
import TransferStudentModal from './TransferStudentModal';
import TeacherDashboard from './TeacherDashboard';
import ClassroomHeader from './ClassroomHeader';  
import ReactDOM from 'react-dom';
import { useSuccessModal } from '../../contexts/SuccessModalContext';
import { useClassroomPreferences } from '../../contexts/ClassroomPreferencesContext';

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
  const [drills, setDrills] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openMenuDrillId, setOpenMenuDrillId] = useState(null);
  const { showSuccessModal } = useSuccessModal();
  const { getClassroomColor } = useClassroomPreferences();

  // Combined fetch for classroom and students data
  const fetchClassroomData = useCallback(async () => {
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
  }, [id]);

  // Fetch drills for this classroom
  const fetchDrills = useCallback(async () => {
    try {
      const response = await api.get(`/api/drills/?classroom=${id}`);
      setDrills(response.data);
    } catch {
      setDrills([]);
    }
  }, [id]);

  // Sort drills: drafts first, then published
  const getSortedDrills = useCallback((drillsToSort) => {
    return [...drillsToSort].sort((a, b) => {
      // If status is different, sort by status (draft first)
      if (a.status !== b.status) {
        return a.status === 'draft' ? -1 : 1;
      }
      // If status is the same, sort by ID (older first)
      return a.id - b.id;
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchClassroomData();
    fetchDrills();
  }, [fetchClassroomData, fetchDrills]);

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
      
      const studentName = `${studentToRemove?.first_name || ''} ${studentToRemove?.last_name || ''}`.trim();
      setStudents(prev => prev.filter(s => s.id !== studentToRemove.id));
      setIsConfirmModalOpen(false);
      setStudentToRemove(null);
      
      // Show success modal after closing the confirmation modal
      setTimeout(() => {
        showSuccessModal('remove', { studentName });
      }, 300);
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

  // Drill sub-page logic (do this AFTER all hooks)
  const drillMode = searchParams.get('drill');
  const drillId = searchParams.get('drillId');
  if (drillMode === 'create') return <CreateDrill onDrillCreated={() => {
    fetchDrills();
    setSearchParams({});
  }} classroom={classroom} students={students} />;
  if (drillMode === 'edit' && drillId) return <EditDrill />;
  if (drillMode === 'results' && drillId) return <ViewDrillResults />;

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
    { id: 'students', label: 'Students', icon: 'fa-users' },
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge' }
  ];

  const filteredStudents = Array.isArray(students) 
    ? getSortedStudents(students.filter(student => 
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username?.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    : [];

  // Add this function after other handlers
  const handleArchiveClassroom = async (classroomId, isArchived) => {
    if (!classroom) return;
    try {
      // If currently not archived (isArchived=false), set to true (archive)
      // If currently archived (isArchived=true), set to false (unarchive)
      const newArchiveStatus = isArchived ? false : true;
      
      console.log('Current archive status:', isArchived);
      console.log('New archive status to be set:', newArchiveStatus);
      
      const response = await api.patch(`/api/classrooms/${classroomId}/`, {
        is_archived: newArchiveStatus
      });
      
      console.log('API Response:', response.data);
      
      // Update local state
      setClassroom(prev => ({
        ...prev,
        is_archived: newArchiveStatus
      }));
      
      navigate('/t/classes'); // Redirect to all classes after archiving/unarchiving
    } catch (err) {
      alert('Failed to update archive status.');
      console.error('Error updating archive status:', err);
    }
  };

    // Get color when rendering
  const classroomColor = classroom?.teacher?.id ? getClassroomColor(classroom.teacher.id, id) : '#7D83D7';

  return (
    <div className="min-h-screen bg-[#EEF1F5]">
      {/* Header */}
      <ClassroomHeader
        classroom={classroom}
        students={students}
        onEdit={() => setIsUpdateModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
        onArchive={handleArchiveClassroom}
        onBack={() => navigate(-1)}
      />

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
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Drills</h2>
                  <button
                    className="px-5 py-2 bg-[#4C53B4] text-white rounded-xl shadow hover:bg-[#3a4095] transition-all duration-300 flex items-center gap-2"
                    onClick={() => setSearchParams({ drill: 'create' })}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Create Drill
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {drills.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">No drills yet.</div>
                  ) : (
                    getSortedDrills(drills).map((drill, idx) => (
                      <DrillPanel key={drill.id} drill={drill} idx={idx} onDelete={() => fetchDrills()} setSearchParams={setSearchParams} openMenuDrillId={openMenuDrillId} setOpenMenuDrillId={setOpenMenuDrillId} navigate={navigate} />
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === 'students' && (
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
                                  {student.avatar ? (
                                    <img 
                                      src={student.avatar} 
                                      alt={student.first_name?.[0] || student.username[0]} 
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#4C53B4] flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                                      {student.first_name?.[0] || student.username[0]}
                                    </div>
                                  )}
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.name}
                                    </div>
                                    <div className="text-xs text-gray-500">@{student.username}</div>
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
            {activeTab === 'dashboard' && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 animate-slideIn h-full">
                <TeacherDashboard />
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

function DrillPanel({ drill, idx, onDelete, setSearchParams, openMenuDrillId, setOpenMenuDrillId, navigate }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const buttonRef = useRef();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Only show menu if openMenuDrillId === drill.id
  const menuOpen = openMenuDrillId === drill.id;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (buttonRef.current && !buttonRef.current.contains(e.target) &&
          menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuDrillId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, setOpenMenuDrillId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/drills/${drill.id}/`);
      setSearchParams({});
      setConfirmDelete(false);
      setOpenMenuDrillId(null);
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Failed to delete drill:', error);
      alert('Failed to delete drill. Please try again.');
      setConfirmDelete(false);
      setOpenMenuDrillId(null);
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.patch(`/api/drills/${drill.id}/`, { status: 'published' });
      if (onDelete) onDelete();
    } catch {
      alert('Failed to publish drill.');
    }
  };

  const handleMenuOpen = () => {
    setOpenMenuDrillId(menuOpen ? null : drill.id);
  };

  const fadeInStyle = {
    animation: 'fadeIn 0.3s ease-out forwards',
  };

  const fadeInUpStyle = {
    animation: 'fadeInUp 0.3s ease-out forwards',
  };

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Menu component
  const Menu = () => {
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    
    const updatePosition = useCallback(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 192;
        const menuHeight = 200; // Approximate height
        
        // Calculate position
        let left = rect.right - menuWidth;
        let flippedToTop = false;
        
        // Check if menu would go off screen to the left
        if (left < 0) {
          left = 0;
        }
        
        // Check if menu would go off screen to the right
        if (left + menuWidth > window.innerWidth) {
          left = window.innerWidth - menuWidth - 5;
        }
        
        // Check if menu would go off screen at the bottom
        if (rect.bottom + menuHeight > window.innerHeight) {
          // Position menu above the button instead with a smaller gap
          flippedToTop = true;
        }
        
        setMenuPosition({
          top: flippedToTop ? rect.top + window.scrollY : rect.bottom + window.scrollY + 5,
          left,
          flippedToTop
        });
      }
    }, []);
    
    useEffect(() => {
      // Initial position
      updatePosition();
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [updatePosition]);
    
    return ReactDOM.createPortal(
      <div 
        ref={menuRef}
        className="fixed bg-white rounded-xl shadow-lg z-[9999] border border-gray-100 py-2 animate-fadeIn opacity-100"
        style={{ 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
          width: '192px',
          top: menuPosition.flippedToTop ? 'auto' : `${menuPosition.top}px`,
          bottom: menuPosition.flippedToTop ? `${window.innerHeight - menuPosition.top + 5}px` : 'auto',
          left: `${menuPosition.left}px`,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        {/* Only show 'View Drill Results' if not draft */}
        {drill.status !== 'draft' && (
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700" 
            onClick={() => { 
              setOpenMenuDrillId(null); 
              setSearchParams({ drill: 'results', drillId: drill.id }); 
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square"></i> View Drill Results
          </button>
        )}
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700" 
          onClick={() => { 
            setOpenMenuDrillId(null);
            navigate(`/t/take-drill/${drill.id}`);
          }}
        >
          <i className={`fa-solid ${drill.status === 'draft' ? 'fa-eye' : 'fa-play'}`}></i> {drill.status === 'draft' ? 'Preview Drill' : 'Take Drill'}
        </button>
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700" 
          onClick={() => { 
            setOpenMenuDrillId(null); 
            setSearchParams({ drill: 'edit', drillId: drill.id }); 
          }}
        >
          <i className="fa-solid fa-pen"></i> Edit Drill
        </button>
        {drill.status === 'draft' && (
          <button 
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-green-600" 
            onClick={() => { 
              setOpenMenuDrillId(null); 
              handlePublish(); 
            }}
          >
            <i className="fa-solid fa-upload"></i> Publish
          </button>
        )}
        <button 
          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-500" 
          onClick={() => { 
            setOpenMenuDrillId(null); 
            setConfirmDelete(true); 
          }}
        >
          <i className="fa-solid fa-trash"></i> Delete Drill
        </button>
      </div>,
      document.body
    );
  };

  return (
    <div className={`relative rounded-2xl overflow-visible shadow border ${drill.status === 'draft' ? 'border-yellow-300 bg-yellow-50 opacity-80' : 'border-[#F7D9A0] bg-[#FFE6C7]'}`}>
      <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={e => {
        // Only toggle if not clicking the menu button or its children
        if (!buttonRef.current || !buttonRef.current.contains(e.target)) {
          setOpen(o => !o);
        }
      }}>
        <div className="flex items-center gap-3">
          <i className={`fa-solid ${open ? 'fa-caret-down' : 'fa-caret-right'} text-lg text-gray-700`}></i>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-semibold leading-tight mb-0.5">Drill {idx+1}</span>
            <span className="font-bold text-3xl text-black leading-tight">{drill.title}</span>
            {drill.status === 'draft' && (
              <span className="block mt-1 w-20 text-center py-1 rounded bg-yellow-200 text-yellow-800 text-xs font-bold">Draft</span>
            )}
          </div>
        </div>
        <div className="relative z-[100]">
          <button
            ref={buttonRef}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full focus:outline-none"
            onClick={handleMenuOpen}
          >
            <i className="fa-solid fa-ellipsis-vertical"></i>
          </button>
          {menuOpen && <Menu />}
        </div>
      </div>
      
      {open && (
        <div className="bg-[#F7F9FC] px-8 py-6 border-t border-[#F7D9A0] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-gray-500 text-sm">Open: <span className="font-medium text-gray-700">{drill.deadline ? new Date(drill.deadline).toLocaleString() : 'N/A'}</span></div>
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
            {drill.status === 'draft' && (
              <button
                className="px-5 py-2 rounded-xl bg-[#4C53B4] text-white font-bold shadow hover:bg-[#3a4095] hover:scale-105 transition-all duration-300 flex items-center gap-2"
                onClick={() => { handlePublish(); }}
              >
                <i className="fa-solid fa-upload"></i> Publish
              </button>
            )}
            <button 
              className="ml-2 px-6 py-2 rounded-xl bg-[#38CA77] text-white font-bold shadow hover:bg-[#2DA05F] transition-all duration-300 flex items-center gap-2"
              onClick={() => { 
                navigate(`/t/take-drill/${drill.id}`);
              }}
            >
              <i className={`fa-solid ${drill.status === 'draft' ? 'fa-eye' : 'fa-play'}`}></i> {drill.status === 'draft' ? 'Preview Drill' : 'Test Drill'}
            </button>
          </div>
        </div>
      )}

      {/* Improved Modal Dialog with inline styles */}
      {confirmDelete && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center" 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            ...fadeInStyle
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl p-8 w-[350px] flex flex-col items-center mx-4"
            style={fadeInUpStyle}
          >
            <div className="w-16 h-16 flex items-center justify-center bg-yellow-100 rounded-full mb-4">
              <i className="fa-solid fa-triangle-exclamation text-yellow-500 text-3xl"></i>
            </div>
            <div className="font-bold text-xl mb-2 text-center">Delete Drill</div>
            <div className="mb-6 text-gray-600 text-center">
              Are you sure you want to delete <span className="font-semibold">{drill.title}</span>?
              <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button 
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors" 
                onClick={() => setConfirmDelete(false)} 
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors" 
                onClick={handleDelete} 
                disabled={deleting}
              >
                {deleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full" 
                      style={{ animation: 'spin 1s linear infinite' }}>
                    </div>
                    <span>Deleting...</span>
                  </div>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
export default TeacherClassroom;
