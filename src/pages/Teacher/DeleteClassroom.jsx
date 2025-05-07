import { useState } from 'react';
import api from '../../api';

const DeleteClassroom = ({ isOpen, onClose, classroom, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/classrooms/${classroom.id}/`);
      if (onSuccess) {
        onSuccess(classroom.id);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete classroom');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 relative animate-scaleIn">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <i className="fa-solid fa-trash text-2xl"></i>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">Delete Classroom</h2>
          <p className="text-gray-600">
            Are you sure you want to delete "{classroom.name}"? This action cannot be undone.
          </p>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className={`
                px-4 py-2 rounded-xl text-white font-semibold
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
                }
                transition-all duration-200 transform hover:scale-[1.02]
                flex items-center gap-2
              `}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Deleting...
                </>
              ) : (
                'Delete Classroom'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteClassroom;
