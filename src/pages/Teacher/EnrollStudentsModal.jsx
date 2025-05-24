import { useState, useEffect } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';
import { useSuccessModal } from '../../contexts/SuccessModalContext';

const EnrollStudentsModal = ({ isOpen, onClose, classroomId, onEnrollSuccess }) => {
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const { showSuccessModal } = useSuccessModal();
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableStudents();
    }
  }, [isOpen]);

  const resetModal = () => {
    setSelectedStudents([]);
    setSearchTerm('');
    setError(null);
    setAvailableStudents([]);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const fetchAvailableStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        throw new Error('No access token found');
      }

      // Fetch all students
      const response = await api.get('/api/userlist/', {
        params: { role: 'student' }
      });

      console.log('All Students Response:', response.data);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Fetch enrolled students
      const classroomResponse = await api.get(`/api/classrooms/${classroomId}/students/`);
      console.log('Enrolled Students Response:', classroomResponse.data);

      // Ensure we have arrays to work with
      const allStudents = Array.isArray(response.data) ? response.data : [];
      const enrolledStudents = Array.isArray(classroomResponse.data) ? classroomResponse.data : 
                            Array.isArray(classroomResponse.data?.students) ? classroomResponse.data.students : [];

      // Get IDs of enrolled students
      const enrolledStudentIds = enrolledStudents.map(student => student.id);
      
      // Filter out enrolled students
      const filteredStudents = allStudents.filter(student => !enrolledStudentIds.includes(student.id));

      console.log('Filtered Students:', filteredStudents);
      setAvailableStudents(filteredStudents);
      setError(null);
    } catch (error) {
      console.error('Error fetching available students:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.error || 'Failed to fetch students. Please try again.');
      setAvailableStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleEnroll = async () => {
    if (selectedStudents.length === 0) return;

    try {
      await api.post(`/api/classrooms/${classroomId}/students/`, {
        student_ids: selectedStudents
      });
      const enrolledCount = selectedStudents.length;
      resetModal();
      onEnrollSuccess();
      onClose();
      // Show success modal after closing the main modal
      setTimeout(() => {
        showSuccessModal('enroll', { count: enrolledCount });
      }, 300);
    } catch (error) {
      console.error('Error enrolling students:', error);
      setError(error.response?.data?.error || 'Failed to enroll students');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetModal();
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    setCsvFile(file);
    setCsvError(null);
    setCsvSuccess(false);
  };

  const handleImportCsv = async () => {
    if (!csvFile) {
      setCsvError('Please select a CSV file.');
      return;
    }
    setIsProcessingCsv(true);
    setCsvError(null);
    setCsvSuccess(false);
    try {
      await api.post(
        `/api/classrooms/${classroomId}/import-students/`,
        (() => {
          const formData = new FormData();
          formData.append('csv_file', csvFile);
          return formData;
        })()
      );
      setCsvFile(null);
      setIsProcessingCsv(false);
      setCsvError(null);
      setCsvSuccess(true);
      fetchAvailableStudents(); // Refresh the list
      showSuccessModal('enroll', { count: 'CSV' });
      // Close the modal after a short delay
      setTimeout(() => {
        setCsvSuccess(false);
        handleClose();
      }, 1500);
    } catch (err) {
      setCsvError('Failed to import students from CSV.');
      setIsProcessingCsv(false);
      setCsvSuccess(false);
    }
  };

  const filteredStudents = availableStudents.filter(student =>
    student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div 
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Enroll Students</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Import Students from CSV
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#4C53B4] file:text-white hover:file:bg-[#3a4095]"
                key={csvFile ? csvFile.name : ''} // Reset input after import
              />
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={isProcessingCsv || !csvFile}
                className={`px-3 py-2 rounded-xl text-white font-semibold text-sm
                  ${isProcessingCsv || !csvFile
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4]'}
                  transition-all duration-200 transform hover:scale-[1.02]
                  flex items-center gap-2
                `}
              >
                {isProcessingCsv ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-csv mr-1"></i>
                    Import CSV
                  </>
                )}
              </button>
            </div>
            {csvFile && !isProcessingCsv && !csvSuccess && (
              <div className="text-green-600 text-sm mt-1 flex items-center gap-2">
                <i className="fa-solid fa-check-circle"></i>
                {csvFile.name} ready to import
              </div>
            )}
            {csvError && (
              <div className="text-red-500 text-sm mt-1">
                {csvError}
              </div>
            )}
            {csvSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm mt-1 animate-fade-in">
                <i className="fa-solid fa-circle-check text-lg"></i>
                Students imported successfully!
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <i className="fa-solid fa-circle-notch animate-spin text-[#4C53B4] text-2xl"></i>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map(student => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${selectedStudents.includes(student.id)
                      ? 'border-[#4C53B4] bg-[#4C53B4]/5'
                      : 'border-gray-100 hover:border-[#4C53B4]/50'
                    }`}
                  onClick={() => handleStudentSelect(student.id)}
                >
                  <div className="flex items-center gap-4">
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
                      <div className="w-10 h-10 rounded-full bg-[#4C53B4] flex items-center justify-center text-white">
                        {student.first_name?.[0] || student.username[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">@{student.username}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedStudents.includes(student.id)
                      ? 'border-[#4C53B4] bg-[#4C53B4]'
                      : 'border-gray-300'
                    }`}
                  >
                    {selectedStudents.includes(student.id) && (
                      <i className="fa-solid fa-check text-white text-xs"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEnroll}
              disabled={selectedStudents.length === 0}
              className={`px-6 py-2 rounded-xl text-white transition-all
                ${selectedStudents.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#4C53B4] hover:bg-[#3a4095]'
                }`}
            >
              Enroll Selected ({selectedStudents.length})
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrollStudentsModal; 