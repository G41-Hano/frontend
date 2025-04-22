import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import pencilBook from '../assets/pencil_book.png';

const CLASSROOM_COLORS = ['#7D83D7', '#E79051', '#A6CB00', '#FE93AA', '#FBC372']; //Classroom Colors

const MyClasses = () => {
  const [filter, setFilter] = useState('active');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [classCode, setClassCode] = useState('');

  // Fetch student's enrolled classrooms
  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await api.get('/api/classrooms/');
      setClassrooms(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError(err.response?.data?.error || 'Failed to fetch classrooms');
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle joining classroom with code
  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await api.post('/api/classrooms/join/', { 
        class_code: classCode 
      });
      
      // Response contains classroom info on success
      if (response.data.classroom_id) {
        await fetchClassrooms(); // Refresh the list
        setClassCode('');
        setIsJoinModalOpen(false);
      } else {
        setError(response.data.error || 'Failed to join classroom');
      }
    } catch (error) {
      console.error('Error joining classroom:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Failed to join classroom. Please check your class code.');
    }
  };

  //Handle Color Change
  const handleColorChange = (classroomId, newColor) => {
    setClassrooms(prevClassrooms =>                                 //Update Classroom Color
      prevClassrooms.map(classroom =>
        classroom.id === classroomId ? { ...classroom, color: newColor } : classroom 
      )
    );
    setOpenMenuId(null); 
  };

  //Handle Hide Toggle
  const handleHideToggle = (classroomId) => {
    setClassrooms(prevClassrooms =>                                 //Update Classroom Visibility
      prevClassrooms.map(classroom =>
        classroom.id === classroomId ? { ...classroom, isHidden: !classroom.isHidden } : classroom
      )
    );
    setOpenMenuId(null);
  };

  //Handle Drag and Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(classrooms);
    const [reorderedItem] = items.splice(result.source.index, 1);    //Remove Item
    items.splice(result.destination.index, 0, reorderedItem);       //Insert Item
    setClassrooms(items);                                           //Update Classroom Order
  };

  //Filter Classrooms
  const filteredClassrooms = filter === 'active'                    //Filter Active or Hidden Classrooms
    ? classrooms.filter(c => !c.isHidden)                          //Show Active Classrooms
    : classrooms.filter(c => c.isHidden);                          //Show Hidden Classrooms

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
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
          onClick={fetchClassrooms}
          className="px-4 py-2 bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

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
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Droppable */}
          <Droppable 
            droppableId="classrooms"
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {/* Draggable */}
                {filteredClassrooms.map((classroom, index) => (
                  <Draggable key={classroom.id.toString()} draggableId={classroom.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        {/* Classroom Card */}
                        <div
                          style={{ backgroundColor: classroom.color }}
                          className="rounded-3xl p-4 hover:shadow-2xl transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden min-h-[200px] flex flex-col justify-between group hover:-translate-y-1"
                        >
                          {/* Menu Button */}
                          <div className="absolute top-3 right-3 z-10">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === classroom.id ? null : classroom.id)}
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
                                      onClick={() => handleColorChange(classroom.id, color)}  //Change Classroom Color
                                      className="w-5 h-5 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>

                                {/* Hide Classroom Button */}
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                  <button
                                    onClick={() => handleHideToggle(classroom.id)}
                                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <i className={`fa-solid ${classroom.isHidden ? 'fa-eye' : 'fa-eye-slash'} text-gray-500`}></i> 
                                    {classroom.isHidden ? 'Show Classroom' : 'Hide Classroom'}
                                  </button>
                                </div>
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
                                <p className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">{classroom.teacher_name}</p>
                              </div>
                            </div>

                            {/* Student Count */}
                            <div className="flex items-center gap-2 text-white/80">
                              <i className="fa-solid fa-users"></i>
                              <span>{classroom.student_count} students</span>
                            </div>
                          </div>

                          {/* Decorative Circles */}
                          <div className="absolute right-0 bottom-0 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4">
                            <div className="w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10 absolute -bottom-20 sm:-bottom-24 -right-20 sm:-right-24 transition-transform duration-500 group-hover:scale-110"></div>
                            <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 transition-transform duration-500 group-hover:scale-125"></div>
                          </div>
                          <div className="absolute left-1/2 top-1/2 transition-transform duration-500 group-hover:rotate-45">
                            <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-white/10 absolute -translate-x-1/2 -translate-y-1/2"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder} {/* Placeholder for Draggable Items */}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Join Classroom Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 relative animate-scaleIn">
            <button 
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6">Join a Classroom</h2>

            <form onSubmit={handleJoinClassroom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Class Code
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                  placeholder="Enter your class code here"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] transition-all duration-200 transform hover:scale-[1.02]"
              >
                Join Classroom
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClasses;
