import { useState } from 'react';
import api, { importStudentsFromCsv } from '../../api';
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
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);

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
    setLoading(true);
    setError(null);
    setCsvError(null);
    setIsProcessingCsv(false);

    try {
      // 1. Create the classroom
      const classroomResponse = await api.post('/api/classrooms/', {
        name: formData.name,
        description: formData.description,
        color: formData.color
      });
      const classroomId = classroomResponse.data.id;

      // 2. Enroll selected students (manual)
      if (selectedStudents.length > 0) {
        try {
          await api.post(`/api/classrooms/${classroomId}/students/`, {
            student_ids: selectedStudents.map(s => s.id)
          });
        } catch (err) {
          setError('Some students could not be enrolled manually.');
        }
      }

      // 3. Import students from CSV if present
      if (csvFile) {
        setIsProcessingCsv(true);
        try {
          await importStudentsFromCsv(classroomId, csvFile);
        } catch (csvErr) {
          setCsvError(csvErr?.error || 'Failed to import students from CSV');
        } finally {
          setIsProcessingCsv(false);
        }
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

  // Add CSV processing function
  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);
    setCsvError(null);
    setIsProcessingCsv(false);
    console.log('CSV file selected:', file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl mx-auto relative">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 1 ? 'bg-[#4C53B4] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className="w-12 h-1 bg-gray-200">
            <div className={`h-full bg-[#4C53B4] transition-all ${
              step >= 2 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 2 ? 'bg-[#4C53B4] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className="w-12 h-1 bg-gray-200">
            <div className={`h-full bg-[#4C53B4] transition-all ${
              step === 3 ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step === 3 ? 'bg-[#4C53B4] text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {step === 1 ? 'Create New Classroom' : step === 2 ? 'Add Students' : 'Classroom Created!'}
        </h2>

        {step === 1 ? (
          // Step 1: Basic Information
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                placeholder="e.g., Math Class 2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all h-24 resize-none"
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
                className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] transition-all duration-200 transform hover:scale-[1.02]"
              >
                Next Step
              </button>
            </div>
          </form>
        ) : step === 2 ? (
          // Step 2: Add Students
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Import Students from CSV
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-3
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#4C53B4] file:text-white
                      hover:file:bg-[#3a4095]"
                  />
                  {isProcessingCsv && (
                    <div className="text-sm text-gray-500">
                      <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
                      Processing...
                    </div>
                  )}
                </div>
                {csvError && (
                  <div className="text-red-500 text-sm">
                    {csvError}
                  </div>
                )}
                {csvFile && !csvError && (
                  <div className="text-green-500 text-sm">
                    <i className="fa-solid fa-check mr-2"></i>
                    CSV file loaded successfully
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Students
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                  placeholder="Search by name or username..."
                />
              </div>
            </div>

            <div className="h-[200px] overflow-y-auto border border-gray-200 rounded-xl">
              {isLoadingStudents ? (
                <div className="p-3 text-center text-gray-500">
                  <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
                  Loading students...
                </div>
              ) : !availableStudents || availableStudents.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
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
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedStudents.some(s => s.id === student.id)
                          ? 'bg-[#4C53B4] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        if (selectedStudents.some(s => s.id === student.id)) {
                          setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
                        } else {
                          setSelectedStudents(prev => [...prev, student]);
                        }
                      }}
                    >
                      {student.avatar ? (
                        <img 
                          src={student.avatar}
                          alt={student.first_name?.[0] || student.username[0]}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#4C53B4] flex items-center justify-center text-white text-sm font-medium">
                          {student.first_name?.[0]?.toUpperCase() || student.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{student.first_name} {student.last_name}</div>
                        <div className="text-sm opacity-75">@{student.username}</div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => createClassroom(true)} // SKIP enrolling students
                  className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    px-4 py-2 rounded-xl text-white font-semibold text-sm
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
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl flex items-center justify-center text-green-500 transform rotate-3 hover:rotate-0 transition-all duration-300">
              <i className="fa-solid fa-check text-3xl"></i>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-800">
                Classroom Created!
              </h3>
              <p className="text-gray-600">
                Share this class code with your students
              </p>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gray-50 rounded-2xl blur-md opacity-30 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-2xl">
                <div className="text-xs text-[#4C53B4] mb-0.5">CLASS CODE</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-bold text-[#4C53B4] tracking-wider">
                    {createdClassroom?.class_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-[#4C53B4]/70 hover:text-[#4C53B4] transition-colors p-1 hover:bg-[#4C53B4]/5 rounded-lg"
                    title="Copy to clipboard"
                  >
                    <i className={`fa-regular ${isCopied ? 'fa-check-circle text-[#4C53B4]' : 'fa-copy'}`}></i>
                  </button>
                </div>
                {isCopied && (
                  <div className="text-[#4C53B4] text-xs mt-0.5 animate-fadeIn">
                    Copied to clipboard!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4] transition-all duration-200 transform hover:scale-[1.02] text-sm"
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