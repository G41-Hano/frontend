import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import pencilBook from '../../assets/pencil_book.png';

const CLASSROOM_COLORS = ['#7D83D7', '#E79051', '#A6CB00', '#FE93AA', '#FBC372']; //Classroom Colors

const MyClasses = () => {
  const [filter, setFilter] = useState('active');
  const [openMenuId, setOpenMenuId] = useState(null);

  //Temporary Classroom Data
  const [classrooms, setClassrooms] = useState([
    {
      id: 1,
      name: 'Mahogany SY2425',
      students: 3,
      section: 'Mahogany',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop',
      color: '#7D83D7',
      isHidden: false,
      studentAvatars: [
        { id: 1, name: 'John Smith', initials: 'JS' },
        { id: 2, name: 'Maria Garcia', initials: 'MG' },
        { id: 3, name: 'David Chen', initials: 'DC' }
      ]
    },
    {
      id: 2,
      name: 'Narra SY2425',
      students: 5,
      section: 'Narra',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop',
      color: '#E79051',
      isHidden: false,
      studentAvatars: [
        { id: 4, name: 'Sarah Johnson', initials: 'SJ' },
        { id: 5, name: 'Michael Lee', initials: 'ML' },
        { id: 6, name: 'Emma Wilson', initials: 'EW' },
        { id: 7, name: 'James Brown', initials: 'JB' },
        { id: 8, name: 'Lisa Anderson', initials: 'LA' }
      ]
    },
    {
      id: 3,
      name: 'Molave SY2425',
      students: 4,
      section: 'Molave',
      image: null,
      color: '#A6CB00',
      isHidden: false,
      studentAvatars: [
        { id: 9, name: 'James Brown', initials: 'JB' },
        { id: 10, name: 'Lisa Anderson', initials: 'LA' },
        { id: 11, name: 'Robert Taylor', initials: 'RT' },
        { id: 12, name: 'John Smith', initials: 'JS' }
      ]
    }
  ]);

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
                type="submit"
                className="btn w-full rounded-3xl bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] text-white border-none py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mt-3"
            > + Create Classroom
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
                                <p className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">{classroom.students} students</p>
                              </div>
                            </div>

                            {/* Student Avatars */}
                            <div className="flex -space-x-2">
                              {classroom.studentAvatars.slice(0, 3).map((student) => (  //Show First 3 Students
                                <div
                                  key={student.id}
                                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-[#4C53B4] border-2 border-white flex items-center justify-center text-white text-[10px] sm:text-xs font-medium transform transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:z-10 group relative"
                                  title={student.name}
                                >
                                  {student.initials}
                                </div>
                              ))}
                              {classroom.students > 3 && (  //if more than 3 students, show +3
                                <div 
                                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center text-white text-[10px] sm:text-xs font-medium transform transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:z-10"
                                  title={`${classroom.students - 3} more students`} 
                                >
                                  +{classroom.students - 3}  
                                </div>
                              )}
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
    </div>
  );
};

export default MyClasses;
