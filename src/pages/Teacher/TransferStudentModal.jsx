import { useState, useEffect } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';
import TransferConfirmationModal from './TransferConfirmationModal';
import TransferSuccessModal from './TransferSuccessModal';
import { useNotifications } from '../../contexts/NotificationContext';
import { useUser } from '../../contexts/UserContext';

const TransferStudentModal = ({ isOpen, onClose, classroomId, studentToTransfer, onTransferSuccess }) => {
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const { refreshNotifications } = useNotifications();
  const { user } = useUser();

  useEffect(() => {
    if (isOpen && studentToTransfer) {
      fetchAvailableClassrooms();
    }
  }, [isOpen, studentToTransfer]);

  const fetchAvailableClassrooms = async () => {
    if (!studentToTransfer?.id) {
      setError('Student information is required');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await api.get('/api/transfer-requests/available-classrooms/', {
        params: {
          student_id: studentToTransfer.id
        }
      });
      
      if (!response.data) {
        throw new Error('No data received from API');
      }

      const filteredClassrooms = Array.isArray(response.data) 
        ? response.data.filter(classroom => classroom.id !== classroomId)
        : [];

      setAvailableClassrooms(filteredClassrooms);
      setError(null);
    } catch (error) {
      console.error('Error fetching available classrooms:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.error || 'Failed to fetch classrooms. Please try again.');
      setAvailableClassrooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const validateTransferRequest = () => {
    // Check if user is a teacher
    if (user?.role !== 'teacher') {
      setError('Only teachers can request student transfers');
      return false;
    }

    // Check if target classroom is selected
    if (!selectedClassroom) {
      setError('Please select a target classroom');
      return false;
    }

    // Check if source and target classrooms are different
    if (classroomId === selectedClassroom.id) {
      setError('Source and target classrooms must be different');
      return false;
    }

    return true;
  };

  const handleClassroomSelect = (classroom) => {
    setSelectedClassroom(classroom);
    setIsConfirmationOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedClassroom || !studentToTransfer) return;

    // Validate the transfer request
    if (!validateTransferRequest()) {
      setIsConfirmationOpen(false);
      return;
    }

    // Create transfer request with the exact fields expected by the backend
    const requestData = {
      student: parseInt(studentToTransfer.id),
      from_classroom: parseInt(classroomId),
      to_classroom: parseInt(selectedClassroom.id),
      reason: `Transferring ${studentToTransfer?.name || 'Student'}`,
      requested_by: user.id // Add the current user's ID
    };

    try {
      console.log('Sending transfer request:', requestData); // Debug log

      // Make sure we're sending the request with the correct headers
      const response = await api.post('/api/transfer-requests/', requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the full response for debugging
      console.log('Full response:', response);

      // The response will include additional fields from the serializer
      const { 
        student_name, 
        from_classroom_name, 
        to_classroom_name, 
        requested_by_name,
        status,
        created_at,
        updated_at
      } = response.data;

      console.log('Transfer request created:', response.data); // Debug log

      setIsConfirmationOpen(false);
      setIsSuccessOpen(true);
      onTransferSuccess();
      refreshNotifications(); // Refresh notifications after creating request
      
      // Close the main modal after success
      setTimeout(() => {
        setIsSuccessOpen(false);
        onClose();
      }, 3000);
    } catch (error) {
      // Enhanced error logging
      console.error('Error during transfer request:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: requestData,
        headers: error.response?.headers,
        config: error.config
      });
      
      // Handle specific validation errors from the backend
      if (error.response?.data?.non_field_errors) {
        setError(error.response.data.non_field_errors[0]);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data) {
        // Handle field-specific validation errors
        const errorMessages = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Failed to create transfer request');
      }
      setIsConfirmationOpen(false);
    }
  };

  const handleCancelTransfer = () => {
    setIsConfirmationOpen(false);
    setSelectedClassroom(null);
  };

  const filteredClassrooms = availableClassrooms.filter(classroom =>
    classroom.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h2 className="text-2xl font-bold text-gray-800">Request Student Transfer</h2>
            <button
              onClick={onClose}
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

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search classrooms..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
              />
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <i className="fa-solid fa-circle-notch animate-spin text-[#4C53B4] text-2xl"></i>
            </div>
          ) : filteredClassrooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classrooms found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClassrooms.map(classroom => (
                <div
                  key={classroom.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${selectedClassroom?.id === classroom.id
                      ? 'border-[#4C53B4] bg-[#4C53B4]/5'
                      : 'border-gray-100 hover:border-[#4C53B4]/50'
                    }`}
                  onClick={() => handleClassroomSelect(classroom)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#4C53B4] flex items-center justify-center text-white">
                      {classroom.name[0]}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {classroom.name}
                      </h3>
                      <p className="text-sm text-gray-500">{classroom.description}</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedClassroom?.id === classroom.id
                      ? 'border-[#4C53B4] bg-[#4C53B4]'
                      : 'border-gray-300'
                    }`}
                  >
                    {selectedClassroom?.id === classroom.id && (
                      <i className="fa-solid fa-check text-white text-xs"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TransferConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        studentName={`${studentToTransfer?.name}`}
        classroomName={selectedClassroom?.name}
        onConfirm={handleConfirmTransfer}
        onCancel={handleCancelTransfer}
      />

      <TransferSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        studentName={`${studentToTransfer?.name}`}
        classroomName={selectedClassroom?.name}
      />
    </>
  );
};

export default TransferStudentModal; 