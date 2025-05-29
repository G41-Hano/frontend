import { useSuccessModal } from '../contexts/SuccessModalContext';
import {useState} from 'react';
import EnrollmentLog from '../pages/Teacher/EnrollmentLog';

const SuccessModal = () => {
  const { showSuccess, successType, successData, hideSuccessModal } = useSuccessModal();
  const [showEnrollmentLog, setShowEnrollmentLog] = useState(false)

  const getIcon = () => {
    switch (successType) {
      case 'enroll':
        return 'user-plus';
      case 'remove':
        return 'user-minus';
      case 'transfer':
        return 'user-arrow-right';
      case 'update-classroom':
        return 'pen';
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
      case 'update-classroom':
        return 'Classroom details updated successfully';
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
            {successType === 'update-classroom' && getMessage()}
          </p>
          {
            showEnrollmentLog &&
            <EnrollmentLog enrolledNames={successData?.enrolledNames} notEnrolledNames={successData?.notEnrolledNames}/>
          }
          <div className="flex justify-center gap-3 mt-3">
            {
              successType === 'enroll' && (
                <button
                  onClick={()=>setShowEnrollmentLog(prev => !prev)}
                  className="px-6 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  {showEnrollmentLog ? "Hide student enrollment log" : "Show student enrollment log"}
                </button>
              )
            }
            
            <button
              onClick={()=>{hideSuccessModal(); setShowEnrollmentLog(false)}}
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
    </div>
  );
};

const StudentDrillSuccessModal = ({ open, score, maxScore, onGoToClasses, onGoToLeaderboard, className = "" }) => {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center ${className}`}>
      <div
        className="bg-white shadow-2xl border-4 w-[520px] max-w-[98vw] flex flex-col items-center animate-fadeIn"
        style={{ borderRadius: 24, borderColor: '#781B86' }}
      >
        {/* Header */}
        <div
          className="w-full"
          style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            background: '#8A2799'
          }}
        >
          <div className="flex flex-col items-center py-6">
            <span className="text-5xl mb-2">🏆</span>
            <h2 className="text-3xl font-extrabold text-white text-center mb-1" style={{ fontFamily: 'Baloo, sans-serif' }}>
              Drill Completed!
            </h2>
            <p className="text-white text-center text-base font-semibold">
              Congratulations on finishing the drill!
            </p>
          </div>
        </div>
        {/* Score */}
        <div className="flex flex-col items-center py-8 w-full bg-[#F6F2FF]">
          <span className="text-5xl font-extrabold text-green-500 mb-2" style={{ fontFamily: 'Baloo, sans-serif' }}>
            {score}
          </span>
          <span className="text-lg text-gray-600">Points</span>
        </div>
        {/* Buttons */}
        <div className="flex gap-4 w-full justify-center pb-8">
          <button
            onClick={onGoToClasses}
            className="bg-[#FBE18F] text-[#4C53B4] font-bold px-8 py-3 rounded-full shadow hover:bg-yellow-300 transition text-lg w-44"
            style={{ fontFamily: 'Baloo, sans-serif' }}
          >
            Go to My Classes
          </button>
          <button
            onClick={onGoToLeaderboard}
            className="bg-[#FBE18F] text-[#4C53B4] font-bold px-8 py-3 rounded-full shadow hover:bg-yellow-300 transition text-lg w-44"
            style={{ fontFamily: 'Baloo, sans-serif' }}
          >
            Go to Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
export { StudentDrillSuccessModal }; 