import { useState } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';

const CreateClassroomModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    studentIds: [],
    color: '#7D83D7' // Default color
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [createdClassroom, setCreatedClassroom] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch available students
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log('Token:', token); // Debug log

      if (!token) {
        throw new Error('No access token found');
      }

      const response = await api.get('/api/userlist/', {
        params: { role: 'student' }
      });

      console.log('API Response:', response.data); // Debug log

      if (!response.data) {
        throw new Error('No data received from API');
      }

      setAvailableStudents(response.data);
      
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      setError(error.response?.data?.error || 'Failed to fetch students');
      setAvailableStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Handle form submission for step 1
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Classroom name is required');
      return;
    }
    setError(null);
    await fetchStudents(); // Wait for students to be fetched
    setStep(2);
  };

  // Handle final submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      setError('Please add at least one student to the classroom');
      return;
    }
    await createClassroom();
  };

  // Handle skip (create classroom without students)
  const handleSkip = async () => {
    setLoading(true);
    setError(null);
    await createClassroom(true);
  };

  // Create classroom helper function
  const createClassroom = async (skipStudents = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // First create the classroom
      const classroomResponse = await api.post('/api/classrooms/', {
        name: formData.name,
        description: formData.description,
        color: formData.color
      });

      // Then add students if any are selected and we're not skipping
      if (!skipStudents && selectedStudents.length > 0) {
        await api.post(`/api/classrooms/${classroomResponse.data.id}/students/`, {
          student_ids: selectedStudents.map(s => s.id)
        });
      }

      setCreatedClassroom(classroomResponse.data);
      if (onSuccess) {
        onSuccess(classroomResponse.data);
      }
      setStep(3); // Move to success step
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when closed
  const handleClose = () => {
    // Only call onSuccess if the classroom was created
    if (createdClassroom) {
      onSuccess(createdClassroom);
    }
    
    // Close the modal
    onClose();
    
    // Reset the form after closing
    setTimeout(() => {
      setStep(1);
      setFormData({
        name: '',
        description: '',
        studentIds: [],
        color: '#7D83D7'
      });
      setSelectedStudents([]);
      setSearchTerm('');
      setError(null);
      setCreatedClassroom(null);
      setIsCopied(false);
    }, 300); // Slight delay to ensure animation completes
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdClassroom?.class_code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl mx-auto relative animate-scaleIn">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
            step === 1 ? 'bg-[#4C53B4] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className="w-12 md:w-16 h-1 bg-gray-200">
            <div className={`h-full bg-[#4C53B4] transition-all ${
              step >= 2 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
            step === 2 ? 'bg-[#4C53B4] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className="w-12 md:w-16 h-1 bg-gray-200">
            <div className={`h-full bg-[#4C53B4] transition-all ${
              step === 3 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
            step === 3 ? 'bg-[#4C53B4] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>

        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
          {step === 1 ? 'Create New Classroom' : step === 2 ? 'Add Students' : 'Classroom Created!'}
        </h2>

        {step === 1 ? (
          // Step 1: Basic Information
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                placeholder="e.g., Math Class 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all h-32 resize-none"
                placeholder="Add a description for your classroom..."
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] transition-all duration-200 transform hover:scale-[1.02]"
              >
                Next Step
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          // Step 2: Add Students
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                placeholder="Search by name or username..."
              />
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
              {isLoadingStudents ? (
                <div className="p-4 text-center text-gray-500">
                  <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
                  Loading students...
                </div>
              ) : !availableStudents || availableStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No students found
                </div>
              ) : (
                Array.isArray(availableStudents) && availableStudents
                  .filter(student => 
                    student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(student => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4C53B4] flex items-center justify-center text-white text-sm md:text-base">
                          {student.first_name?.[0] || student.username[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">
                            {student.first_name ? `${student.first_name} ${student.last_name}` : student.username}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500">@{student.username}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedStudents.find(s => s.id === student.id)) {
                            setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
                          } else {
                            setSelectedStudents(prev => [...prev, student]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg transition-colors text-sm md:text-base ${
                          selectedStudents.find(s => s.id === student.id)
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-[#4C53B4]/10 text-[#4C53B4] hover:bg-[#4C53B4]/20'
                        }`}
                      >
                        {selectedStudents.find(s => s.id === student.id) ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  ))
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 md:px-6 py-2 md:py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleSkip();
                  }}
                  className="px-4 md:px-6 py-2 md:py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-4 md:px-6 py-2 md:py-3 rounded-xl text-white font-semibold text-sm md:text-base
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4]'
                    }
                    transition-all duration-200 transform hover:scale-[1.02]
                    flex items-center gap-2
                  `}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch animate-spin"></i>
                      Creating...
                    </>
                  ) : (
                    'Create Classroom'
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          // Step 3: Success
          <div className="text-center space-y-6">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <i className="fa-solid fa-check text-2xl md:text-3xl"></i>
            </div>
            
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                Classroom Created Successfully!
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Share this class code with your students:
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl flex items-center justify-center gap-3">
              <span className="text-lg md:text-xl font-mono font-bold text-[#4C53B4]">
                {createdClassroom?.class_code}
              </span>
              <button
                onClick={handleCopyCode}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy to clipboard"
              >
                <i className={`fa-regular ${isCopied ? 'fa-check-circle' : 'fa-copy'}`}></i>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] transition-all duration-200 transform hover:scale-[1.02] text-sm md:text-base"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateClassroomModal;
