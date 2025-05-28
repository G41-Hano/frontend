import { useState, useEffect } from 'react';

const TransferSuccessModal = ({ 
  isOpen, 
  onClose, 
  studentName, 
  classroomName 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div 
        className={`bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-500
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <i className="fa-solid fa-check text-green-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Transfer Request Sent!</h2>
        </div>

        <p className="text-gray-600">
          <span className="font-medium text-gray-800">{studentName}</span> will be transferred to <span className="font-medium text-gray-800">{classroomName} upon request</span>.
        </p>
      </div>
    </div>
  );
};

export default TransferSuccessModal; 