import React from 'react';

const ExitConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 shadow-lg max-w-sm w-full text-center animate-bounceIn">
        <h2 className="text-2xl font-bold mb-4">Are you sure?</h2>
        <p className="text-gray-600 mb-6">You will lose your current progress if you exit now.</p>
        <div className="flex justify-center gap-4">
          <button 
            type="button"
            onClick={onCancel} 
            className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onConfirm} 
            className="px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;
