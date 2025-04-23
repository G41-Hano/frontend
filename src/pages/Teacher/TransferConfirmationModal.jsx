import { useState } from 'react';

const TransferConfirmationModal = ({ 
  isOpen, 
  onClose, 
  studentName, 
  classroomName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#4C53B4]/10 flex items-center justify-center">
            <i className="fa-solid fa-arrow-right-arrow-left text-[#4C53B4] text-xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Confirm Transfer</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to transfer <span className="font-medium text-gray-800">{studentName}</span> to <span className="font-medium text-gray-800">{classroomName}</span>?
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            No, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-xl bg-[#4C53B4] text-white hover:bg-[#3a4095] transition-all duration-300 transform hover:scale-105"
          >
            Yes, Transfer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferConfirmationModal; 