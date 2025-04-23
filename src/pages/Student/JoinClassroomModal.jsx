import React, { useState } from 'react';
import api from '../../api';

const JoinClassroomModal = ({ isOpen, onClose, onSuccess }) => {
  const [classCode, setClassCode] = useState('');
  const [joinStatus, setJoinStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    setError(null);
    setJoinStatus('joining');
    try {
      await api.post('/api/classrooms/join/', { 
        class_code: classCode 
      });
      setJoinStatus('success');
      onSuccess();
      setTimeout(() => {
        setClassCode('');
        onClose();
        setJoinStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Error joining classroom:', error.response?.data || error.message);
      setJoinStatus('error');
      setError(error.response?.data?.detail || error.response?.data?.error || 'Failed to join classroom. Please check your class code.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4 relative animate-scaleIn">
        <button 
          onClick={() => {
            onClose();
            setJoinStatus(null);
            setError(null);
          }}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Join a Classroom</h2>

        <form onSubmit={handleJoinClassroom} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Class Code
            </label>
            <input
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#4C53B4] focus:ring-2 focus:ring-[#4C53B4]/20 transition-all"
              placeholder="Enter your class code here"
              required
              disabled={joinStatus === 'joining'}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          {joinStatus === 'success' && (
            <div className="text-green-500 text-sm flex items-center gap-2">
              <i className="fa-solid fa-check-circle"></i>
              Successfully joined the classroom!
            </div>
          )}

          <button
            type="submit"
            disabled={joinStatus === 'joining'}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-[1.02] ${
              joinStatus === 'joining' 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#4C53B4] to-[#6f75d6] hover:from-[#3a4095] hover:to-[#5c63c4]'
            }`}
          >
            {joinStatus === 'joining' ? (
              <>
                <i className="fa-solid fa-circle-notch animate-spin mr-2"></i>
                Joining...
              </>
            ) : (
              'Join Classroom'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinClassroomModal;
