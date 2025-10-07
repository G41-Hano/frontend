import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  DragOverlay,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../api';
import pencilBook from '../../assets/pencil_book.png';
import CreateClassroomModal from './CreateClassroomModal';
import UpdateClassroom from './UpdateClassroom';
import DeleteClassroom from './DeleteClassroom';
import { useClassroomPreferences } from '../../contexts/ClassroomPreferencesContext';
import { ClassroomSkeleton, ClassroomHeaderSkeleton } from '../../components/loading';

const CLASSROOM_COLORS = ['#7D83D7', '#E79051', '#A6CB00', '#FE93AA', '#FBC372']; //Classroom Colors

// Sortable Classroom Card Component
const SortableClassroomCard = ({ 
  classroom, 
  handleOpenMenu, 
  openMenuId, 
  handleColorChange, 
  handleHideToggle,
  setSelectedClassroom,
  setIsUpdateModalOpen,
  setOpenMenuId,
  handleClick,
  handleArchiveClassroom
}) => {
  const { getClassroomColor } = useClassroomPreferences();
  const classroomColor = getClassroomColor(classroom.id) || classroom.color || '#7D83D7';
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: classroom.id.toString() });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId === classroom.id) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, classroom.id, setOpenMenuId]);

  // Position menu when open
  useEffect(() => {
    if (openMenuId === classroom.id && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuElement = menuRef.current;
      
      // Position menu relative to button
      menuElement.style.position = 'absolute';
      menuElement.style.top = `${buttonRect.height + 5}px`;
      menuElement.style.right = '0px';
    }
  }, [openMenuId, classroom.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 0 : (openMenuId === classroom.id ? 50 : 1),
    cursor: 'pointer',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`${isDragging ? 'z-0' : (openMenuId === classroom.id ? 'z-50' : 'z-10')} relative cursor-pointer`}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          handleClick(classroom.id);
        }
      }}
      {...attributes}
      {...listeners}
    >
      <div
        style={{ backgroundColor: classroomColor }}
        className={`rounded-3xl p-4 hover:shadow-2xl transition-all duration-300 ease-in-out relative overflow-visible min-h-[200px] flex flex-col justify-between group hover:-translate-y-1 ${
          isDragging ? 'shadow-2xl cursor-grabbing' : ''
        }`}
      >
        {/* Menu Button */}
        <div className="absolute top-3 right-3 z-[60]">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMenu(classroom.id);
            }}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
          >
            <i className="fa-solid fa-ellipsis-vertical text-sm transition-transform group-hover:rotate-90"></i>
          </button>

          {/* Color Picker Menu */}
          {openMenuId === classroom.id && (
            <div 
              ref={menuRef}
              className="w-48 bg-white rounded-lg shadow-xl py-2 z-[9999] animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                position: 'absolute',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-100">Choose Color</div>
              <div className="grid grid-cols-5 gap-2 px-4 py-2">
                {/* Color Options */}
                {CLASSROOM_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleColorChange(classroom.id, color);
                    }}
                    className="w-6 h-6 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Update Classroom Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClassroom(classroom);
                  setIsUpdateModalOpen(true);
                  setOpenMenuId(null);
                }}
                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
              >
                <i className="fa-solid fa-pen text-gray-500 w-5"></i>
                Update Classroom
              </button>

              {/* Hide Classroom Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHideToggle(classroom.id);
                }}
                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <i className={`fa-solid ${classroom.is_hidden ? 'fa-eye' : 'fa-eye-slash'} text-gray-500 w-5`}></i> 
                {classroom.is_hidden ? 'Show Classroom' : 'Hide Classroom'}
              </button>

              {/* Archive/Unarchive Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchiveClassroom(classroom.id, classroom.is_archived);
                  setOpenMenuId(null);
                }}
                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-t border-gray-100"
              >
                <i className={`fa-solid ${classroom.is_archived ? 'fa-box-open' : 'fa-box-archive'} text-gray-500 w-5`}></i>
                {classroom.is_archived ? 'Unarchive' : 'Archive'}
              </button>
            </div>
          )}
        </div>

        {/* Classroom Details */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              <i className="fa-solid fa-book text-2xl text-white/80 transition-all duration-300 group-hover:text-white"></i>
            </div>
            
            <div className="transform transition-all duration-300 group-hover:translate-x-1">
              <h3 className="text-lg sm:text-xl font-semibold text-white">{classroom.name}</h3>
              <p className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">
                {classroom.student_count || classroom.students?.length || 0} 
                {(classroom.student_count || classroom.students?.length || 0) <= 1 ? ' Student' : ' Students'}
              </p>
            </div>
          </div>

          {/* Student Avatars */}
          <div className="flex -space-x-2">
            {(classroom.students || []).slice(0, 3).map((student) => (
              <div
                key={student.id}
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-white flex items-center justify-center overflow-hidden transform transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:z-10 group relative"
                title={student.name}
              >
                {student.avatar ? (
                  <>
                  <img 
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                        const fallback = e.target.parentNode.querySelector('.avatar-fallback');
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                    }}
                  />
                    <div 
                      className="avatar-fallback w-full h-full bg-[#4C53B4] items-center justify-center text-white text-[10px] sm:text-xs font-medium hidden"
                    >
                      {student.name?.split(' ').map(n => n[0].toUpperCase()).join('')}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-[#4C53B4] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium">
                    {student.name?.split(' ').map(n => n[0].toUpperCase()).join('')}
                  </div>
                )}
              </div>
            ))}
            {(classroom.student_count > 3 || (classroom.students?.length || 0) > 3) && (
              <div 
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center text-white text-[10px] sm:text-xs font-medium transform transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:z-10"
                title={`${(classroom.student_count || classroom.students?.length || 0) - 3} more students`}
              >
                +{(classroom.student_count || classroom.students?.length || 0) - 3}
              </div>
            )}
          </div>
        </div>

        {/* Decorative Circles */}
        <div className={`absolute right-0 bottom-0 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4 ${openMenuId === classroom.id ? 'opacity-20' : 'opacity-100'}`}>
          <div className="w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10 absolute -bottom-20 sm:-bottom-24 -right-20 sm:-right-24 transition-transform duration-500 group-hover:scale-110"></div>
          <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 transition-transform duration-500 group-hover:scale-125"></div>
        </div>
        <div className={`absolute left-1/2 top-1/2 transition-transform duration-500 group-hover:rotate-45 ${openMenuId === classroom.id ? 'opacity-20' : 'opacity-100'}`}>
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/10 absolute -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

const ClassroomCard = ({ classroom }) => {
  return (
    <div
      style={{ backgroundColor: classroom.color }}
      className="rounded-3xl p-4 shadow-xl transition-all duration-300 ease-in-out relative overflow-hidden min-h-[200px] flex flex-col justify-between"
    >
      {/* Menu Button */}
      <div className="absolute top-3 right-3 z-10">
        <button
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
        >
          <i className="fa-solid fa-ellipsis-vertical text-sm"></i>
        </button>
      </div>

      {/* Classroom Details */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <i className="fa-solid fa-book text-2xl text-white/80"></i>
          </div>
          
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">{classroom.name}</h3>
            <p className="text-white/80 text-sm">
              {classroom.student_count || classroom.students?.length || 0} 
              {(classroom.student_count || classroom.students?.length || 0) <= 1 ? ' Student' : ' Students'}
            </p>
          </div>
        </div>

        {/* Student Avatars */}
        <div className="flex -space-x-2">
          {(classroom.students || []).slice(0, 3).map((student) => (
            <div
              key={student.id}
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border-2 border-white flex items-center justify-center overflow-hidden relative"
              title={student.name}
            >
              {student.avatar ? (
                <>
                <img 
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                      const fallback = e.target.parentNode.querySelector('.avatar-fallback');
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                  }}
                />
                  <div 
                    className="avatar-fallback w-full h-full bg-[#4C53B4] items-center justify-center text-white text-[10px] sm:text-xs font-medium hidden"
                  >
                    {student.name?.split(' ').map(n => n[0].toUpperCase()).join('')}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-[#4C53B4] flex items-center justify-center text-white text-[10px] sm:text-xs font-medium">
                  {student.name?.split(' ').map(n => n[0].toUpperCase()).join('')}
                </div>
              )}
            </div>
          ))}
          {(classroom.student_count > 3 || (classroom.students?.length || 0) > 3) && (
            <div 
              className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center text-white text-[10px] sm:text-xs font-medium"
              title={`${(classroom.student_count || classroom.students?.length || 0) - 3} more students`}
            >
              +{(classroom.student_count || classroom.students?.length || 0) - 3}
            </div>
          )}
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute right-0 bottom-0">
        <div className="w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10 absolute -bottom-20 sm:-bottom-24 -right-20 sm:-right-24"></div>
        <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6"></div>
      </div>
      <div className="absolute left-1/2 top-1/2">
        <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/10 absolute -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

const AllClasses = () => {
  const [filter, setFilter] = useState('active');
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const { setClassroomColor, updateOrder, sortClassrooms, initialized } = useClassroomPreferences();
  const didFetch = useRef(false);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200, // ms to hold before drag starts
        tolerance: 5, // px movement allowed before drag
      },
    })
  );

  // Fetch classrooms only once per session/user
  useEffect(() => {
    if (!initialized || didFetch.current) return;
    const fetchAndOrderClassrooms = async () => {
      try {
        const response = await api.get('/api/classrooms/');
        let fetchedClassrooms = Array.isArray(response.data) ? response.data : [];
        fetchedClassrooms = sortClassrooms(fetchedClassrooms);
        setClassrooms(fetchedClassrooms);
        setError(null);
        didFetch.current = true;
      } catch {
        setError('Failed to fetch classrooms');
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAndOrderClassrooms();
  }, [initialized, sortClassrooms]);

  // Handle classroom creation success
  const handleClassroomCreated = async (newClassroom) => {
    try {
      // Fetch the latest classroom data to ensure student count is accurate
      const response = await api.get(`/api/classrooms/${newClassroom.id}/`);
      const updatedClassroom = response.data;

      // Update the classroom if it exists, otherwise add it
      setClassrooms(prev => {
        const exists = prev.some(c => c.id === updatedClassroom.id);
        if (exists) {
          return prev.map(c => c.id === updatedClassroom.id ? updatedClassroom : c);
        } else {
          return [...prev, {...updatedClassroom, order: prev.length}];
        }
      });
    } catch (err) {
      console.error('Error fetching updated classroom data:', err);
    }
  };

  // Handle classroom update success
  const handleClassroomUpdated = async (updatedClassroom) => {
    // Immediately update the classroom in the UI
    setClassrooms(prev => prev.map(classroom => 
      classroom.id === updatedClassroom.id ? updatedClassroom : classroom
    ));
  };

  // Handle classroom delete success
  const handleClassroomDeleted = async (deletedClassroomId) => {
    // Immediately remove the classroom from the UI
    setClassrooms(prev => prev.filter(classroom => classroom.id !== deletedClassroomId));
  };

  // Handle color change
  const handleColorChange = async (classroomId, newColor) => {
    try {
      setClassroomColor(classroomId, newColor);
      setOpenMenuId(null);
    } catch (err) {
      console.error('Error updating classroom color:', err);
      setError('Failed to update classroom color');
    }
  };

  // Handle hide toggle
  const handleHideToggle = async (classroomId) => {
    try {
      const classroom = classrooms.find(c => c.id === classroomId);
      await api.patch(`/api/classrooms/${classroomId}/`, {
        is_hidden: !classroom?.is_hidden
      });
      setClassrooms(prev =>
        prev.map(classroom =>
          classroom.id === classroomId ? { ...classroom, is_hidden: !classroom.is_hidden } : classroom
        )
      );
    } catch (error) {
      console.error('Error updating classroom visibility:', error);
      setError('Failed to update classroom visibility');
    }
    setOpenMenuId(null);
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    // Close any open menus when dragging starts
    setOpenMenuId(null);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const oldIndex = classrooms.findIndex(item => item.id.toString() === active.id);
      const newIndex = classrooms.findIndex(item => item.id.toString() === over.id);
      const reordered = arrayMove(classrooms, oldIndex, newIndex);
      setClassrooms(reordered);
      updateOrder(reordered);
    }
  };

  // Handle archive toggle
  const handleArchiveClassroom = async (classroomId, isArchived) => {
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
      
      setClassrooms(prev =>
        prev.map(classroom =>
          classroom.id === classroomId ? { ...classroom, is_archived: newArchiveStatus } : classroom
        )
      );
      
      // If unarchiving (changing from true to false), switch to active filter
      if (isArchived) {
        setFilter('active');
      }
    } catch (error) {
      console.error('Error updating archive status:', error.response?.data || error);
      setError('Failed to update archive status');
    }
    setOpenMenuId(null);
  };

  // Handle open menu
  const handleOpenMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleClick = (classroomId) => {
    navigate(`/t/classes/${classroomId}/`);
  };  

  // Filter classrooms
  const filteredClassrooms = filter === 'active'
    ? classrooms.filter(c => !c?.is_hidden && !c?.is_archived)
    : filter === 'hidden'
      ? classrooms.filter(c => c?.is_hidden && !c?.is_archived)
      : classrooms.filter(c => c?.is_archived);

  if (loading) {
    return (
      <div className="space-y-6 px-4 sm:px-6 max-w-full md:max-w-[95%] mx-auto">
        <ClassroomHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {[...Array(6)].map((_, i) => <ClassroomSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-red-500 mb-4">
          <i className="fa-solid fa-circle-exclamation text-3xl"></i>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Find active classroom for drag overlay
  const activeClassroom = classrooms.find(classroom => classroom.id.toString() === activeId);

  return (
    <div className="space-y-6 px-4 sm:px-6 max-w-full md:max-w-[95%] mx-auto  ">
      {/* Header */}
      <div className="bg-[#FFDF9F] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden min-h-[180px]">
        <div className="space-y-2 max-w-full sm:max-w-[65%]">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 leading-tight break-words">
            A space where hands speak,<br />
            minds grow, and futures shine!
          </h1>
          <p className="text-gray-700 text-base sm:text-lg">Start teaching today</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Create Classroom
          </button>
        </div>
        <div className="w-24 sm:w-40 h-24 sm:h-40 flex-shrink-0">
          <img src={pencilBook} alt="Learning" className="h-full w-auto object-contain mx-auto" />
        </div>
      </div>

      {/* Classrooms */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">All Classrooms</h2>
          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === 'filter' ? null : 'filter')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-[#4C53B4] hover:shadow-md transition-all duration-300 group"
            >
              <i className="fa-solid fa-filter text-gray-500 group-hover:text-[#4C53B4] transition-colors"></i>
              <span className="text-sm font-medium text-gray-700">
                {filter === 'active' ? 'All Classrooms' : filter === 'hidden' ? 'Hidden Classrooms' : 'Archived Classrooms'}
              </span>
              <i className="fa-solid fa-chevron-down text-xs text-gray-500 group-hover:text-[#4C53B4] transition-transform duration-300 group-hover:rotate-180"></i>
            </button>

            {/* Filter Menu */}
            {openMenuId === 'filter' && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => {
                    setFilter('active');
                    setOpenMenuId(null);
                  }}
                  className={`w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                    filter === 'active' ? 'text-[#4C53B4] font-medium' : 'text-gray-600'
                  }`}
                >
                  <i className={`fa-solid fa-check text-xs ${filter === 'active' ? 'opacity-100' : 'opacity-0'}`}></i>
                  <span>All Classrooms</span>
                </button>
                <button
                  onClick={() => {
                    setFilter('hidden');
                    setOpenMenuId(null);
                  }}
                  className={`w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                    filter === 'hidden' ? 'text-[#4C53B4] font-medium' : 'text-gray-600'
                  }`}
                >
                  <i className={`fa-solid fa-check text-xs ${filter === 'hidden' ? 'opacity-100' : 'opacity-0'}`}></i>
                  <span>Hidden Classrooms</span>
                </button>
                <button
                  onClick={() => {
                    setFilter('archived');
                    setOpenMenuId(null);
                  }}
                  className={`w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                    filter === 'archived' ? 'text-[#4C53B4] font-medium' : 'text-gray-600'
                  }`}
                >
                  <i className={`fa-solid fa-check text-xs ${filter === 'archived' ? 'opacity-100' : 'opacity-0'}`}></i>
                  <span>Archived Classrooms</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drag and Drop */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredClassrooms.map(c => c.id.toString())}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 relative">
              {filteredClassrooms.map((classroom) => (
                <SortableClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  handleOpenMenu={handleOpenMenu}
                  openMenuId={openMenuId}
                  handleColorChange={handleColorChange}
                  handleHideToggle={handleHideToggle}
                  setSelectedClassroom={setSelectedClassroom}
                  setIsUpdateModalOpen={setIsUpdateModalOpen}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                  setOpenMenuId={setOpenMenuId}
                  handleClick={handleClick}
                  handleArchiveClassroom={handleArchiveClassroom}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay adjustScale={true}>
            {activeId && activeClassroom ? (
              <div className="animate-pulse opacity-90 shadow-2xl scale-105">
                <ClassroomCard
                  classroom={activeClassroom}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Classroom Modal */}
      <CreateClassroomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleClassroomCreated}
      />

      {/* Update Classroom Modal */}
      <UpdateClassroom
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        classroom={selectedClassroom}
        onSuccess={handleClassroomUpdated}
      />

      {/* Delete Classroom Modal */}
      <DeleteClassroom
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classroom={selectedClassroom}
        onSuccess={handleClassroomDeleted}
      />
    </div>
  );
};

export default AllClasses;
