import React from 'react';
import DrillHeader from './DrillHeader';
import Leaderboard from './Leaderboard';
import UserModal from './UserModal';
import HippoHappy from '../../../assets/MascotHippoHappy.gif';

const DrillSummary = ({ 
  drillBg,
  points,
  onBack,
  onRetake,
  drillLeaderboard,
  loadingLeaderboard,
  leaderboardError,
  selectedUser,
  onUserSelect,
  onCloseUserModal
}) => {
  const totalPoints = Object.values(points).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="min-h-screen fixed inset-0 z-50 overflow-y-auto" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      {/* Header always on top */}
      <div className="w-full flex items-center px-8 pt-8 mb-8 gap-6 z-30 relative">
        {/* Back button */}
        <button
          className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center"
          onClick={onBack}
          aria-label="Exit drill"
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <i className="fa-solid fa-arrow-left text-[#8e44ad] text-lg"></i>
        </button>
        {/* Progress bar */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="bg-[#f39c12] h-4 rounded-full transition-all" style={{ width: `100%` }}></div>
          </div>
        </div>
        {/* Points */}
        <div className="text-lg font-bold text-[#4C53B4] min-w-[90px] text-right">
          Points: {totalPoints}
        </div>
      </div>
      
      {/* Congratulations section centered, but with lower z-index so header is clickable */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="flex flex-col items-center justify-center w-full max-w-xl bg-transparent rounded-2xl p-10 animate-fadeIn pointer-events-auto">
          <img src={HippoHappy} alt="Hippo" className="w-48 h-48 mb-4 mx-auto" />
          <h2 className="text-4xl font-bold text-[#8e44ad] mb-4 text-center">Congratulations!</h2>
          <div className="text-2xl mb-2 text-center">You've completed the drill!</div>
          <div className="text-xl mb-6 text-center">Total Points: <span className="font-bold text-[#f39c12]">{totalPoints}</span></div>
          <div className="flex gap-6 mt-8 justify-center">
            <button
              className="px-12 py-5 bg-[#4C53B4] text-white rounded-2xl text-2xl font-bold hover:bg-[#3a4095] shadow-lg"
              onClick={onRetake}
            >
              Retake Drill
            </button>
          </div>
        </div>
      </div>
      
      {/* Leaderboard panel */}
      <Leaderboard
        drillLeaderboard={drillLeaderboard}
        loadingLeaderboard={loadingLeaderboard}
        leaderboardError={leaderboardError}
        onUserSelect={onUserSelect}
      />
      
      {/* User details modal */}
      <UserModal user={selectedUser} onClose={onCloseUserModal} />
    </div>
  );
};

export default DrillSummary;
