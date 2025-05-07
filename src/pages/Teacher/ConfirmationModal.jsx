import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 animate-softBounce"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-100/20 rounded-full"></div>
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-red-100/10 rounded-full"></div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i className="fa-solid fa-exclamation text-red-600 text-xl"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors transform hover:scale-110"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <p className="text-gray-600 mb-6 pl-13">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-all transform hover:scale-105 hover:bg-gray-50 rounded-xl"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-xmark"></i>
              No, Cancel
            </span>
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all transform hover:scale-105 hover:shadow-lg flex items-center gap-2 group"
          >
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-trash"></i>
              Yes, Remove
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 