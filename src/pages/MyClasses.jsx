import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import pencilBook from '../assets/pencil_book.png';

const CLASSROOM_COLORS = ['#7D83D7', '#E79051', '#A6CB00', '#FE93AA', '#FBC372'];

const MyClasses = () => {
  const [filter, setFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);

  // Temporary classroom data
  const [classrooms, setClassrooms] = useState([
    {
      id: 1,
      name: 'Mahogany SY2425',
      students: 5,
      section: 'Mahogany',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop',
      color: '#7D83D7',
      studentAvatars: [
        { id: 1, initials: 'JD', name: 'John Doe' },
        { id: 2, initials: 'MS', name: 'Mary Smith' },
        { id: 3, initials: 'RJ', name: 'Robert Johnson' },
        { id: 4, initials: 'AL', name: 'Amy Lee' },
        { id: 5, initials: 'WW', name: 'Walter White' }
      ]
    },
    {
      id: 2,
      name: 'Narra SY2425',
      students: 3,
      section: 'Narra',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop',
      color: '#E79051',
      studentAvatars: [
        { id: 6, initials: 'PW', name: 'Peter Wang' },
        { id: 7, initials: 'SK', name: 'Sarah Kim' },
        { id: 8, initials: 'MT', name: 'Mike Thompson' }
      ]
    },
    {
      id: 3,
      name: 'Molave SY2425',
      students: 4,
      section: 'Molave',
      image: null,
      color: '#A6CB00',
      studentAvatars: [
        { id: 9, initials: 'EJ', name: 'Emma Jones' },
        { id: 10, initials: 'LM', name: 'Liam Miller' },
        { id: 11, initials: 'OD', name: 'Olivia Davis' },
        { id: 12, initials: 'BW', name: 'Ben Wilson' }
      ]
    }
  ]);

  // Handle color change
  const handleColorChange = (classroomId, newColor) => {
    setClassrooms(prevClassrooms =>
      prevClassrooms.map(classroom =>
        classroom.id === classroomId ? { ...classroom, color: newColor } : classroom
      )
    );
    setOpenMenuId(null);
  };

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(classrooms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setClassrooms(items);
  };

  // Filter classrooms
  const filteredClassrooms = filter === 'all'
    ? classrooms
    : classrooms.filter(c => c.section.toLowerCase() === filter.toLowerCase());

  return (
    // Main container
    <div className="space-y-6 px-4 sm:px-6 max-w-full md:max-w-[95%] mx-auto">
      {/* Hero Section */}
      <div className="bg-[#FFDF9F] rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden min-h-[180px]">
        <div className="space-y-2 max-w-full sm:max-w-[65%]">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 leading-tight break-words">
            A space where hands speak,<br />
            minds grow, and futures shine!
          </h1>
          <p className="text-gray-700 text-base sm:text-lg">Start learning today</p>
        </div>
        <div className="w-42 sm:w-56 h-32 sm:h-48 flex-shrink-0">
          <img src={pencilBook} alt="Learning" className="h-full w-auto object-contain mx-auto" />
        </div>
      </div>

      {/* Classrooms Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">All Classrooms</h2>
          {/* Filter Section */}
          <div className="relative w-full sm:w-60">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full appearance-none px-10 py-2 pr-12 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#4C53B4]/20 focus:border-[#4C53B4] cursor-pointer shadow-md text-sm"
            >
              <option value="all">All</option>
              <option value="mahogany">Mahogany</option>
              <option value="narra">Narra</option>
              <option value="molave">Molave</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex gap-2 text-gray-500">
              <i className="fa-solid fa-chevron-down"></i>
            </div>
            <i className="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable 
            droppableId="classrooms"
            isDropDisabled={false} 
            isCombineEnabled={false} 
            ignoreContainerClipping={false} 
            >
            {/* Droppable Container */}
            {(provided) => (
              <div
                ref={provided.innerRef} 
                {...provided.droppableProps} 
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {/* Draggable Items */}
                {filteredClassrooms.map((classroom, index) => (
                  <Draggable 
                    key={classroom.id.toString()} 
                    draggableId={classroom.id.toString()}
                    index={index}
                    >
                    {/* Draggable Inner Container */}
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
                          className="rounded-3xl p-4 hover:shadow-2xl transition-all duration-300 ease-in-out cursor-move relative overflow-hidden min-h-[200px] flex flex-col justify-between group hover:-translate-y-1"
                        >
                          <div className="absolute top-3 right-3 z-10">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === classroom.id ? null : classroom.id)} // Toggle color picker menu
                              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
                            >
                              <i className="fa-solid fa-ellipsis-vertical text-sm transition-transform group-hover:rotate-90"></i>
                            </button>

                            {/* Color Picker Menu */}
                            {openMenuId === classroom.id && (
                              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn">
                                <div className="px-4 py-2 text-sm text-gray-700 font-medium">Choose Color</div>
                                <div className="grid grid-cols-5 gap-2 px-4 pb-2">
                                  {CLASSROOM_COLORS.map((color, index) => (
                                    <button
                                      key={index}
                                      onClick={() => handleColorChange(classroom.id, color)} // Change color
                                      className="w-5 h-5 rounded-full hover:scale-110 transition-all duration-300 hover:shadow-lg"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
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

                              {/* Classroom Name and Student Count */}
                              <div className="transform transition-all duration-300 group-hover:translate-x-1">
                                <h3 className="text-lg sm:text-xl font-semibold text-white">{classroom.name}</h3>
                                <p className="text-white/80 text-sm group-hover:text-white transition-colors duration-300">{classroom.students} students</p>
                              </div>
                            </div>

                            {/* Student Avatars */}
                            <div className="flex -space-x-2">
                              {classroom.studentAvatars.slice(0, 3).map((student) => ( // Map through the first 3 students
                                <div
                                  key={student.id}
                                  className="w-10 h-10 rounded-full bg-[#4C53B4] border-2 border-white flex items-center justify-center text-white text-xs font-medium transform transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:z-10 group"
                                  title={student.name}
                                >
                                  {student.initials} 
                                </div>
                              ))}
                              {classroom.studentAvatars.length > 3 && ( // If there are more than 3 students, show the number of students in the classroom
                                <div 
                                  className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm border-2 border-white flex items-center justify-center text-white text-xs font-medium transform transition-all duration-300 hover:scale-110 hover:translate-y-[-2px] hover:z-10"
                                  title={`${classroom.studentAvatars.length - 3} more students`} // Title for the number of students in the classroom
                                >
                                  +{classroom.studentAvatars.length - 3} {/* Number of students in the classroom */}
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
                {provided.placeholder} {/* Placeholder for drag and drop */}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default MyClasses;
