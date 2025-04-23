import { useState, useEffect } from 'react';
import api from '../../api';

const UpdateClassroom = ({ isOpen, onClose, classroom, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch current classroom data when opened
  useEffect(() => {
    if (isOpen && classroom?.id) {
      const fetchClassroomData = async () => {
        setFetchingData(true);
        try {
          const response = await api.get(`/api/classrooms/${classroom.id}/`);
          setFormData({
            name: response.data.name || '',
            description: response.data.description || '',
          });
        } catch (err) {
          console.error('Error fetching classroom data:', err);
          setError('Failed to fetch classroom data');
        } finally {
          setFetchingData(false);
        }
      };
      
      fetchClassroomData();
    }
  }, [isOpen, classroom?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Classroom name is required');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/api/classrooms/${classroom.id}/`, formData);
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update classroom');
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

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Classroom</h2>

        {fetchingData ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4C53B4]"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
                placeholder="Enter classroom name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all h-32 resize-none"
                placeholder="Enter classroom description"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`
                  px-4 py-2 rounded-xl text-white font-semibold
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4]'
                  }
                  transition-all duration-200 transform hover:scale-[1.02]
                  flex items-center gap-2
                `}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Updating...
                  </>
                ) : (
                  'Update Classroom'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateClassroom;
