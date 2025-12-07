import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import api from '../../../api';
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
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [runConfetti, setRunConfetti] = useState(false);
  const totalPoints = Object.values(points).reduce((a, b) => a + (b || 0), 0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/profile/');
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && drillLeaderboard.length > 0) {
      const rank = drillLeaderboard.findIndex(item => item.id === user.id) + 1;
      setUserRank(rank);
      if (rank > 0 && rank <= 3) {
        setRunConfetti(true);
        setTimeout(() => setRunConfetti(false), 10000); // Stop confetti after 10 seconds
      }
    }
  }, [user, drillLeaderboard]);

  return (
    <div className="h-screen fixed inset-0 z-50 lg:grid lg:grid-cols-12" style={{ backgroundImage: `url(${drillBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      {/* Main Content Column */}
      <div className={`w-full transition-all duration-300 ${showLeaderboard ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
        {/* Header */}
        <div className="w-full flex items-center px-4 sm:px-8 pt-4 sm:pt-8 mb-4 sm:mb-8 gap-4 sm:gap-6 z-30 relative">
          <button
            type="button"
            className="bg-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
            onClick={onBack}
            aria-label="Exit drill"
            style={{ minWidth: 40, minHeight: 40 }}
          >
            <i className="fa-solid fa-arrow-left text-[#8e44ad] text-base sm:text-lg"></i>
          </button>
          <div className="flex-1 flex justify-center min-w-0">
            <div className="w-full max-w-[900px] bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
              <div className="bg-[#f39c12] h-3 sm:h-4 rounded-full transition-all" style={{ width: `100%` }}></div>
            </div>
          </div>
          <div className="text-sm sm:text-lg font-bold text-[#4C53B4] min-w-max text-right flex-shrink-0">
            Points: {totalPoints}
          </div>
        </div>

        {/* Congratulations Section */}
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-100px)] sm:h-[calc(100vh-150px)] px-4">
          <div className="flex flex-col items-center justify-center w-full max-w-xl bg-transparent rounded-2xl p-4 sm:p-10 animate-fadeIn">
            <div className="text-2xl sm:text-4xl mb-2 text-center text-gray-700" style={{ fontFamily: '"Fredoka One", cursive' }}>You got <span className="font-bold text-3xl sm:text-5xl text-[#f39c12]">{totalPoints}</span> points!</div>
            <img src={HippoHappy} alt="Hippo" className="w-32 sm:w-48 h-32 sm:h-48 mb-4 mx-auto" />
            <h2 className="text-2xl sm:text-4xl font-bold text-[#8e44ad] mb-4 text-center">Congratulations!</h2>
            <div className="text-lg sm:text-2xl mb-2 text-center">You've completed the drill!</div>
            <div className="flex gap-4 sm:gap-6 mt-6 sm:mt-8 justify-center flex-wrap">
              <button
                className="px-6 sm:px-12 py-3 sm:py-5 bg-[#4C53B4] text-white rounded-2xl text-base sm:text-2xl font-bold hover:bg-[#3a4095] shadow-lg"
                onClick={onRetake}
              >
                Retake Drill
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Column - Desktop */}
      <div className={`hidden lg:block transition-all duration-300 h-full absolute lg:relative top-0 right-0 ${showLeaderboard ? 'lg:w-auto lg:col-span-4' : 'w-0'} z-10`}>
        {showLeaderboard && (
          <div className="h-full bg-white/80 backdrop-blur-sm p-12 overflow-y-auto rounded-l-2xl">
            <Leaderboard
              drillLeaderboard={drillLeaderboard}
              loadingLeaderboard={loadingLeaderboard}
              leaderboardError={leaderboardError}
              onUserSelect={onUserSelect}
            />
          </div>
        )}
      </div>

      {/* Leaderboard Drawer - Mobile */}
      <div className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${showLeaderboard ? 'bg-black/40' : 'bg-black/0 pointer-events-none'}`} onClick={() => setShowLeaderboard(false)} />
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl transition-all duration-300 transform ${showLeaderboard ? 'translate-y-0' : 'translate-y-full'} max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <div className="px-4 pb-8">
          <Leaderboard
            drillLeaderboard={drillLeaderboard}
            loadingLeaderboard={loadingLeaderboard}
            leaderboardError={leaderboardError}
            onUserSelect={onUserSelect}
          />
        </div>
      </div>

      {/* Show Leaderboard Button - Mobile */}
      <button 
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="lg:hidden fixed bottom-6 right-6 bg-[#f39c12] text-white p-4 rounded-full shadow-lg hover:bg-[#e08a0a] transition-all z-40 flex items-center justify-center"
        aria-label="Toggle leaderboard"
      >
        <i className={`fa-solid ${showLeaderboard ? 'fa-chevron-down' : 'fa-trophy'} text-xl`}></i>
      </button>

      {/* Desktop toggle button */}
      <button 
        onClick={() => setShowLeaderboard(!showLeaderboard)}
        className="hidden lg:block absolute top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-3 rounded-full z-20 transition-all duration-300"
        style={{ right: showLeaderboard ? 'calc(33.33% - 1.5rem)' : '1rem' }}
      >
        <i className={`fa-solid ${showLeaderboard ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
      </button>

      {runConfetti && <Confetti recycle={false} width={typeof window !== 'undefined' ? window.innerWidth : 800} height={typeof window !== 'undefined' ? window.innerHeight : 600} />}
      
      {/* User details modal */}
      <UserModal user={selectedUser} onClose={onCloseUserModal} />
    </div>
  );
};

export default DrillSummary;
