import { useState, useEffect, useRef } from 'react';
import api, { importStudentsFromCsv } from '../../api';
import { ACCESS_TOKEN } from '../../constants';
import { useSuccessModal } from '../../contexts/SuccessModalContext';

const EnrollStudentsModal = ({ isOpen, onClose, classroomId, onEnrollSuccess, students }) => {
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showSelectedStudents, setShowSelectedStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { showSuccessModal } = useSuccessModal();
  const [csvFile, setCsvFile] = useState(null);
  const [csvError, setCsvError] = useState(null);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);
  const [enrolledNames, setEnrolledNames] = useState([]);
  const [notEnrolledNames, setNotEnrolledNames] = useState([]);
  const [showEnrollmentLog, setShowEnrollmentLog] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedMethod, setSelectedMethod] = useState("add")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      resetModal()
      fetchAvailableStudents();
    }
  }, [isOpen]);

  const resetModal = () => {
    setSelectedStudents([]);
    setSearchTerm('');
    setError(null);
    setAvailableStudents([]);
    setIsLoading(false);
    setCsvError(false)
    setShowSelectedStudents(false)
    setEnrolledNames([])
    setNotEnrolledNames([])
    setShowEnrollmentLog(false);
    setSelectedMethod("add")
    setCsvFile(null)
    setIsSubmitting(false)
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

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Ensure we have arrays to work with
      const allStudents = Array.isArray(response.data) ? response.data : [];
      const enrolledStudents = Array.isArray(students) ? students : [];

      // Get IDs of enrolled students
      const enrolledStudentIds = enrolledStudents.map(student => student.id);
      
      // Filter out enrolled students
      let filteredStudents = allStudents.filter(student => !enrolledStudentIds.includes(student.id));
      filteredStudents = [...filteredStudents].sort((a, b) => a.last_name.localeCompare(b.last_name))

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


  // with call to API
  const handleEnroll = async () => {
    setIsSubmitting(true);
    if (selectedStudents.length === 0) return;
    
    try {
      await api.post(`/api/classrooms/${classroomId}/students/`, {
        student_ids: selectedStudents.map(s => s.id)
      });
      const enrolledCount = selectedStudents.length;
      onEnrollSuccess();
      handleClose();
      // Show success modal after closing the main modal
      setTimeout(() => {
        showSuccessModal('enroll', { 
          count: enrolledCount, 
          "enrolledNames": selectedStudents.map(s => `${s.last_name}, ${s.first_name}`),
          "notEnrolledNames": []
        });
      }, 300);
    } catch (error) {
      console.error('Error enrolling students:', error);
      setError(error.response?.data?.error || 'Failed to enroll students');
    }
    setIsSubmitting(false);
    
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
  
  // with call to API
  const handleImportCsv = async () => {
    if (!csvFile) {
      setCsvError('Please select a CSV file.');
      return;
    }
    setIsSubmitting(true);
    setIsProcessingCsv(true);
    setCsvError(null);
    setCsvSuccess(false);
    let response = []
    try {

      response = await importStudentsFromCsv(classroomId, csvFile)

      setCsvFile(null);
      setIsProcessingCsv(false);
      setCsvError(null);
      setCsvSuccess(true);
      // fetchAvailableStudents(); // Refresh the list
      setCsvSuccess(false);
      onEnrollSuccess()
      handleClose();
      // Show success modal after closing the main modal
      setTimeout(() => {
        showSuccessModal('enroll', { 
          count: 'CSV', 
          "enrolledNames": response?.data?.enrolled,
          "notEnrolledNames": response?.data?.['not-enrolled']
        });
      }, 300);
    } catch (err) {
      setCsvError('Failed to import students from CSV.');
      if (err?.status == 404) { // Names in CSV does not exist in system
        setCsvError('All names in the CSV are invalid or they are already enrolled');
        setNotEnrolledNames(err?.data?.['not-enrolled']);
      }
      setIsProcessingCsv(false);
      setCsvSuccess(false);
    }
    setIsSubmitting(false);
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
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl space-y-5"
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

          {/* SELECT METHOD */}
          <label className="text-sm font-semibold text-gray-700">Choose Method</label>
          <select
            disabled={isLoading}
            id="students"
            name="students"
            value={selectedMethod}
            onChange={(e)=>{setSelectedMethod(e.target.value); setCsvFile(null); setSelectedStudents([])}}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
          >
            <option value="add">Select students</option>
            <option value="csv">Import by CSV</option>
          </select>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-3">

            {/* IMPORT CSV */}
            {
              selectedMethod === 'csv' ? (
                <div>
                  {/* CSV INFO LABEL  */}
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Import Students from CSV
                    </label>
                    <div className="flex items-center justify-center rounded-full w-5 h-5 
                      border-1 border-solid border-gray-700 relative group
                    hover:bg-[#4C53B4]/50 transition-all duration-200 cursor-pointer">
                      <i className="fa-solid fa-info fa-xs text-gray-700"/>
                      <div className="absolute left-full w-45 ml-2 px-2 py-1 text-xs text-center text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        CSV file must have this as the first row:
                        <table className="m-2 flex justify-center ">
                          <thead>
                            <tr>
                              <td className='border-1 border-solid rounded-lg p-1'>First Name</td>
                              <td className='border-1 border-solid rounded-lg p-1'>Last Name</td>
                            </tr>
                          </thead>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      disabled={isSubmitting}
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="w-fit text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-3
                                file:rounded-xl file:border-0
                                file:text-sm file:font-semibold
                                file:bg-[#4C53B4] file:text-white
                                hover:file:bg-[#3a4095]"
                    />
                    <div className="cursor-pointer h-full justify-center" onClick={()=>{
                      setCsvFile(null); 
                      setCsvError(null); 
                      if(fileInputRef.current) {fileInputRef.current.value = ''}}}>
                      <i className="flex-1 fa-solid fa-xmark text-gray-500 hover:text-gray-700"/>
                    </div>
                    {/* <button
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
                    </button> */}
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
              ) : (
                // SELECT STUDENTS
                <>
                  {/* SEARCH SECTION  */}
                  <div>
                    <div className="flex gap-2 mb-1 items-center ">
                      <label className="w-fit text-sm font-medium text-gray-700">
                        Search Students
                      </label>
                      <label className="flex-1 text-sm text-left text-gray-700 ">
                        { selectedStudents.length > 0 && `${selectedStudents.length} selected`}
                      </label>
                      <button type="button" onClick={()=>{setShowSelectedStudents(prev => !prev)}}
                      className={`p-3 py-0 text-sm font-semibold  ${showSelectedStudents ? "bg-[#4C53B4] text-white" : "bg-[#EEF1F5] text-[#4C53B4]"} rounded-lg hover:bg-[#4C53B4] hover:text-white transition-all duration-300 flex items-center gap-2 justify-center`}
                      >Show selected</button>
                      <button type="button" onClick={()=>{setSelectedStudents([]); setShowSelectedStudents(false)}}
                      className="p-3 py-0 text-sm font-semibold text-[#4C53B4] bg-[#EEF1F5] rounded-lg hover:bg-[#4C53B4] hover:text-white transition-all duration-300 flex items-center gap-2 justify-center"
                      >Clear</button>
                    </div>
                    <div className="relative">
                      <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or username..."
                        // className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                        disabled={isSubmitting}
                      />
                    </div>

                  </div>

                  {/* STUDENT LIST */}
                  <div className="h-[250px] overflow-y-auto border border-gray-200 rounded-xl">
                  
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
                        {filteredStudents.filter(student => {
                          const matchesSearch = searchTerm.trim() === '' || (
                            student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
                          );

                          const isSelected = selectedStudents.some(s => s.id === student.id);

                          if (searchTerm.trim()) {
                            // If searching
                            return matchesSearch && (!showSelectedStudents || isSelected);
                          } else {
                            // If not searching
                            return showSelectedStudents ? isSelected : true;
                          }
                        })
                        .map(student => (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between p-4 py-3 m-0.5 rounded-xl border-2 transition-all cursor-pointer
                              ${selectedStudents.some(s => s.id === student.id)
                                ? 'border-[#4C53B4] bg-[#4C53B4]/5'
                                : 'border-gray-100 hover:border-[#4C53B4]/50'
                              }`}
                            onClick={() => {
                              if (!isSubmitting) {
                                if (selectedStudents.some(s => s.id === student.id)) {
                                  setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
                                } else {
                                  setSelectedStudents(prev => [...prev, student]);
                                }
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
                              <div className="w-10 h-10 rounded-full bg-[#4C53B4] flex items-center justify-center text-white">
                                {student.first_name?.[0]?.toUpperCase() || student.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="ml-3 flex-1">
                              <h3 className="font-medium text-gray-800">
                                {student.first_name} {student.last_name}
                              </h3>
                              <p className="text-sm text-gray-500 opacity-75">@{student.username}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${selectedStudents.some(s => s.id === student.id)
                                ? 'border-[#4C53B4] bg-[#4C53B4]'
                                : 'border-gray-300'
                              }`}
                            >
                              {selectedStudents.some(s => s.id === student.id) && (
                                <i className="fa-solid fa-check text-white text-xs"></i>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )
            }
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={()=>{selectedMethod === "csv" ? handleImportCsv() : handleEnroll()}}
              disabled={(selectedStudents.length === 0 && !csvFile) || isSubmitting}
              className={`px-6 py-2 rounded-xl text-white transition-all
                ${(selectedStudents.length === 0 && !csvFile) || isSubmitting
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#4C53B4] hover:bg-[#3a4095] cursor-pointer'
                }`}
            >
              {
                isSubmitting ? (
                  <i className="fa-solid fa-circle-notch animate-spin"/>
                ) : (
                  "Enroll"
                )
              }

            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrollStudentsModal; 