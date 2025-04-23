import { useState, useEffect } from 'react';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';
import TransferConfirmationModal from './TransferConfirmationModal';
import TransferSuccessModal from './TransferSuccessModal';

const TransferStudentModal = ({ isOpen, onClose, classroomId, studentToTransfer, onTransferSuccess }) => {
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableClassrooms();
    }
  }, [isOpen]);

  const fetchAvailableClassrooms = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await api.get('/api/classrooms/');
      
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

  const handleClassroomSelect = (classroom) => {
    setSelectedClassroom(classroom);
    setIsConfirmationOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!selectedClassroom || !studentToTransfer) return;

    try {
      console.log('Checking student enrollment:', {
        studentId: studentToTransfer.id,
        classroomId: selectedClassroom.id
      });

      // First check if student is already in the target classroom
      const checkResponse = await api.get(`/api/classrooms/${selectedClassroom.id}/students/`);
      const isAlreadyEnrolled = Array.isArray(checkResponse.data) 
        ? checkResponse.data.some(student => student.id === studentToTransfer.id)
        : false;

      console.log('Student enrollment status:', {
        isAlreadyEnrolled,
        targetClassroom: selectedClassroom.name
      });

      if (!isAlreadyEnrolled) {
        // If student is not in target classroom, remove from current and add to new
        console.log('Removing student from current classroom:', classroomId);
        await api.delete(`/api/classrooms/${classroomId}/students/`, {
          data: { student_ids: [studentToTransfer.id] }
        });

        console.log('Adding student to new classroom:', selectedClassroom.id);
        await api.post(`/api/classrooms/${selectedClassroom.id}/students/`, {
          student_ids: [studentToTransfer.id]
        });
      } else {
        console.log('Student already enrolled in target classroom, skipping transfer');
      }

      setIsConfirmationOpen(false);
      setIsSuccessOpen(true);
      onTransferSuccess();
      
      // Close the main modal after success
      setTimeout(() => {
        setIsSuccessOpen(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error during transfer process:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.error || 'Failed to process student transfer');
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
            <h2 className="text-2xl font-bold text-gray-800">Transfer Student</h2>
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