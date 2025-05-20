import { useSuccessModal } from '../contexts/SuccessModalContext';

const SuccessModal = () => {
  const { showSuccess, successType, successData, hideSuccessModal } = useSuccessModal();

  const getIcon = () => {
    switch (successType) {
      case 'enroll':
        return 'user-plus';
      case 'remove':
        return 'user-minus';
      case 'transfer':
        return 'user-arrow-right';
      default:
        return 'check-circle';
    }
  };

  const getMessage = () => {
    const student =
      successData.studentName || successData.name || 'Student';
    switch (successType) {
      case 'enroll':
        return `Successfully enrolled ${successData.count} student${successData.count > 1 ? 's' : ''}`;
      case 'remove':
        return `Successfully removed ${student} from the classroom`;
      case 'transfer':
        return `Successfully transferred ${student} to the new classroom`;
      default:
        return 'Operation completed successfully';
    }
  };

  if (!showSuccess) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <i className={`fa-solid fa-${getIcon()} text-3xl text-green-500`}></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">
            {successType === 'remove' && (
              <span>
                <span className="font-medium text-gray-800">
                  {successData.studentName || 'Student'}
                </span> has been successfully removed from the classroom.
              </span>
            )}
            {successType === 'enroll' && getMessage()}
            {successType === 'transfer' && getMessage()}
            {successType === 'default' && getMessage()}
          </p>
          <button
            onClick={hideSuccessModal}
            className="px-6 py-2 bg-[#4C53B4] text-white rounded-xl hover:bg-[#3a4095] transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-check"></i>
              Close
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 