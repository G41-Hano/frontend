import { useState, useEffect, useRef } from 'react';
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
import JoinClassroomModal from './JoinClassroomModal';
import { useNavigate } from 'react-router-dom';
import { useClassroomPreferences } from '../../contexts/ClassroomPreferencesContext';
import { ClassroomSkeleton, ClassroomHeaderSkeleton } from '../../components/loading';


const CLASSROOM_COLORS = ['#7D83D7', '#E79051', '#A6CB00', '#FE93AA', '#FBC372']; //Classroom Colors

// Sortable Classroom Card Component
const SortableClassroomCard = ({ classroom, handleOpenMenu, openMenuId, handleColorChange, handleHideToggle, handleClick, unansweredDrills }) => {
  const { getClassroomColor } = useClassroomPreferences();
  const classroomColor = getClassroomColor(classroom.id) || classroom.student_color || classroom.color || '#7D83D7';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: classroom.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-0' : 'z-10'} relative cursor-pointer`}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          handleClick(classroom.id);
        }
      }}
      {...attributes}
      {...listeners}
    >
      {/* Unanswered Drills Indicator */}
      {unansweredDrills[classroom.id] > 0 && (
        <div className="absolute top-5 left-20 z-20">
          <div className="bg-white text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
            <span> You have {unansweredDrills[classroom.id]} unanswered drill{unansweredDrills[classroom.id] > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Menu Button */}
      <div className="absolute top-3 right-3 z-20">
        <button
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
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
            <div className="px-4 py-2 text-sm text-gray-700 font-medium">Choose Color</div>
            <div className="grid grid-cols-5 gap-2 px-4 pb-2">
              {/* Color Options */}
              {CLASSROOM_COLORS.map((color, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorChange(classroom.id, color);
                  }}
                  className="w-5 h-5 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Hide Classroom Button */}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHideToggle(classroom.id);
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <i className={`fa-solid ${classroom.is_hidden ? 'fa-eye' : 'fa-eye-slash'} text-gray-500`}></i> 
                {classroom.is_hidden ? 'Show Classroom' : 'Hide Classroom'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Body (clickable, not draggable) */}
      <div
        style={{ backgroundColor: classroomColor }}
        className={`rounded-3xl p-4 shadow-xl transition-all duration-300 ease-in-out relative overflow-hidden min-h-[200px] flex flex-col justify-between group hover:-translate-y-1 ${
          isDragging ? 'shadow-2xl cursor-grabbing' : ''
        }`}
      >
        {/* Classroom Details */}
        <div className="space-y-6 relative z-10">
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
                  <img 
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
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
        <div className="absolute right-0 bottom-0">
          <div className="w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10 absolute -bottom-20 sm:-bottom-24 -right-20 sm:-right-24"></div>
          <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6"></div>
        </div>
        <div className="absolute left-1/2 top-1/2">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/10 absolute -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

const ClassroomCard = ({ classroom }) => {
  return (
    <div
      style={{ backgroundColor: classroom.student_color || classroom.color }}
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
                <img 
                  src={student.avatar}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
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

const MyClasses = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('active');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [unansweredDrills, setUnansweredDrills] = useState({}); // Track unanswered drills per classroom
  const { setClassroomColor, updateOrder, sortClassrooms, initialized } = useClassroomPreferences();
  const didFetch = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200, // ms to hold before drag starts
        tolerance: 5, // px movement allowed before drag
      },
    })
  );

  // Function to check for unanswered drills in each classroom
  const checkUnansweredDrills = async (classrooms) => {
    const unansweredData = {};
    
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
        
        // Check which drills the student hasn't answered
        const unansweredCount = await Promise.all(
          openDrills.map(async (drill) => {
            try {
              // Check if student has any results for this drill
              const resultsResponse = await api.get(`/api/drills/${drill.id}/results/student/`);
              const results = resultsResponse.data || [];
              
              // If no results, it's unanswered
              return results.length === 0;
            } catch (error) {
              // If error fetching results, assume it's unanswered
              return true;
            }
          })
        );
        
        unansweredData[classroom.id] = unansweredCount.filter(Boolean).length;
      } catch (error) {
        console.error(`Error checking drills for classroom ${classroom.id}:`, error);
        unansweredData[classroom.id] = 0;
      }
    }
    
    setUnansweredDrills(unansweredData);
  };

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
        
        // Check for unanswered drills after classrooms are loaded
        await checkUnansweredDrills(fetchedClassrooms);
      } catch {
        setError('Failed to fetch classrooms');
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAndOrderClassrooms();
  }, [initialized, sortClassrooms]);

  // Handle joining classroom with code
  const handleJoinSuccess = async () => {
    try {
      // Get the updated list of classrooms
      const response = await api.get('/api/classrooms/');
      let fetchedClassrooms = Array.isArray(response.data) ? response.data : [];
      
      // If we have existing classrooms, make sure new ones are added to the end
      if (classrooms.length > 0) {
        // Find the new classroom(s) by comparing with current state
        const existingIds = new Set(classrooms.map(c => c.id));
        const newClassrooms = fetchedClassrooms.filter(c => !existingIds.has(c.id));
        
        // Get the highest current order value
        const maxOrder = Math.max(...classrooms.map(c => c.order || 0), 0);
        
        // Update order values for new classrooms to place them at the end
        for (const newClassroom of newClassrooms) {
          try {
            // Set order to maxOrder + index + 1 to ensure it's at the end
            await api.patch(`/api/classrooms/${newClassroom.id}/`, {
              order: maxOrder + 1 + newClassrooms.indexOf(newClassroom)
            });
          } catch (err) {
            console.error('Error updating order for new classroom:', err);
          }
        }
      }
      
      // Fetch all classrooms again to get updated order values
      const finalResponse = await api.get('/api/classrooms/');
      let finalClassrooms = Array.isArray(finalResponse.data) ? finalResponse.data : [];
      
      // Sort by order field
      finalClassrooms.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      
      setClassrooms(finalClassrooms);
      
      // Refresh unanswered drills data for all classrooms
      await checkUnansweredDrills(finalClassrooms);
    } catch (error) {
      console.error('Error refreshing classrooms:', error);
    }
  };

  //Handle Color Change
  const handleColorChange = async (classroomId, newColor) => {
    try {
      setClassroomColor(classroomId, newColor);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error updating classroom color:', error);
      setError('Failed to update classroom color');
    }
  };

  //Handle Hide Toggle
  const handleHideToggle = async (classroomId) => {
    try {
      const classroom = classrooms.find(c => c.id === classroomId);
      if (!classroom) return;
      
      await api.patch(`/api/classrooms/${classroomId}/`, {
        is_hidden: !classroom.is_hidden
      });
      
      setClassrooms(prevClassrooms =>
      prevClassrooms.map(classroom =>
          classroom.id === classroomId ? { ...classroom, is_hidden: !classroom.is_hidden } : classroom
      )
    );
    } catch (error) {
      console.error('Error updating classroom visibility:', error);
      setError('Failed to update classroom visibility');
    }
    setOpenMenuId(null);
  };

  // Handle drag start event
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    // Close any open menus when dragging starts
    setOpenMenuId(null);
  };

  // Handle drag end event
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

  // Handle open menu 
  const handleOpenMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleClick = (classroomId) => {
    navigate(`/s/classes/${classroomId}/`);
  };

  const getNoClassroomsMessage = (filter) => {
    switch (filter) {
      case 'hidden':
        return {
          title: 'No Hidden Classrooms',
          message: 'You have not hidden any classrooms yet.'
        };
      default:
        return {
          title: 'No Classrooms Found',
          message: 'Join a new classroom to get started.'
        };
    }
  };

  //Filter Classrooms
  const filteredClassrooms = filter === 'active'
    ? classrooms.filter(c => !c.is_hidden && !c.is_archived)  // Show only active, non-archived classrooms
    : classrooms.filter(c => c.is_hidden && !c.is_archived);  // Show only hidden, non-archived classrooms

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
          onClick={() => {
            const fetchAndOrderClassrooms = async () => {
              try {
                const response = await api.get('/api/classrooms/');
                let fetchedClassrooms = Array.isArray(response.data) ? response.data : [];
                
                // Get saved order from localStorage
                const savedOrder = localStorage.getItem('classroomOrder');
                if (savedOrder) {
                  const order = JSON.parse(savedOrder);
                  // Sort classrooms based on saved order
                  fetchedClassrooms.sort((a, b) => {
                    const indexA = order.indexOf(a.id);
                    const indexB = order.indexOf(b.id);
                    return indexA - indexB;
                  });
                }
                
                setClassrooms(fetchedClassrooms);
                setError(null);
              } catch (err) {
                console.error('Error fetching classrooms:', err.response?.data || err);
                setError('Failed to fetch classrooms');
                setClassrooms([]);
              } finally {
                setLoading(false);
              }
            };
            fetchAndOrderClassrooms();
          }}
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
    <div className="space-y-6 px-4 sm:px-6 max-w-full md:max-w-[95%] mx-auto">
      {/* Header */}
      <div className="bg-[#FFDF9F] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden min-h-[180px]">
        <div className="space-y-2 max-w-full sm:max-w-[65%]">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 leading-tight break-words">
            A space where hands speak,<br />
            minds grow, and futures shine!
          </h1>
          <p className="text-gray-700 text-base sm:text-lg">Start learning today</p>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            <i className="fa-solid fa-plus mr-2"></i>
            Join Classroom
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
                {filter === 'active' ? 'All Classrooms' : 'Hidden Classrooms'}
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
                  }`} //Filter Active Classrooms
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
                  }`} //Filter Hidden Classrooms
                >
                  <i className={`fa-solid fa-check text-xs ${filter === 'hidden' ? 'opacity-100' : 'opacity-0'}`}></i>
                  <span>Hidden Classrooms</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClassrooms.length > 0 ? (
                filteredClassrooms.map((classroom) => (
                  <SortableClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    handleOpenMenu={handleOpenMenu}
                    openMenuId={openMenuId}
                    handleColorChange={handleColorChange}
                    handleHideToggle={handleHideToggle}
                    handleClick={handleClick}
                    unansweredDrills={unansweredDrills}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <div className="mb-4">
                    <i className="fa-solid fa-school-circle-xmark text-4xl text-gray-400"></i>
                  </div>
                  <h3 className="text-xl font-medium">{getNoClassroomsMessage(filter).title}</h3>
                  <p>{getNoClassroomsMessage(filter).message}</p>
                </div>
              )}
            </div>
          </SortableContext>

          {/* Drag Overlay for active item */}
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

      {/* Join Classroom Modal */}
      <JoinClassroomModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={handleJoinSuccess}
      />
    </div>
  );
};

export default MyClasses;
